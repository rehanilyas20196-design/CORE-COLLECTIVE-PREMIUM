import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { SupplierInquiriesService } from './supplier-inquiries.service';
import { CreateInquiryDto } from '../common/dto/inquiry.dto';
import { AdminGuard } from '../common/admin.guard';
import { OptionalAuthGuard } from '../common/optional-auth.guard';
import { Request } from 'express';

@Controller('supplier-inquiries')
export class SupplierInquiriesController {
  constructor(private readonly supplierInquiriesService: SupplierInquiriesService) {}

  @Get()
  @UseGuards(OptionalAuthGuard)
  async findAll(@Req() req: Request) {
    const user = (req as any).user;
    return this.supplierInquiriesService.findAll(user?.id, user?.email);
  }

  @Post()
  @UseGuards(OptionalAuthGuard)
  async create(@Body() body: CreateInquiryDto, @Req() req: Request) {
    const user = (req as any).user;
    return this.supplierInquiriesService.create(
      body,
      user?.id,
      user?.email,
      user?.user_metadata?.full_name || user?.email?.split('@')[0]
    );
  }

  @Patch(':id/status')
  @UseGuards(AdminGuard)
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: string; admin_notes?: string; supplier_ref?: string }
  ) {
    return this.supplierInquiriesService.updateStatus(parseInt(id), body.status, body.admin_notes, body.supplier_ref);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  async remove(@Param('id') id: string) {
    return this.supplierInquiriesService.remove(parseInt(id));
  }
}
