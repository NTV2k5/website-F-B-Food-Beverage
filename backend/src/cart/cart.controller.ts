import { Controller, Get, Post, Body, Patch, Delete, Param, UseGuards } from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiBody, ApiParam } from '@nestjs/swagger';

@ApiTags('Cart')
@ApiBearerAuth('JWT-auth')
@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: 'Get current user cart' })
  getCart(@CurrentUser() user: any) {
    return this.cartService.getCart(user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Add product to cart' })
  @ApiBody({ type: AddToCartDto })
  addToCart(@CurrentUser() user: any, @Body() dto: AddToCartDto) {
    return this.cartService.addToCart(user.id, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update cart item quantity or note' })
  @ApiParam({ name: 'id', description: 'Cart item ID' })
  @ApiBody({ type: UpdateCartDto })
  updateCartItem(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateCartDto,
  ) {
    return this.cartService.updateCartItem(user.id, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove item from cart' })
  @ApiParam({ name: 'id', description: 'Cart item ID' })
  removeFromCart(@CurrentUser() user: any, @Param('id') id: string) {
    return this.cartService.removeFromCart(user.id, id);
  }

  @Delete()
  @ApiOperation({ summary: 'Clear entire cart' })
  clearCart(@CurrentUser() user: any) {
    return this.cartService.clearCart(user.id);
  }
}
