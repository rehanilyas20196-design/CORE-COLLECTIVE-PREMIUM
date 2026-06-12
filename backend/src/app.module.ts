import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { CustomThrottlerGuard } from './common/custom-throttler.guard';
import { SupabaseModule } from './supabase/supabase.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { ReviewsModule } from './reviews/reviews.module';
import { DealsModule } from './deals/deals.module';
import { RecommendedItemsModule } from './recommended-items/recommended-items.module';
import { SupplierInquiriesModule } from './supplier-inquiries/supplier-inquiries.module';
import { AuthModule } from './auth/auth.module';
import { UploadModule } from './upload/upload.module';
import { CommonModule } from './common/common.module';
import { FavoritesModule } from './favorites/favorites.module';
import { CartModule } from './cart/cart.module';
import { NotificationsModule } from './notifications/notifications.module';
import { DiscountMessagesModule } from './discount-messages/discount-messages.module';
import { SupplierProductsModule } from './supplier-products/supplier-products.module';
import { BuyRequestsModule } from './buy-requests/buy-requests.module';
import { MessagesModule } from './messages/messages.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, ignoreEnvFile: true }),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),
    SupabaseModule,
    ProductsModule,
    OrdersModule,
    ReviewsModule,
    DealsModule,
    RecommendedItemsModule,
    SupplierInquiriesModule,
    AuthModule,
    UploadModule,
    CommonModule,
    FavoritesModule,
    CartModule,
    NotificationsModule,
    DiscountMessagesModule,
    SupplierProductsModule,
    BuyRequestsModule,
    MessagesModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: CustomThrottlerGuard },
  ],
})
export class AppModule {}
