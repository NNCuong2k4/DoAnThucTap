import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order, OrderDocument, OrderStatus, PaymentStatus, PaymentMethod } from '../../schemas/order.schema';
import { Product, ProductDocument } from '../../schemas/product.schema';
import { CreateOrderDto, UpdateOrderStatusDto, CancelOrderDto, FilterOrderDto } from './dto/order.dto';
import { CartService } from '../cart/cart.service';
import { QrPaymentService } from './services/qr-payment.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    private cartService: CartService,
    private readonly qrPaymentService: QrPaymentService,
  ) {}

  // F4.6: Create order (Checkout)
  async createOrder(userId: string, createOrderDto: CreateOrderDto) {
    console.log('📦 [createOrder] userId:', userId);
    
    // Get cart and verify
    const cart = await this.cartService.getCartForCheckout(userId);

    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('Giỏ hàng trống');
    }

    console.log('🛒 [createOrder] Cart items:', cart.items.length);

    // Prepare order items
    const orderItems = cart.items.map((item: any) => ({
      productId: item.product._id,
      name: item.product.name,
      quantity: item.quantity,
      price: item.price,
      image: item.product.images?.[0] || '',
    }));

    // Calculate totals
    const subtotal = cart.totalPrice;
    const shippingFee = this.calculateShippingFee(createOrderDto.shippingAddress.city);
    const discount = 0;
    const total = subtotal + shippingFee - discount;

    // Generate order number
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const orderNumber = `ORD${timestamp}${random}`;

    console.log('💰 [createOrder] Total:', total);
    console.log('🔢 [createOrder] Order number:', orderNumber);

    // Create order
    const order = new this.orderModel({
      orderNumber,
      userId: new Types.ObjectId(userId),
      items: orderItems,
      shippingAddress: createOrderDto.shippingAddress,
      paymentMethod: createOrderDto.paymentMethod,
      paymentStatus: PaymentStatus.PENDING,
      status: OrderStatus.PENDING,
      statusHistory: [
        {
          status: OrderStatus.PENDING,
          timestamp: new Date(),
          note: 'Đơn hàng đã được tạo',
        },
      ],
      subtotal,
      shippingFee,
      discount,
      total,
      note: createOrderDto.note,
    });

    await order.save();
    console.log('✅ [createOrder] Order saved:', order._id);

    // Update product stock
    for (const item of cart.items) {
      await this.productModel.findByIdAndUpdate(
        item.product,
        { $inc: { stock: -item.quantity, soldCount: item.quantity } },
      );
    }

    // ✅ FIX: Only clear cart for COD orders
    // For bank_transfer/e_wallet, keep cart until payment is confirmed
    if (createOrderDto.paymentMethod === PaymentMethod.COD) {
      await this.cartService.clearCart(userId);
      console.log('🗑️ [createOrder] Cart cleared (COD payment)');
    } else {
      console.log('⏳ [createOrder] Cart kept (awaiting payment confirmation)');
    }

    return {
      message: 'Đặt hàng thành công',
      data: order,
    };
  }

  // Calculate shipping fee based on city
  private calculateShippingFee(city: string): number {
    const freeCities = ['Ho Chi Minh', 'Hà Nội', 'Đà Nẵng'];
    return freeCities.includes(city) ? 0 : 30000;
  }

  // F4.7: Get my orders
  async getMyOrders(userId: string, filterDto: FilterOrderDto) {
    const { page = 1, limit = 10, status } = filterDto;
    const skip = (page - 1) * limit;

    const filter: any = { userId: new Types.ObjectId(userId) };
    if (status) {
      filter.status = status;
    }

    const [orders, total] = await Promise.all([
      this.orderModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.orderModel.countDocuments(filter),
    ]);

    return {
      data: orders,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  // F4.8: Get order detail
  async getOrderDetail(userId: string, orderId: string, isAdmin = false) {
    const order = await this.orderModel.findById(orderId).lean();

    if (!order) {
      throw new NotFoundException('Không tìm thấy đơn hàng');
    }

    if (!isAdmin && order.userId.toString() !== userId) {
      throw new ForbiddenException('Không có quyền xem đơn hàng này');
    }

    return order;
  }

  // F4.9: Cancel order
  async cancelOrder(
    userId: string,
    orderId: string,
    cancelDto: CancelOrderDto,
  ) {
    const order = await this.orderModel.findById(orderId);

    if (!order) {
      throw new NotFoundException('Không tìm thấy đơn hàng');
    }

    if (order.userId.toString() !== userId) {
      throw new ForbiddenException('Không có quyền hủy đơn hàng này');
    }

    const cancellableStatuses = [
      OrderStatus.PENDING,
      OrderStatus.CONFIRMED,
      OrderStatus.PROCESSING,
    ];

    if (!cancellableStatuses.includes(order.status)) {
      throw new BadRequestException(
        `Không thể hủy đơn hàng ở trạng thái ${order.status}`,
      );
    }

    order.status = OrderStatus.CANCELLED;
    order.cancelReason = cancelDto.reason;
    order.cancelledAt = new Date();

    order.statusHistory.push({
      status: OrderStatus.CANCELLED,
      timestamp: new Date(),
      note: `Đơn hàng bị hủy. Lý do: ${cancelDto.reason}`,
    });

    await order.save();

    // Restore product stock
    for (const item of order.items) {
      await this.productModel.findByIdAndUpdate(item.productId, {
        $inc: { stock: item.quantity, soldCount: -item.quantity },
      });
    }

    return {
      message: 'Hủy đơn hàng thành công',
      data: order,
    };
  }

  // F4.10: Update order status (Admin)
  async updateOrderStatus(
    adminId: string,
    orderId: string,
    updateDto: UpdateOrderStatusDto,
  ) {
    const order = await this.orderModel.findById(orderId);

    if (!order) {
      throw new NotFoundException('Không tìm thấy đơn hàng');
    }

    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
      [OrderStatus.CONFIRMED]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
      [OrderStatus.PROCESSING]: [OrderStatus.SHIPPING, OrderStatus.CANCELLED],
      [OrderStatus.SHIPPING]: [OrderStatus.DELIVERED],
      [OrderStatus.DELIVERED]: [OrderStatus.REFUNDED],
      [OrderStatus.CANCELLED]: [],
      [OrderStatus.REFUNDED]: [],
    };

    const allowedStatuses = validTransitions[order.status] || [];

    if (!allowedStatuses.includes(updateDto.status)) {
      throw new BadRequestException(
        `Không thể chuyển từ trạng thái ${order.status} sang ${updateDto.status}`,
      );
    }

    order.status = updateDto.status;

    if (updateDto.status === OrderStatus.DELIVERED) {
      order.deliveredAt = new Date();
    }

    order.statusHistory.push({
      status: updateDto.status,
      timestamp: new Date(),
      note: updateDto.note || `Trạng thái được cập nhật sang ${updateDto.status}`,
      updatedBy: new Types.ObjectId(adminId),
    });

    await order.save();

    return {
      message: 'Cập nhật trạng thái thành công',
      data: order,
    };
  }

  // F4.11: Get all orders (Admin)
  async getAllOrders(filterDto: FilterOrderDto) {
    const { page = 1, limit = 10, status, userId, orderNumber } = filterDto;
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (status) filter.status = status;
    if (userId) filter.userId = new Types.ObjectId(userId);
    if (orderNumber) filter.orderNumber = new RegExp(orderNumber, 'i');

    const [orders, total] = await Promise.all([
      this.orderModel
        .find(filter)
        .populate('userId', 'name email phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.orderModel.countDocuments(filter),
    ]);

    return {
      data: orders,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  // F4.12: Get statistics (Admin)
  async getStatistics() {
    const [
      totalOrders,
      pendingOrders,
      completedOrders,
      cancelledOrders,
      totalRevenue,
    ] = await Promise.all([
      this.orderModel.countDocuments(),
      this.orderModel.countDocuments({ status: OrderStatus.PENDING }),
      this.orderModel.countDocuments({ status: OrderStatus.DELIVERED }),
      this.orderModel.countDocuments({ status: OrderStatus.CANCELLED }),
      this.orderModel.aggregate([
        { $match: { status: OrderStatus.DELIVERED } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
    ]);

    return {
      totalOrders,
      pendingOrders,
      completedOrders,
      cancelledOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
    };
  }

  // ==================== QR PAYMENT METHODS ====================

  /**
   * Generate QR payment for order
   */
  async generateQrPayment(orderId: string) {
    const order = await this.orderModel.findById(orderId);

    if (!order) {
      throw new NotFoundException('Không tìm thấy đơn hàng');
    }

    if (order.paymentMethod !== PaymentMethod.BANK_TRANSFER) {
      throw new BadRequestException(
        'Đơn hàng không sử dụng phương thức chuyển khoản',
      );
    }

    // Generate QR code and payment details
    const paymentDetails = this.qrPaymentService.generatePaymentDetails(
      order.orderNumber,
      order.total,
    );

    return {
      orderId: order._id,
      ...paymentDetails,
    };
  }

  /**
   * User confirms they have transferred money
   */
  async confirmTransferByUser(orderId: string, userId: string) {
    const order = await this.orderModel.findById(orderId);

    if (!order) {
      throw new NotFoundException('Không tìm thấy đơn hàng');
    }

    if (order.userId.toString() !== userId) {
      throw new ForbiddenException('Không có quyền truy cập');
    }

    if (order.paymentStatus !== PaymentStatus.PENDING) {
      throw new BadRequestException('Đơn hàng đã được xác nhận thanh toán');
    }

    order.paymentStatus = PaymentStatus.AWAITING_PAYMENT;
    order.statusHistory.push({
      status: OrderStatus.PENDING,
      timestamp: new Date(),
      note: 'Khách hàng xác nhận đã chuyển khoản',
    });

    await order.save();

    return {
      message: 'Đã ghi nhận xác nhận thanh toán',
      data: order,
    };
  }

  /**
   * Admin confirms payment is received
   */
  async confirmPaymentByAdmin(
    orderId: string,
    adminId: string,
    note?: string,
  ) {
    const order = await this.orderModel.findById(orderId);

    if (!order) {
      throw new NotFoundException('Không tìm thấy đơn hàng');
    }

    if (order.paymentStatus !== PaymentStatus.AWAITING_PAYMENT) {
      throw new BadRequestException(
        'Đơn hàng không ở trạng thái chờ xác minh thanh toán',
      );
    }

    // Update payment status
    order.paymentStatus = PaymentStatus.PAID;
    order.status = OrderStatus.CONFIRMED;

    order.statusHistory.push({
      status: OrderStatus.CONFIRMED,
      timestamp: new Date(),
      note: note || 'Thanh toán đã được xác minh bởi admin',
      updatedBy: new Types.ObjectId(adminId),
    });

    await order.save();

    // ✅ FIX: Clear cart AFTER admin confirms payment
    try {
      await this.cartService.clearCart(order.userId.toString());
      console.log('🗑️ [confirmPaymentByAdmin] Cart cleared after payment confirmed');
    } catch (error) {
      console.error('⚠️ [confirmPaymentByAdmin] Failed to clear cart:', error);
      // Don't throw - payment already confirmed, cart clearing is secondary
    }

    return {
      message: 'Xác nhận thanh toán thành công',
      data: order,
    };
  }

  /**
   * Get orders awaiting payment verification (Admin)
   */
  async getOrdersAwaitingPayment(query: any) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {
      paymentMethod: PaymentMethod.BANK_TRANSFER,
      paymentStatus: PaymentStatus.AWAITING_PAYMENT,
    };

    const [orders, total] = await Promise.all([
      this.orderModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'name email phone')
        .lean(),
      this.orderModel.countDocuments(filter),
    ]);

    return {
      data: orders,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }
}