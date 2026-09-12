import { Module } from '@nestjs/common';
import { SupplierInquiriesController } from './supplier-inquiries.controller';
import { SupplierInquiriesService } from './supplier-inquiries.service';

@Module({
  controllers: [SupplierInquiriesController],
  providers: [SupplierInquiriesService],
})
export class SupplierInquiriesModule {}
