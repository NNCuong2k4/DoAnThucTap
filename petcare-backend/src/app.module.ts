import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './modules/auth/auth.module';
import { PetsModule } from './modules/pets/pets.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { ProductsModule } from './modules/products/products.module';
import { CartModule } from './modules/cart/cart.module';
import { OrdersModule } from './modules/orders/orders.module';
import { AppointmentsModule } from './modules/appointments/appointments.module';
import { NotificationsModule } from './modules/notifications/notifications.module';  // ← ADDED
import {BlogModule} from './modules/blog/blog.module';
import { AdminModule } from './modules/admin/admin.module';
import { PaymentModule } from './modules/payment/payment.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    MongooseModule.forRoot(
      process.env.MONGODB_URI ||
      'mongodb+srv://cuongshylove_db_user:H2ujS2V586GK2Zfy@cluster0.b8gapvm.mongodb.net/?appName=Cluster0'
    ),

    ThrottlerModule.forRoot([{
      ttl: parseInt(process.env.RATE_LIMIT_TTL || '60', 10),
      limit: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
    }]),

    AuthModule,
    PetsModule,
    CategoriesModule,
    ProductsModule,
    CartModule,
    OrdersModule,
    AppointmentsModule,
    NotificationsModule,  // ← ADDED for Sprint 6
    BlogModule,
    AdminModule,
    PaymentModule,
  ],
})
export class AppModule {}