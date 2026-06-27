import { IsString, IsEnum, IsOptional, IsNumber, Min, IsArray, ValidateNested, ArrayNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod } from '@prisma/client';

class OrderItemDto {
  @IsString()
  productId: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsArray()
  selectedOptions: any[];

  @IsOptional()
  @IsString()
  note?: string;
}

class DeliveryAddressDto {
  @IsString()
  label: string;

  @IsString()
  fullAddress: string;

  @IsNumber()
  lat: number;

  @IsNumber()
  lng: number;
}

export class CreateOrderDto {
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ValidateNested()
  @Type(() => DeliveryAddressDto)
  deliveryAddress: DeliveryAddressDto;

  @IsNumber()
  @Min(0)
  shippingFee: number;

  @IsOptional()
  @IsString()
  couponCode?: string;

  @IsOptional()
  @IsString()
  note?: string;
}
