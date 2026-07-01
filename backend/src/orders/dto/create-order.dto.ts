import { IsString, IsEnum, IsOptional, IsNumber, Min, IsArray, ValidateNested, ArrayNotEmpty, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class SelectedOptionDto {
  @ApiProperty({ example: 'clxxx-group-id', description: 'Option group ID' })
  @IsString()
  groupId: string;

  @ApiProperty({ example: 'clxxx-option-id', description: 'Option ID within the group' })
  @IsString()
  optionId: string;
}

class OrderItemDto {
  @ApiProperty({ example: 'clxxx-product-id', description: 'Product ID' })
  @IsString()
  productId: string;

  @ApiProperty({ example: 2, description: 'Quantity (min 1)' })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({ type: [SelectedOptionDto], description: 'Selected options (size, topping, etc.)' })
  @IsArray()
  selectedOptions: SelectedOptionDto[];

  @ApiPropertyOptional({ example: 'Ít đường, ít đá', description: 'Item-level note' })
  @IsOptional()
  @IsString()
  note?: string;
}

class DeliveryAddressDto {
  @ApiProperty({ example: 'Giao tận nơi', description: 'Address label' })
  @IsString()
  label: string;

  @ApiProperty({ example: '123 Nguyễn Huệ, Q.1, TP.HCM', description: 'Full delivery address' })
  @IsString()
  fullAddress: string;

  @ApiProperty({ example: 10.762622, description: 'Latitude' })
  @IsNumber()
  lat: number;

  @ApiProperty({ example: 106.660172, description: 'Longitude' })
  @IsNumber()
  lng: number;
}

export class CreateOrderDto {
  @ApiProperty({ type: [OrderItemDto], description: 'List of items in the order' })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ApiProperty({ enum: PaymentMethod, example: 'COD', description: 'Payment method: COD (cash) or SEPAY (bank transfer QR)' })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiProperty({ type: DeliveryAddressDto, description: 'Delivery address details' })
  @ValidateNested()
  @Type(() => DeliveryAddressDto)
  deliveryAddress: DeliveryAddressDto;

  @ApiProperty({ example: 15000, description: 'Shipping fee in VND' })
  @IsNumber()
  @Min(0)
  shippingFee: number;

  @ApiPropertyOptional({ example: 'GIAM20', description: 'Coupon code for discount' })
  @IsOptional()
  @IsString()
  couponCode?: string;

  @ApiPropertyOptional({ example: 10, description: 'Number of loyalty points used for discount' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  pointsUsed?: number;

  @ApiPropertyOptional({ example: false, description: 'True if customer requests a paper invoice' })
  @IsOptional()
  @IsBoolean()
  requestInvoice?: boolean;

  @ApiPropertyOptional({ example: 'Gọi trước khi giao', description: 'Order-level note' })
  @IsOptional()
  @IsString()
  note?: string;
}

