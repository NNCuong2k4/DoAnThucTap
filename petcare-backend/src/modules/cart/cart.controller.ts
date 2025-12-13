import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { CartService } from './cart.service';
import { AddToCartDto, UpdateCartItemDto } from './dto/cart.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';

@ApiTags('Cart')
@Controller('cart')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  // F4.1: Add to cart
  @Post('add')
  @ApiOperation({ summary: 'Thêm sản phẩm vào giỏ hàng' })
  @ApiResponse({ status: 200, description: 'Thêm thành công' })
  @ApiResponse({ status: 400, description: 'Sản phẩm hết hàng hoặc vượt quá tồn kho' })
  addToCart(@Request() req, @Body() addToCartDto: AddToCartDto) {
    return this.cartService.addToCart(req.user.userId, addToCartDto);
  }

  // F4.2: Get cart
  @Get()
  @ApiOperation({ summary: 'Xem giỏ hàng' })
  @ApiResponse({ status: 200, description: 'Lấy giỏ hàng thành công' })
  getCart(@Request() req) {
    return this.cartService.getCart(req.user.userId);
  }

  // F4.3: Update quantity
  @Put('update')
  @ApiOperation({ summary: 'Cập nhật số lượng sản phẩm trong giỏ' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
  @ApiResponse({ status: 404, description: 'Sản phẩm không có trong giỏ' })
  updateCartItem(@Request() req, @Body() updateDto: UpdateCartItemDto) {
    return this.cartService.updateCartItem(req.user.userId, updateDto);
  }

  // F4.4: Remove item
  @Delete('remove/:productId')
  @ApiOperation({ summary: 'Xóa sản phẩm khỏi giỏ hàng' })
  @ApiResponse({ status: 200, description: 'Xóa thành công' })
  @ApiResponse({ status: 404, description: 'Sản phẩm không có trong giỏ' })
  removeItem(@Request() req, @Param('productId') productId: string) {
    return this.cartService.removeItem(req.user.userId, productId);
  }

  // F4.5: Clear cart
  @Delete('clear')
  @ApiOperation({ summary: 'Xóa toàn bộ giỏ hàng' })
  @ApiResponse({ status: 200, description: 'Xóa thành công' })
  clearCart(@Request() req) {
    return this.cartService.clearCart(req.user.userId);
  }
}