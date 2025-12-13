import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import {
  CreateOrderDto,
  UpdateOrderStatusDto,
  CancelOrderDto,
  FilterOrderDto,
} from './dto/order.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { UserRole } from '../../schemas/user.schema';

@ApiTags('Orders')
@Controller('orders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // F4.6: Create order (Checkout)
  @Post()
  @ApiOperation({ summary: 'Tạo đơn hàng (Checkout)' })
  @ApiResponse({ status: 201, description: 'Đặt hàng thành công' })
  @ApiResponse({ status: 400, description: 'Giỏ hàng trống hoặc sản phẩm hết hàng' })
  createOrder(@Request() req, @Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.createOrder(req.user.userId, createOrderDto);
  }

  // F4.7: Get my orders
  @Get('my-orders')
  @ApiOperation({ summary: 'Xem danh sách đơn hàng của tôi' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách thành công' })
  getMyOrders(@Request() req, @Query() filterDto: FilterOrderDto) {
    return this.ordersService.getMyOrders(req.user.userId, filterDto);
  }

  // ✅ NEW: Get orders awaiting payment (Admin) - MUST be before :id route!
  @Get('awaiting-payment')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '[Admin] Lấy danh sách đơn hàng chờ xác nhận thanh toán' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách thành công' })
  getOrdersAwaitingPayment(@Query() query) {
    return this.ordersService.getOrdersAwaitingPayment(query);
  }

  // F4.12: Get statistics (Admin)
  @Get('stats/summary')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '[Admin] Thống kê đơn hàng' })
  @ApiResponse({ status: 200, description: 'Lấy thống kê thành công' })
  getStatistics() {
    return this.ordersService.getStatistics();
  }

  // F4.11: Get all orders (Admin)
  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '[Admin] Xem tất cả đơn hàng' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách thành công' })
  getAllOrders(@Query() filterDto: FilterOrderDto) {
    return this.ordersService.getAllOrders(filterDto);
  }

  // F4.8: Get order detail
  @Get(':id')
  @ApiOperation({ summary: 'Xem chi tiết đơn hàng' })
  @ApiResponse({ status: 200, description: 'Lấy thông tin thành công' })
  @ApiResponse({ status: 403, description: 'Không có quyền xem đơn hàng này' })
  getOrderDetail(@Request() req, @Param('id') id: string) {
    const isAdmin = req.user.role === UserRole.ADMIN;
    return this.ordersService.getOrderDetail(req.user.userId, id, isAdmin);
  }

  // ✅ NEW: Generate QR payment
  @Post(':id/qr-payment')
  @ApiOperation({ summary: 'Tạo mã QR thanh toán cho đơn hàng' })
  @ApiResponse({ status: 200, description: 'Tạo QR thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy đơn hàng' })
  generateQrPayment(@Param('id') orderId: string) {
    return this.ordersService.generateQrPayment(orderId);
  }

  // ✅ NEW: User confirms transfer
  @Post(':id/confirm-transfer')
  @ApiOperation({ summary: 'Xác nhận đã chuyển khoản' })
  @ApiResponse({ status: 200, description: 'Xác nhận thành công' })
  @ApiResponse({ status: 400, description: 'Đơn hàng không hợp lệ' })
  confirmTransfer(@Request() req, @Param('id') orderId: string) {
    return this.ordersService.confirmTransferByUser(orderId, req.user.userId);
  }

  // ✅ NEW: Admin confirms payment
  @Post(':id/confirm-payment')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '[Admin] Xác nhận thanh toán' })
  @ApiResponse({ status: 200, description: 'Xác nhận thành công' })
  @ApiResponse({ status: 400, description: 'Đơn hàng không ở trạng thái chờ xác minh' })
  confirmPayment(
    @Request() req,
    @Param('id') orderId: string,
    @Body() body: { note?: string },
  ) {
    return this.ordersService.confirmPaymentByAdmin(
      orderId,
      req.user.userId,
      body.note,
    );
  }

  // F4.9: Cancel order
  @Post(':id/cancel')
  @ApiOperation({ summary: 'Hủy đơn hàng' })
  @ApiResponse({ status: 200, description: 'Hủy đơn hàng thành công' })
  @ApiResponse({ status: 400, description: 'Không thể hủy đơn hàng ở trạng thái này' })
  cancelOrder(
    @Request() req,
    @Param('id') id: string,
    @Body() cancelDto: CancelOrderDto,
  ) {
    return this.ordersService.cancelOrder(req.user.userId, id, cancelDto);
  }

  // F4.10: Update order status (Admin)
  @Put(':id/status')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '[Admin] Cập nhật trạng thái đơn hàng' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
  @ApiResponse({ status: 400, description: 'Chuyển trạng thái không hợp lệ' })
  updateOrderStatus(
    @Request() req,
    @Param('id') id: string,
    @Body() updateDto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateOrderStatus(req.user.userId, id, updateDto);
  }
}