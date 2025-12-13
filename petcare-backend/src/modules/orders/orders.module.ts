import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { QrPaymentService } from './services/qr-payment.service'; // ✅ NEW: Import QR service
import { Order, OrderSchema } from '../../schemas/order.schema';
import { Product, ProductSchema } from '../../schemas/product.schema';
import { CartModule } from '../cart/cart.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: Product.name, schema: ProductSchema },
    ]),
    CartModule, // Import to use CartService
  ],
  controllers: [OrdersController],
  providers: [
    OrdersService,
    QrPaymentService, // ✅ NEW: Add QR payment service
  ],
  exports: [OrdersService],
})
export class OrdersModule {}