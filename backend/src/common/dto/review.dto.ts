import { IsString, IsNumber, Min, Max, MaxLength } from 'class-validator';

export class CreateReviewDto {
  @IsNumber()
  product_id: number;

  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @IsString()
  @MaxLength(2000)
  comment: string;

  @IsString()
  @MaxLength(100)
  name: string;
}
