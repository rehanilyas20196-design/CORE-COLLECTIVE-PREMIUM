import { Module } from '@nestjs/common';
import { RecommendedItemsController } from './recommended-items.controller';
import { RecommendedItemsService } from './recommended-items.service';

@Module({
  controllers: [RecommendedItemsController],
  providers: [RecommendedItemsService],
})
export class RecommendedItemsModule {}
