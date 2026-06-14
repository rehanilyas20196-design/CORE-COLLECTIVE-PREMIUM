import { Body, Controller, Post } from '@nestjs/common';
import { QuotesService } from './quotes.service';

@Controller('quotes')
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) {}

  @Post()
  async create(@Body() body: {
    product_id: number;
    buyer_name: string;
    business_name?: string;
    phone?: string;
    email: string;
    quantity: number;
    message?: string;
  }) {
    return this.quotesService.create(body);
  }
}
