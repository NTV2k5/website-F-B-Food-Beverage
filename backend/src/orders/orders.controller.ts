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
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ConfigService } from '@nestjs/config';
import { Role, OrderStatus } from '@prisma/client';

@Controller('orders')
export class OrdersController {
  constructor(
    private ordersService: OrdersService,
    private configService: ConfigService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  createOrder(@CurrentUser() user: any, @Body() dto: CreateOrderDto) {
    return this.ordersService.createOrder(user.id, dto);
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  getAdminOrders() {
    return this.ordersService.getAdminOrders();
  }

  @Get('shipper/available')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SHIPPER)
  getShipperAvailableOrders() {
    return this.ordersService.getShipperAvailableOrders();
  }

  @Get('shipper/active')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SHIPPER)
  getShipperActiveOrders(@CurrentUser() user: any) {
    return this.ordersService.getShipperActiveOrders(user.id);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SHIPPER)
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
  shipperClaimOrder(@CurrentUser() user: any, @Param('id') id: string) {
    return this.ordersService.shipperClaimOrder(id, user.id);
  }

  @Post(':id/reviews')
  @UseGuards(JwtAuthGuard)
  createReview(
    @CurrentUser() user: any,
    @Param('id') orderId: string,
    @Body() dto: { productId: string; rating: number; comment?: string; images?: string[] },
  ) {
    return this.ordersService.createReview(user.id, orderId, dto);
  }

  @Get('coupon/:code')
  @UseGuards(JwtAuthGuard)
  checkCoupon(@Param('code') code: string) {
    return this.ordersService.checkCoupon(code);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  getOrders(@CurrentUser() user: any) {
    return this.ordersService.getOrders(user.id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  getOrder(@CurrentUser() user: any, @Param('id') id: string) {
    return this.ordersService.getOrderById(user.id, id);
  }

  @Post('sepay-webhook')
  @HttpCode(HttpStatus.OK)
  async handleSePayWebhook(@Body() data: any) {
    return this.ordersService.handleSePayWebhook(data);
  }
}
