import { Controller, Get, Post, Body, Patch, Delete, Param, UseGuards } from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private cartService: CartService) {}

  @Get()
  getCart(@CurrentUser() user: any) {
    return this.cartService.getCart(user.id);
  }

  @Post()
  addToCart(@CurrentUser() user: any, @Body() dto: AddToCartDto) {
    return this.cartService.addToCart(user.id, dto);
  }

  @Patch(':id')
  updateCartItem(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateCartDto,
  ) {
    return this.cartService.updateCartItem(user.id, id, dto);
  }

  @Delete(':id')
  removeFromCart(@CurrentUser() user: any, @Param('id') id: string) {
    return this.cartService.removeFromCart(user.id, id);
  }

  @Delete()
  clearCart(@CurrentUser() user: any) {
    return this.cartService.clearCart(user.id);
  }
}
