import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from '../common/dto/review.dto';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get(':productId')
  async findByProduct(@Param('productId') productId: string) {
    return this.reviewsService.findByProduct(parseInt(productId));
  }

  @Post()
  async create(@Body() body: CreateReviewDto) {
    return this.reviewsService.create(body);
  }
}
