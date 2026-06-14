import { Module } from '@nestjs/common';
import { SupabaseModule } from '../supabase/supabase.module';
import { QuotesController } from './quotes.controller';
import { QuotesService } from './quotes.service';

@Module({
  imports: [SupabaseModule],
  controllers: [QuotesController],
  providers: [QuotesService],
})
export class QuotesModule {}
