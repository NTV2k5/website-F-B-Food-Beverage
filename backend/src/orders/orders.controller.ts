import {
  Controller,
  Post,
  Body,
  Patch,
  Get,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  Delete,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ConfigService } from '@nestjs/config';
import { Role, OrderStatus } from '@prisma/client';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiParam, ApiBody } from '@nestjs/swagger';

@ApiTags('Orders')
@ApiBearerAuth('JWT-auth')
@Controller('orders')
export class OrdersController {
  constructor(
    private ordersService: OrdersService,
    private configService: ConfigService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new order' })
  @ApiBody({ type: CreateOrderDto })
  createOrder(@CurrentUser() user: any, @Body() dto: CreateOrderDto) {
    return this.ordersService.createOrder(user.id, dto);
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get all orders for Admin panel' })
  getAdminOrders() {
    return this.ordersService.getAdminOrders();
  }

  @Get('admin/analytics/revenue')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get revenue analytics for the last 7 days (Admin)' })
  getRevenueAnalytics() {
    return this.ordersService.getRevenueAnalytics();
  }


  @Get('shipper/available')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SHIPPER)
  @ApiOperation({ summary: 'Get available orders for shipper to claim' })
  getShipperAvailableOrders() {
    return this.ordersService.getShipperAvailableOrders();
  }

  @Get('shipper/active')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SHIPPER)
  @ApiOperation({ summary: 'Get currently claimed active orders for shipper' })
  getShipperActiveOrders(@CurrentUser() user: any) {
    return this.ordersService.getShipperActiveOrders(user.id);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SHIPPER)
  @ApiOperation({ summary: 'Update order status' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', enum: Object.values(OrderStatus), example: 'DELIVERED' },
        note: { type: 'string', example: 'Đã giao hàng thành công', nullable: true },
      },
      required: ['status'],
    },
  })
  updateOrderStatus(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body('status') status: OrderStatus,
    @Body('note') note?: string,
  ) {
    return this.ordersService.updateOrderStatus(
      id,
      status,
      user.id,
      user.role,
      note,
    );
  }

  @Patch(':id/claim')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SHIPPER)
  @ApiOperation({ summary: 'Shipper claims an order for delivery' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  shipperClaimOrder(@CurrentUser() user: any, @Param('id') id: string) {
    return this.ordersService.shipperClaimOrder(id, user.id);
  }

  @Post(':id/reviews')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a review for a product in an order' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        productId: { type: 'string', example: 'clxxx-product-id' },
        rating: { type: 'number', minimum: 1, maximum: 5, example: 5 },
        comment: { type: 'string', example: 'Món này rất ngon!', nullable: true },
        images: { type: 'array', items: { type: 'string' }, example: [], nullable: true },
      },
      required: ['productId', 'rating'],
    },
  })
  createReview(
    @CurrentUser() user: any,
    @Param('id') orderId: string,
    @Body() dto: { productId: string; rating: number; comment?: string; images?: string[] },
  ) {
    return this.ordersService.createReview(user.id, orderId, dto);
  }

  @Get('coupons/admin')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get list of coupons (Admin)' })
  getAdminCoupons() {
    return this.ordersService.getAdminCoupons();
  }

  @Post('coupons/admin')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new coupon discount' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        code: { type: 'string', example: 'GIAM30' },
        type: { type: 'string', enum: ['PERCENT', 'FIXED'], example: 'PERCENT' },
        value: { type: 'number', example: 30 },
        minOrderAmount: { type: 'number', example: 50000 },
        maxUsage: { type: 'number', example: 100, nullable: true },
        expiresAt: { type: 'string', format: 'date-time', example: '2026-12-31T23:59:59Z', nullable: true },
        isActive: { type: 'boolean', example: true },
      },
      required: ['code', 'type', 'value'],
    },
  })
  createCoupon(@Body() dto: any) {
    return this.ordersService.createCoupon(dto);
  }

  @Get('reviews/admin')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all reviews (Admin)' })
  getAdminReviews() {
    return this.ordersService.getAdminReviews();
  }

  @Delete('coupons/admin/:id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete a coupon (Admin)' })
  @ApiParam({ name: 'id', description: 'Coupon ID' })
  deleteCoupon(@Param('id') id: string) {
    return this.ordersService.deleteCoupon(id);
  }

  @Get('coupon/:code')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Validate / check coupon eligibility' })
  @ApiParam({ name: 'code', description: 'Coupon code' })
  checkCoupon(@Param('code') code: string) {
    return this.ordersService.checkCoupon(code);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all orders of current customer' })
  getOrders(@CurrentUser() user: any) {
    return this.ordersService.getOrders(user.id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get order details by ID' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  getOrder(@CurrentUser() user: any, @Param('id') id: string) {
    return this.ordersService.getOrderById(user.id, id);
  }

  @Post('sepay-webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Webhook endpoint for SePay payment confirmation' })
  async handleSePayWebhook(@Body() data: any) {
    return this.ordersService.handleSePayWebhook(data);
  }
}
