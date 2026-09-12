import { Controller, Get } from '@nestjs/common';
import { RecommendedItemsService } from './recommended-items.service';

@Controller('recommended-items')
export class RecommendedItemsController {
  constructor(private readonly recommendedItemsService: RecommendedItemsService) {}

  @Get()
  async findAll() {
    return this.recommendedItemsService.findAll();
  }
}
