import { IsString, IsOptional, IsNumber, IsArray, IsIn, Min, MaxLength } from 'class-validator';

export class CreateOrderDto {
  @IsString()
  @MaxLength(200)
  full_name: string;

  @IsString()
  @MaxLength(50)
  phone_number: string;

  @IsString()
  @MaxLength(100)
  province: string;

  @IsString()
  @MaxLength(100)
  city: string;

  @IsString()
  @MaxLength(200)
  area: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  building_street?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  colony_suburb?: string;

  @IsString()
  @MaxLength(500)
  address: string;

  @IsOptional()
  @IsString()
  @IsIn(['HOME', 'OFFICE'])
  label?: string;

  @IsNumber()
  total_amount: number;

  @IsOptional()
  @IsString()
  payment_method?: string;

  @IsOptional()
  @IsString()
  payment_screenshot?: string;

  @IsOptional()
  @IsArray()
  items?: any[];
}

export class UpdateOrderStatusDto {
  @IsString()
  @IsIn(['pending', 'confirmed', 'rejected'])
  status: string;
}

export class UpdateTrackingStatusDto {
  @IsString()
  @IsIn(['confirmed', 'shipped', 'in_transit', 'out_for_delivery', 'delivered'])
  tracking_status: string;

  @IsOptional()
  @IsString()
  note?: string;
}
