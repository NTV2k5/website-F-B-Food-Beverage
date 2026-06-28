import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderStatus, PaymentStatus } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { EventsGateway } from '../events/events.gateway';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private eventsGateway: EventsGateway,
  ) {}

  async createOrder(userId: string, dto: CreateOrderDto) {
    let discountAmount = 0;
    let coupon = null;

    if (dto.couponCode) {
      coupon = await this.prisma.coupon.findUnique({
        where: { code: dto.couponCode.toUpperCase(), isActive: true },
      });

      if (!coupon) {
        throw new BadRequestException('Invalid coupon');
      }

      if (coupon.maxUsage && coupon.usedCount >= coupon.maxUsage) {
        throw new BadRequestException('Coupon expired');
      }

      if (coupon.expiresAt && new Date() > coupon.expiresAt) {
        throw new BadRequestException('Coupon expired');
      }
    }

    const products = await this.prisma.product.findMany({
      where: { id: { in: dto.items.map(i => i.productId) }, isAvailable: true },
      include: { optionGroups: { include: { options: true } } },
    });

    if (products.length !== dto.items.length) {
      throw new BadRequestException('Some products are unavailable');
    }

    let subtotal = 0;
    const orderItems = dto.items.map((item) => {
      const product = products.find(p => p.id === item.productId)!;
      let itemPrice = product.basePrice.toNumber();

      item.selectedOptions.forEach((selected) => {
        const group = product.optionGroups.find(g => g.id === selected.groupId);
        const option = group?.options.find(o => o.id === selected.optionId);
        if (option) {
          itemPrice += option.extraPrice.toNumber();
        }
      });

      const itemTotal = itemPrice * item.quantity;
      subtotal += itemTotal;

      return {
        productId: item.productId,
        productName: product.name,
        quantity: item.quantity,
        unitPrice: itemPrice,
        selectedOptions: item.selectedOptions as any,
        note: item.note,
        subtotal: itemTotal,
      };
    });

    if (coupon) {
      if (coupon.type === 'PERCENT') {
        discountAmount = subtotal * (coupon.value.toNumber() / 100);
      } else {
        discountAmount = coupon.value.toNumber();
      }
    }

    const totalAmount = subtotal + dto.shippingFee - discountAmount;

    const orderNumber = `DH${Date.now().toString().slice(-8)}`;

    const order = await this.prisma.order.create({
      data: {
        orderNumber,
        userId,
        status: OrderStatus.PENDING_PAYMENT,
        subtotal,
        shippingFee: dto.shippingFee,
        discountAmount,
        totalAmount,
        paymentMethod: dto.paymentMethod,
        paymentStatus: PaymentStatus.PENDING,
        couponId: coupon?.id,
        deliveryAddress: dto.deliveryAddress as any,
        deliveryLat: dto.deliveryAddress.lat,
        deliveryLng: dto.deliveryAddress.lng,
        note: dto.note,
        items: { create: orderItems },
        statusLogs: {
          create: {
            status: OrderStatus.PENDING_PAYMENT,
          },
        },
      },
      include: { items: { include: { product: true } } },
    });

    if (coupon) {
      await this.prisma.coupon.update({
        where: { id: coupon.id },
        data: { usedCount: { increment: 1 } },
      });
    }

    await this.prisma.cartItem.deleteMany({ where: { userId } });

    // Notify admin of new order
    this.eventsGateway.notifyNewOrder(order);

    return {
      order,
      paymentInfo: dto.paymentMethod === 'SEPAY' ? this.generateSePayPayment(order) : null,
    };
  }

  private generateSePayPayment(order: any) {
    const bankCode = this.configService.get<string>('SEPAY_BANK_CODE');
    const accountNo = this.configService.get<string>('SEPAY_ACCOUNT_NO');
    const accountName = this.configService.get<string>('SEPAY_ACCOUNT_NAME');

    const qrContent = `bankCode=${bankCode}&accountNo=${accountNo}&accountName=${encodeURIComponent(accountName!)}&amount=${order.totalAmount}&description=${order.orderNumber}`;
    const qrUrl = `https://img.vietqr.io/image/${bankCode}-${accountNo}-compact2.png?amount=${order.totalAmount}&addInfo=${order.orderNumber}`;

    return {
      qrUrl,
      qrContent,
      transactionCode: order.orderNumber,
      amount: order.totalAmount,
      expiryMinutes: 10,
    };
  }

  async getOrders(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: { items: { include: { product: true } }, statusLogs: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getOrderById(userId: string, orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: { include: { product: true } }, statusLogs: true, paymentHistory: true },
    });

    if (!order || order.userId !== userId) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async handleSePayWebhook(data: any) {
    const transactionCode = data.description?.match(/DH\d{8}/)?.[0];
    if (!transactionCode) {
      return { success: false, message: 'No transaction code found' };
    }

    const order = await this.prisma.order.findUnique({
      where: { orderNumber: transactionCode },
    });

    if (!order) {
      return { success: false, message: 'Order not found' };
    }

    if (order.paymentStatus === PaymentStatus.PAID) {
      return { success: true, message: 'Already processed' };
    }

    const amountMatches = Math.abs(data.amount - order.totalAmount.toNumber()) < 100;
    if (!amountMatches) {
      return { success: false, message: 'Amount mismatch' };
    }

    await this.prisma.$transaction([
      this.prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: PaymentStatus.PAID,
          status: OrderStatus.CONFIRMED,
          paidAt: new Date(),
        },
      }),
      this.prisma.paymentHistory.create({
        data: {
          orderId: order.id,
          sepayTxnId: data.id?.toString(),
          transactionCode,
          amount: data.amount,
          rawPayload: data as any,
        },
      }),
      this.prisma.orderStatusLog.create({
        data: {
          orderId: order.id,
          status: OrderStatus.CONFIRMED,
        },
      }),
    ]);

    // Notify customer that payment was received
    this.eventsGateway.notifyPaymentReceived(order.id, data.amount);
    this.eventsGateway.notifyOrderStatusChange(order.id, OrderStatus.CONFIRMED);

    return { success: true };
  }

  async getAdminOrders() {
    return this.prisma.order.findMany({
      include: {
        user: {
          select: { id: true, fullName: true, email: true, phone: true },
        },
        items: { include: { product: true } },
        statusLogs: true,
        shipper: {
          select: { id: true, fullName: true, phone: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    userId: string,
    userRole: string,
    note?: string,
  ) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Shipper only allowed to update order assigned to them
    if (userRole === 'SHIPPER' && order.shipperId !== userId) {
      throw new BadRequestException('You are not assigned to this order');
    }

    const updatedData: any = { status };

    if (status === OrderStatus.DELIVERED) {
      updatedData.deliveredAt = new Date();
      if (order.paymentMethod === 'COD') {
        updatedData.paymentStatus = PaymentStatus.PAID;
        updatedData.paidAt = new Date();
      }
    }

    const updatedOrder = await this.prisma.$transaction(async (tx) => {
      const o = await tx.order.update({
        where: { id: orderId },
        data: updatedData,
      });

      await tx.orderStatusLog.create({
        data: {
          orderId,
          status,
          note: note || `Trạng thái được cập nhật bởi ${userRole}`,
          createdBy: userId,
        },
      });

      // Loyalty points for customer when delivered
      if (status === OrderStatus.DELIVERED && order.status !== OrderStatus.DELIVERED) {
        const pointsEarned = Math.floor(order.totalAmount.toNumber() / 10000);
        if (pointsEarned > 0) {
          const u = await tx.user.findUnique({ where: { id: order.userId } });
          if (u) {
            const newPoints = u.loyaltyPoints + pointsEarned;
            let tier = 'BRONZE';
            if (newPoints >= 300) tier = 'GOLD';
            else if (newPoints >= 100) tier = 'SILVER';

            await tx.user.update({
              where: { id: order.userId },
              data: {
                loyaltyPoints: newPoints,
                loyaltyTier: tier,
              },
            });
          }
        }
      }

      return o;
    });

    this.eventsGateway.notifyOrderStatusChange(orderId, status);
    return updatedOrder;
  }

  async shipperClaimOrder(orderId: string, shipperId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status !== OrderStatus.READY) {
      throw new BadRequestException('Order is not ready for delivery');
    }

    if (order.shipperId) {
      throw new BadRequestException('Order already claimed by another shipper');
    }

    const updatedOrder = await this.prisma.$transaction(async (tx) => {
      const o = await tx.order.update({
        where: { id: orderId },
        data: {
          shipperId,
          status: OrderStatus.DELIVERING,
        },
      });

      await tx.orderStatusLog.create({
        data: {
          orderId,
          status: OrderStatus.DELIVERING,
          note: 'Shipper đã nhận đơn và bắt đầu giao hàng',
          createdBy: shipperId,
        },
      });

      return o;
    });

    this.eventsGateway.notifyOrderStatusChange(orderId, OrderStatus.DELIVERING);
    return updatedOrder;
  }

  async getShipperAvailableOrders() {
    return this.prisma.order.findMany({
      where: {
        status: OrderStatus.READY,
        shipperId: null,
      },
      include: {
        user: { select: { id: true, fullName: true, phone: true } },
        items: { include: { product: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getShipperActiveOrders(shipperId: string) {
    return this.prisma.order.findMany({
      where: {
        shipperId,
        status: {
          in: [OrderStatus.DELIVERING],
        },
      },
      include: {
        user: { select: { id: true, fullName: true, phone: true } },
        items: { include: { product: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async checkCoupon(code: string) {
    const coupon = await this.prisma.coupon.findUnique({
      where: { code: code.toUpperCase(), isActive: true },
    });
    if (!coupon) {
      throw new NotFoundException('Mã giảm giá không tồn tại');
    }
    if (coupon.maxUsage && coupon.usedCount >= coupon.maxUsage) {
      throw new BadRequestException('Mã giảm giá đã hết lượt sử dụng');
    }
    if (coupon.expiresAt && new Date() > coupon.expiresAt) {
      throw new BadRequestException('Mã giảm giá đã hết hạn');
    }
    return coupon;
  }

  async createReview(userId: string, orderId: string, dto: any) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });
    if (!order || order.userId !== userId) {
      throw new NotFoundException('Đơn hàng không tồn tại');
    }
    if (order.status !== OrderStatus.DELIVERED) {
      throw new BadRequestException('Chỉ có thể đánh giá đơn hàng đã giao thành công');
    }

    const hasProduct = order.items.some((i) => i.productId === dto.productId);
    if (!hasProduct) {
      throw new BadRequestException('Sản phẩm không thuộc đơn hàng này');
    }

    // SQLite uses TEXT for list type string representation
    return this.prisma.review.create({
      data: {
        userId,
        orderId,
        productId: dto.productId,
        rating: dto.rating,
        comment: dto.comment,
        images: dto.images ? JSON.stringify(dto.images) : '[]',
      },
    });
  }
}
