import { Controller, Post, Body, Get, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ConfigService } from '@nestjs/config';

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
