import { Controller, Delete, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { AdminGuard } from '../common/admin.guard';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  async findAll(@Query('search') search?: string) {
    return this.productsService.findAll(search);
  }

  @Get('categories')
  async getCategories() {
    return this.productsService.findCategories();
  }

  @Get('minimal')
  async getMinimal() {
    return this.productsService.findMinimal();
  }

  @Get('seller')
  async getSellerProducts(@Query('limit') limit?: string) {
    return this.productsService.findSellerProducts(limit ? parseInt(limit) : 12);
  }

  @Get('related/:category/:productId')
  async getRelated(
    @Param('category') category: string,
    @Param('productId') productId: string,
  ) {
    return this.productsService.findRelated(category, parseInt(productId));
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.productsService.findOne(parseInt(id));
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  async remove(@Param('id') id: string) {
    return this.productsService.remove(parseInt(id));
  }
}
