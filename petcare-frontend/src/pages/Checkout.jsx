import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { cartAPI, ordersAPI } from '../services/api';
import QrPaymentModal from '../components/payment/QrPaymentModal';

const Checkout = () => {
  const navigate = useNavigate();
  
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState(null);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: 'Ho Chi Minh',
    state: 'Q1',
    zipCode: '',
    note: '',
  });

  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setFormData(prev => ({
          ...prev,
          fullName: userData.name || '',
          email: userData.email || '',
        }));
      } catch (error) {
        console.error('Error parsing user:', error);
      }
    }
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const response = await cartAPI.getCart();
      const cartData = response.data?.data || response.data;
      
      if (cartData && cartData.items && Array.isArray(cartData.items)) {
        const transformedCart = {
          ...cartData,
          items: cartData.items.map(item => ({
            productId: item.product?._id || item.productId,
            name: item.product?.name || item.name || 'Unknown',
            price: item.price || item.product?.price || 0,
            quantity: item.quantity || 1,
            image: item.product?.images?.[0] || item.image || '/placeholder.jpg',
          }))
        };
        setCart(transformedCart);
      } else {
        setCart({ items: [] });
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      toast.error('Không thể tải giỏ hàng!');
      setCart({ items: [] });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Vui lòng nhập họ tên';
    if (!formData.phone.trim()) newErrors.phone = 'Vui lòng nhập số điện thoại';
    if (!formData.address.trim()) newErrors.address = 'Vui lòng nhập địa chỉ';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    if (!cart || !cart.items || cart.items.length === 0) {
      toast.error('Giỏ hàng trống!');
      return;
    }

    setSubmitting(true);

    const orderData = {
      shippingAddress: {
        fullName: formData.fullName,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        district: formData.state,
        ward: formData.zipCode,
        note: formData.note,
      },
      paymentMethod,
      note: formData.note,
    };

    try {
      console.log('📤 Submitting order...');
      const response = await ordersAPI.checkout(orderData);
      console.log('📡 Full response:', response);
      console.log('📡 response.data:', response.data);

      // ✅ FIX: Handle different response structures
      // Backend may return: {message, data} or just {order data}
      let order = response.data?.data || response.data;
      
      console.log('📦 Order object:', order);
      console.log('📦 Order ID:', order._id);
      console.log('📦 Order Number:', order.orderNumber);

      if (!order || !order._id) {
        throw new Error('Không nhận được thông tin đơn hàng');
      }

      // ✅ QR Payment flow
      if (paymentMethod === 'bank_transfer') {
        console.log('💰 === BANK TRANSFER FLOW ===');
        console.log('💰 Setting order ID:', order._id);
        
        setCurrentOrderId(order._id);  // ✅ Should have value now!
        setShowQrModal(true);
        
        console.log('💰 Modal should open with ID:', order._id);
        console.log('💰 ==========================');
      } 
      // COD - Redirect to success
      else {
        console.log('💵 COD payment - redirecting...');
        navigate('/order-success', {
          state: {
            orderId: order.orderNumber,
            total: order.total,
            shippingInfo: formData,
          }
        });
      }
    } catch (error) {
      console.error('❌ Order error:', error);
      console.error('❌ Error response:', error.response?.data);
      toast.error(error.response?.data?.message || 'Không thể tạo đơn hàng!');
    } finally {
      setSubmitting(false);
    }
  };

  const total = cart?.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Stepper */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            <div className="flex items-center">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
                  ✓
                </div>
                <span className="ml-2 text-sm font-semibold text-green-600">Giỏ hàng</span>
              </div>
              <div className="w-20 h-1 bg-purple-600 mx-4"></div>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                  2
                </div>
                <span className="ml-2 text-sm font-semibold text-purple-600">Thanh toán</span>
              </div>
              <div className="w-20 h-1 bg-gray-300 mx-4"></div>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 font-bold">
                  3
                </div>
                <span className="ml-2 text-sm font-semibold text-gray-500">Hoàn thành</span>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-3 space-y-6">
            {/* Shipping Address */}
            <div className="bg-white rounded-3xl shadow-sm p-8">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Địa chỉ giao hàng</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Họ và Tên <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 bg-gray-50 border-2 ${errors.fullName ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500`}
                    placeholder="Nguyễn Văn A"
                  />
                  {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Số điện thoại <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 bg-gray-50 border-2 ${errors.phone ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500`}
                    />
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Địa chỉ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 bg-gray-50 border-2 ${errors.address ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500`}
                  />
                  {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Ghi chú</label>
                  <textarea
                    name="note"
                    value={formData.note}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-3xl shadow-sm p-8">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Phương thức thanh toán</h2>
              
              <div className="space-y-3">
                <label className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition ${paymentMethod === 'cod' ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-5 h-5 text-purple-600"
                  />
                  <div className="ml-4">
                    <p className="font-semibold text-gray-800">Thanh toán khi nhận hàng (COD)</p>
                    <p className="text-sm text-gray-500">Thanh toán bằng tiền mặt khi nhận hàng</p>
                  </div>
                </label>

                <label className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition ${paymentMethod === 'bank_transfer' ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="bank_transfer"
                    checked={paymentMethod === 'bank_transfer'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-5 h-5 text-purple-600"
                  />
                  <div className="ml-4">
                    <p className="font-semibold text-gray-800">Chuyển khoản ngân hàng</p>
                    <p className="text-sm text-gray-500">Quét mã QR để thanh toán nhanh</p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-sm p-8 sticky top-8">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Đơn hàng</h2>

              <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                {cart?.items?.map((item, index) => (
                  <div key={index} className="flex gap-4">
                    <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-xl" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 text-sm">{item.name}</h3>
                      <p className="text-sm text-gray-500">SL: {item.quantity}</p>
                      <p className="font-bold text-purple-600">{new Intl.NumberFormat('vi-VN').format(item.price)}₫</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t-2 border-gray-100 pt-6 space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Tạm tính</span>
                  <span>{new Intl.NumberFormat('vi-VN').format(total)}₫</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Phí vận chuyển</span>
                  <span className="text-green-600">Miễn phí</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-gray-800 pt-3 border-t-2 border-gray-100">
                  <span>Tổng cộng</span>
                  <span className="text-purple-600">{new Intl.NumberFormat('vi-VN').format(total)}₫</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting || !cart?.items?.length}
                className="w-full mt-6 px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:shadow-xl transition disabled:opacity-50"
              >
                {submitting ? 'Đang xử lý...' : 'Đặt hàng'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* QR Payment Modal */}
      {showQrModal && currentOrderId && (
        <QrPaymentModal
          isOpen={showQrModal}
          onClose={() => {
            setShowQrModal(false);
            setCurrentOrderId(null);
          }}
          orderId={currentOrderId}
          orderTotal={total}
        />
      )}
    </div>
  );
};

export default Checkout;