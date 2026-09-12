import { IsString, IsOptional, IsNumber, Min, MaxLength, IsArray, IsIn, IsObject } from 'class-validator';

export class CreateSupplierProductDto {
  @IsString()
  @MaxLength(200)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  image_url?: string;

  @IsOptional()
  @IsArray()
  images?: string[];

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsNumber()
  price_min?: number;

  @IsOptional()
  @IsNumber()
  price_max?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  stock?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  moq?: number;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsString()
  whatsapp?: string;

  @IsOptional()
  @IsString()
  @IsIn(['in_stock', 'limited', 'out_of_stock'])
  stock_status?: string;

  @IsOptional()
  @IsObject()
  specifications?: Record<string, string>;

  @IsOptional()
  @IsArray()
  pricing_tiers?: { min_qty: number; price: number }[];
}

export class UpdateSupplierProductStatusDto {
  @IsString()
  @IsIn(['approved', 'rejected'])
  status: string;

  @IsOptional()
  @IsString()
  admin_notes?: string;
}
