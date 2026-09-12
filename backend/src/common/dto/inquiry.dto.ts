import { IsString, IsNumber, IsOptional, Min, MaxLength } from 'class-validator';

export class CreateInquiryDto {
  @IsString()
  @MaxLength(200)
  item_name: string;

  @IsString()
  @MaxLength(2000)
  details: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  unit?: string;
}
