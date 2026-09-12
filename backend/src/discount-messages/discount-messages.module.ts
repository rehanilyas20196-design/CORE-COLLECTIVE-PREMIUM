import { Module } from '@nestjs/common';
import { DiscountMessagesController } from './discount-messages.controller';
import { DiscountMessagesService } from './discount-messages.service';
import { SupabaseModule } from '../supabase/supabase.module';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [SupabaseModule, CommonModule],
  controllers: [DiscountMessagesController],
  providers: [DiscountMessagesService],
  exports: [DiscountMessagesService],
})
export class DiscountMessagesModule {}
