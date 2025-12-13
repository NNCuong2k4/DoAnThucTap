import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cart, CartDocument } from '../../schemas/cart.schema';
import { Product, ProductDocument } from '../../schemas/product.schema';
import { AddToCartDto, UpdateCartItemDto } from './dto/cart.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name) private cartModel: Model<CartDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  // F4.1: Add to cart
  async addToCart(userId: string, addToCartDto: AddToCartDto) {
    const { productId, quantity } = addToCartDto;

    // Verify product exists and is active
    const productDoc = await this.productModel.findById(productId);
    if (!productDoc || !productDoc.isActive) {
      throw new NotFoundException('Sản phẩm không tồn tại hoặc không khả dụng');
    }

    // Check stock
    if (productDoc.stock < quantity) {
      throw new BadRequestException(`Chỉ còn ${productDoc.stock} sản phẩm trong kho`);
    }

    // Get or create cart
    let cart = await this.cartModel.findOne({ userId });
    if (!cart) {
      cart = new this.cartModel({ userId, items: [] });
    }

    // Check if product already in cart
    const existingItemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId,
    );

    if (existingItemIndex > -1) {
      // Update quantity
      const newQuantity = cart.items[existingItemIndex].quantity + quantity;

      if (newQuantity > productDoc.stock) {
        throw new BadRequestException(
          `Số lượng vượt quá tồn kho. Tối đa: ${productDoc.stock}`,
        );
      }

      cart.items[existingItemIndex].quantity = newQuantity;
    } else {
      // Add new item
      cart.items.push({
        product: new Types.ObjectId(productId),
        quantity,
        price: productDoc.price,
        addedAt: new Date(),
      });
    }

    // Calculate totals
    this.calculateCartTotals(cart);
    await cart.save();

    // ✅ Populate product details (simple, no nested)
    await cart.populate({
      path: 'items.product',
      select: 'name slug images stock price categoryId',
    });

    return {
      message: 'Thêm vào giỏ hàng thành công',
      data: cart,
    };
  }

  // F4.2: Get cart
  async getCart(userId: string) {
    let cart = await this.cartModel
      .findOne({ userId })
      .populate({
        path: 'items.product',
        select: 'name slug images price stock isActive categoryId',
      });

    if (!cart) {
      // Return empty cart if not exists
      return {
        message: 'Giỏ hàng trống',
        data: {
          userId,
          items: [],
          totalItems: 0,
          totalPrice: 0,
        },
      };
    }

    // Filter out inactive products
    const validItems = cart.items.filter(
      (item: any) => item.product && item.product.isActive,
    );

    if (validItems.length !== cart.items.length) {
      cart.items = validItems;
      this.calculateCartTotals(cart);
      await cart.save();
    }

    return {
      message: 'Lấy giỏ hàng thành công',
      data: cart,
    };
  }

  // F4.3: Update quantity
  async updateCartItem(userId: string, updateDto: UpdateCartItemDto) {
    const { productId, quantity } = updateDto;

    const cart = await this.cartModel.findOne({ userId });
    if (!cart) {
      throw new NotFoundException('Giỏ hàng trống');
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId,
    );

    if (itemIndex === -1) {
      throw new NotFoundException('Sản phẩm không có trong giỏ hàng');
    }

    // Verify product and stock
    const productDoc = await this.productModel.findById(productId);
    if (!productDoc || !productDoc.isActive) {
      throw new NotFoundException('Sản phẩm không tồn tại');
    }

    if (quantity > productDoc.stock) {
      throw new BadRequestException(
        `Số lượng vượt quá tồn kho. Tối đa: ${productDoc.stock}`,
      );
    }

    // Update quantity
    cart.items[itemIndex].quantity = quantity;
    cart.items[itemIndex].price = productDoc.price; // Update price

    this.calculateCartTotals(cart);
    await cart.save();

    await cart.populate({
      path: 'items.product',
      select: 'name slug images stock price categoryId',
    });

    return {
      message: 'Cập nhật giỏ hàng thành công',
      data: cart,
    };
  }

  // F4.4: Remove item
  async removeItem(userId: string, productId: string) {
    const cart = await this.cartModel.findOne({ userId });
    if (!cart) {
      throw new NotFoundException('Giỏ hàng trống');
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId,
    );

    if (itemIndex === -1) {
      throw new NotFoundException('Sản phẩm không có trong giỏ hàng');
    }

    cart.items.splice(itemIndex, 1);
    this.calculateCartTotals(cart);
    await cart.save();

    await cart.populate('items.product', 'name slug images categoryId');

    return {
      message: 'Xóa sản phẩm khỏi giỏ hàng thành công',
      data: cart,
    };
  }

  // F4.5: Clear cart
  async clearCart(userId: string) {
    const cart = await this.cartModel.findOne({ userId });
    if (!cart) {
      throw new NotFoundException('Giỏ hàng trống');
    }

    cart.items = [];
    cart.totalItems = 0;
    cart.totalPrice = 0;
    await cart.save();

    return {
      message: 'Đã xóa toàn bộ giỏ hàng',
      data: cart,
    };
  }

  // Helper: Calculate totals
  private calculateCartTotals(cart: CartDocument) {
    cart.totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    cart.totalPrice = cart.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
  }

  // Helper: Get cart for internal use (orders)
  async getCartForCheckout(userId: string) {
    const cart = await this.cartModel
      .findOne({ userId })
      .populate({
        path: 'items.product',
        select: 'name slug images price stock isActive categoryId',
      });

    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('Giỏ hàng trống');
    }

    // Verify all products
    for (const item of cart.items) {
      const product = item.product as any;

      if (!product || !product.isActive) {
        throw new BadRequestException(
          `Sản phẩm ${product?.name || 'không xác định'} không còn khả dụng`,
        );
      }

      if (item.quantity > product.stock) {
        throw new BadRequestException(
          `Sản phẩm ${product.name} chỉ còn ${product.stock} trong kho`,
        );
      }
    }

    return cart;
  }
}