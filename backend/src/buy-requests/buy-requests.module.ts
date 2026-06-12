import { Module } from '@nestjs/common';
import { BuyRequestsController } from './buy-requests.controller';
import { BuyRequestsService } from './buy-requests.service';

@Module({
  controllers: [BuyRequestsController],
  providers: [BuyRequestsService],
})
export class BuyRequestsModule {}
