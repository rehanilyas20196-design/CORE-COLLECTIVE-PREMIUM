import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { SupplierProductsService } from './supplier-products.service';
import { CreateSupplierProductDto, UpdateSupplierProductStatusDto } from '../common/dto/supplier-product.dto';
import { AdminGuard } from '../common/admin.guard';
import { OptionalAuthGuard } from '../common/optional-auth.guard';
import { Request } from 'express';

@Controller('supplier-products')
export class SupplierProductsController {
  constructor(private readonly supplierProductsService: SupplierProductsService) {}

  @Post()
  @UseGuards(OptionalAuthGuard)
  async create(@Body() body: CreateSupplierProductDto, @Req() req: Request) {
    const user = (req as any).user;
    if (!user) throw new Error('Authentication required');
    return this.supplierProductsService.create(
      body,
      user.id,
      user.email,
      user.user_metadata?.full_name || user.email?.split('@')[0] || 'Supplier',
    );
  }

  @Get()
  @UseGuards(OptionalAuthGuard)
  async findAll(@Req() req: Request) {
    const user = (req as any).user;
    return this.supplierProductsService.findAll(user?.id, user?.email);
  }

  @Get('mine')
  @UseGuards(OptionalAuthGuard)
  async findMine(@Req() req: Request) {
    const user = (req as any).user;
    if (!user) throw new Error('Authentication required');
    return this.supplierProductsService.findMine(user.id);
  }

  @Patch(':id/status')
  @UseGuards(AdminGuard)
  async updateStatus(
    @Param('id') id: string,
    @Body() body: UpdateSupplierProductStatusDto,
  ) {
    return this.supplierProductsService.updateStatus(parseInt(id), body.status, body.admin_notes);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  async remove(@Param('id') id: string) {
    return this.supplierProductsService.remove(parseInt(id));
  }
}
