import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  async getCart(userId: string) {
    return this.prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            category: true,
            optionGroups: { include: { options: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async addToCart(userId: string, dto: AddToCartDto) {
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId, isAvailable: true },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const existingItem = await this.prisma.cartItem.findFirst({
      where: {
        userId,
        productId: dto.productId,
        selectedOptions: dto.selectedOptions as any,
      },
    });

    if (existingItem) {
      return this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + dto.quantity },
        include: { product: true },
      });
    }

    return this.prisma.cartItem.create({
      data: {
        userId,
        productId: dto.productId,
        quantity: dto.quantity,
        selectedOptions: dto.selectedOptions as any,
        note: dto.note,
      },
      include: { product: true },
    });
  }

  async updateCartItem(userId: string, itemId: string, dto: UpdateCartDto) {
    const item = await this.prisma.cartItem.findUnique({ where: { id: itemId } });

    if (!item) {
      throw new NotFoundException('Cart item not found');
    }

    if (item.userId !== userId) {
      throw new ForbiddenException('Not your cart item');
    }

    return this.prisma.cartItem.update({
      where: { id: itemId },
      data: dto,
      include: { product: true },
    });
  }

  async removeFromCart(userId: string, itemId: string) {
    const item = await this.prisma.cartItem.findUnique({ where: { id: itemId } });

    if (!item) {
      throw new NotFoundException('Cart item not found');
    }

    if (item.userId !== userId) {
      throw new ForbiddenException('Not your cart item');
    }

    return this.prisma.cartItem.delete({ where: { id: itemId } });
  }

  async clearCart(userId: string) {
    return this.prisma.cartItem.deleteMany({ where: { userId } });
  }
}
