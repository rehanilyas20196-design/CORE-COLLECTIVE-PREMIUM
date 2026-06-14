import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { QuotesService } from './quotes.service';
import { AuthGuard } from '../common/auth.guard';

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

  @Get()
  @UseGuards(AuthGuard)
  async findAll() {
    return this.quotesService.findAll();
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  async findOne(@Param('id') id: string) {
    return this.quotesService.findOne(parseInt(id));
  }

  @Patch(':id/status')
  @UseGuards(AuthGuard)
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: string; admin_note?: string },
  ) {
    return this.quotesService.updateStatus(parseInt(id), body.status, body.admin_note);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  async remove(@Param('id') id: string) {
    return this.quotesService.remove(parseInt(id));
  }
}
