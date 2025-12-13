import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cartAPI } from '../services/api';
import toast from 'react-hot-toast';
import Header from '../components/layout/Header';
import { useAuth } from '../contexts/AuthContext';

const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=400&h=400&fit=crop';

const Cart = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [promoCode, setPromoCode] = useState('');

  // Fetch cart items
  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      console.log('🛒 Fetching cart...');

      const response = await cartAPI.getCart();
      console.log('✅ Cart response:', response.data);

      // Handle backend response format
      const cartData = response.data.data || response.data.cart || response.data;
      
      // Extract items array
      let items = [];
      if (cartData.items && Array.isArray(cartData.items)) {
        items = cartData.items;
      } else if (Array.isArray(cartData)) {
        items = cartData;
      }

      console.log('📦 Cart items:', items);
      setCartItems(items);
    } catch (error) {
      console.error('❌ Error fetching cart:', error);
      
      if (error.response?.status === 401) {
        toast.error('Vui lòng đăng nhập!');
        navigate('/login');
      } else {
        // Set empty cart for demo
        setCartItems([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = async (productId, delta) => {
    try {
      const item = cartItems.find(i => i.product._id === productId || i.product === productId);
      if (!item) return;
      
      const newQuantity = item.quantity + delta;

      if (newQuantity < 1) return;
      if (newQuantity > item.product.stock) {
        toast.error('Số lượng vượt quá kho!');
        return;
      }

      // Optimistic update
      setCartItems(prevItems =>
        prevItems.map(i =>
          (i.product._id === productId || i.product === productId) 
            ? { ...i, quantity: newQuantity } 
            : i
        )
      );

      // ✅ FIXED: Backend expects { productId, quantity }
      await cartAPI.updateCartItem({ 
        productId: productId, 
        quantity: newQuantity 
      });
      
      toast.success('Đã cập nhật giỏ hàng!', { duration: 1500 });
    } catch (error) {
      console.error('❌ Error updating quantity:', error);
      // Revert on error
      fetchCart();
      toast.error('Cập nhật thất bại!');
    }
  };

  const handleRemoveItem = async (productId) => {
    try {
      // Optimistic update
      setCartItems(prevItems => prevItems.filter(i => 
        i.product._id !== productId && i.product !== productId
      ));

      // ✅ FIXED: DELETE /cart/remove/:productId
      await cartAPI.removeFromCart(productId);
      
      toast.success('Đã xóa sản phẩm khỏi giỏ hàng!');
    } catch (error) {
      console.error('❌ Error removing item:', error);
      // Revert on error
      fetchCart();
      toast.error('Xóa thất bại!');
    }
  };

  const handleApplyPromo = () => {
    if (!promoCode.trim()) {
      toast.error('Vui lòng nhập mã khuyến mãi!');
      return;
    }
    
    // Mock promo code validation
    toast.success('Đã áp dụng mã khuyến mãi!');
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast.error('Giỏ hàng trống!');
      return;
    }
    
    navigate('/checkout');
  };

  const handleContinueShopping = () => {
    navigate('/');
  };

  const formatPrice = (price) => {
    return Number(price).toLocaleString('vi-VN');
  };

  // Calculate totals
  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => {
      const price = item.product?.price || 0;
      const quantity = item.quantity || 0;
      return sum + (price * quantity);
    }, 0);
  };

  const subtotal = calculateSubtotal();
  const shipping = subtotal >= 100000 ? 0 : 30000; // Free shipping over 100k
  const tax = Math.round(subtotal * 0.1); // 10% VAT
  const total = subtotal + shipping + tax;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
        <Header user={user} />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải giỏ hàng...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      <Header user={user} />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-700 hover:text-purple-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-semibold">Trở lại</span>
          </button>

          <div className="text-right">
            <h1 className="text-3xl font-bold text-gray-800">Giỏ hàng</h1>
            <p className="text-gray-600">{cartItems.length} sản phẩm</p>
          </div>
        </div>

        {cartItems.length === 0 ? (
          // Empty Cart
          <div className="text-center py-16">
            <div className="w-32 h-32 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">
              Giỏ hàng trống
            </h3>
            <p className="text-gray-500 mb-6">
              Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm
            </p>
            <button
              onClick={handleContinueShopping}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              Tiếp tục mua sắm
            </button>
          </div>
        ) : (
          // Cart with items
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => {
                // ✅ Handle both product object and product ID
                const productId = item.product?._id || item.product;
                const productData = typeof item.product === 'object' ? item.product : null;
                
                return (
                  <div
                    key={productId}
                    className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex gap-4">
                      {/* Product Image */}
                      <div className="w-24 h-24 flex-shrink-0">
                        <img
                          src={productData?.images?.[0] || PLACEHOLDER_IMAGE}
                          alt={productData?.name || 'Product'}
                          className="w-full h-full object-cover rounded-xl"
                          onError={(e) => {
                            e.target.src = PLACEHOLDER_IMAGE;
                          }}
                        />
                      </div>

                      {/* Product Info */}
                      <div className="flex-1">
                        {/* Category */}
                        <div className="mb-2">
                          <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                            {productData?.category?.name || productData?.categoryId?.name || 'Dụng cụ'}
                          </span>
                        </div>

                        {/* Product Name */}
                        <h3 className="font-bold text-gray-800 mb-2">
                          {productData?.name || 'Sản phẩm'}
                        </h3>

                        {/* Price */}
                        <p className="text-lg font-bold text-gray-800 mb-4">
                          {formatPrice(productData?.price || 0)}₫
                        </p>

                        {/* Quantity & Actions */}
                        <div className="flex items-center justify-between">
                          {/* Quantity Selector */}
                          <div className="flex items-center bg-gray-100 rounded-xl">
                            <button
                              onClick={() => handleQuantityChange(productId, -1)}
                              disabled={item.quantity <= 1}
                              className="px-3 py-2 text-gray-700 hover:bg-gray-200 rounded-l-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              −
                            </button>
                            <span className="px-4 font-semibold text-gray-800">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => handleQuantityChange(productId, 1)}
                              disabled={item.quantity >= (productData?.stock || 0)}
                              className="px-3 py-2 text-gray-700 hover:bg-gray-200 rounded-r-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              +
                            </button>
                          </div>

                          {/* Delete Button */}
                          <button
                            onClick={() => handleRemoveItem(productId)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Xóa sản phẩm"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>

                        {/* Subtotal */}
                        <div className="mt-3 text-right">
                          <span className="text-sm text-gray-600">Tổng số mặt hàng</span>
                          <p className="text-xl font-bold text-purple-600">
                            {formatPrice((productData?.price || 0) * item.quantity)}₫
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Promo Code */}
              <div className="bg-white rounded-2xl shadow-md p-6">
                <div className="flex items-center gap-2 mb-4">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  <span className="font-semibold text-gray-800">
                    Bạn có mã khuyến mãi không?
                  </span>
                </div>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Nhập mã"
                    className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleApplyPromo}
                    className="px-6 py-3 bg-purple-100 text-purple-700 font-semibold rounded-xl hover:bg-purple-200 transition-colors"
                  >
                    Áp dụng
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
                <h2 className="text-xl font-bold text-gray-800 mb-6">
                  Tổng kết đơn hàng
                </h2>

                {/* Summary Details */}
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-700">
                    <span>Tổng phụ</span>
                    <span className="font-semibold">{formatPrice(subtotal)}₫</span>
                  </div>
                  
                  <div className="flex justify-between text-gray-700">
                    <span>Vận chuyển</span>
                    <span className={`font-semibold ${shipping === 0 ? 'text-green-600' : ''}`}>
                      {shipping === 0 ? 'Miễn phí' : `${formatPrice(shipping)}₫`}
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-gray-700">
                    <span>Thuế</span>
                    <span className="font-semibold">{formatPrice(tax)}₫</span>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-800">Tổng</span>
                      <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        {formatPrice(total)}₫
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={handleCheckout}
                    className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all flex items-center justify-center gap-2"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    Tiến hành thanh toán
                  </button>

                  <button
                    onClick={handleContinueShopping}
                    className="w-full py-4 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                  >
                    Tiếp tục mua sắm
                  </button>
                </div>

                {/* Trust Badges */}
                <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <span className="font-medium">Thanh toán an toàn</span>
                  </div>

                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </div>
                    <span className="font-medium">Đổi trả dễ dàng</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;