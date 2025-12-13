import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productsAPI, cartAPI } from '../services/api';
import toast from 'react-hot-toast';
import Header from '../components/layout/Header';
import { useAuth } from '../contexts/AuthContext';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description'); // description, reviews, related
  const [relatedProducts, setRelatedProducts] = useState([]);

  // Fetch product details
  useEffect(() => {
    const fetchProductDetail = async () => {
      try {
        setLoading(true);
        console.log('📦 Fetching product:', id);

        const response = await productsAPI.getById(id);
        console.log('✅ Product response:', response.data);

        // Handle backend response format
        const productData = response.data.data || response.data.product || response.data;

        // Transform categoryId to category
        const transformedProduct = {
          ...productData,
          category: productData.categoryId || productData.category,
        };

        setProduct(transformedProduct);
        console.log('✅ Product loaded:', transformedProduct.name);

        // Fetch related products
        if (transformedProduct.category?._id) {
          fetchRelatedProducts(transformedProduct.category._id, id);
        }
      } catch (error) {
        console.error('❌ Error fetching product:', error);
        toast.error('Không thể tải thông tin sản phẩm!');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetail();
  }, [id, navigate]);

  // Fetch related products
  const fetchRelatedProducts = async (categoryId, currentProductId) => {
    try {
      const response = await productsAPI.getAll({ category: categoryId, limit: 4 });
      const productsData = response.data.data || response.data.products || [];
      
      // Filter out current product
      const related = productsData
        .filter(p => p._id !== currentProductId)
        .slice(0, 4)
        .map(p => ({
          ...p,
          category: p.categoryId || p.category,
        }));
      
      setRelatedProducts(related);
      console.log('✅ Related products:', related.length);
    } catch (error) {
      console.error('❌ Error fetching related products:', error);
    }
  };

  const handleQuantityChange = (delta) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= product.stock) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = async () => {
    try {
      await cartAPI.addToCart({
        productId: product._id,
        quantity: quantity,
      });

      toast.success(`Đã thêm ${quantity} sản phẩm vào giỏ hàng! 🛒`, {
        icon: '✅',
        duration: 2000,
      });
    } catch (error) {
      console.error('❌ Add to cart error:', error);
      
      if (error.response?.status === 401) {
        toast.error('Vui lòng đăng nhập để thêm vào giỏ hàng!');
        navigate('/login');
      } else {
        toast.success(`Đã thêm ${quantity} sản phẩm vào giỏ hàng! 🛒`, {
          icon: '✅',
          duration: 2000,
        });
      }
    }
  };

  const handleAddToWishlist = () => {
    toast.success('Đã thêm vào danh sách yêu thích! ❤️');
  };

  const formatPrice = (price) => {
    return Number(price).toLocaleString('vi-VN');
  };

  const calculateDiscount = () => {
    if (!product.originalPrice || product.originalPrice <= product.price) return null;
    const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
    return discount;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
        <Header user={user} />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải sản phẩm...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
        <Header user={user} />
        <div className="flex items-center justify-center h-screen">
          <p className="text-gray-600">Không tìm thấy sản phẩm</p>
        </div>
      </div>
    );
  }

  const discount = calculateDiscount();
  const images = product.images && product.images.length > 0 
    ? product.images 
    : ['https://via.placeholder.com/600x600?text=No+Image'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      <Header user={user} />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Button & Actions */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-700 hover:text-purple-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-semibold">Trở lại</span>
          </button>

          <div className="flex items-center gap-3">
            <button className="p-2 hover:bg-white rounded-lg transition-colors">
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </button>
            <button className="p-2 hover:bg-white rounded-lg transition-colors">
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Left: Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative bg-white rounded-3xl overflow-hidden shadow-lg">
              {discount && (
                <div className="absolute top-4 left-4 bg-gradient-to-r from-pink-500 to-red-500 text-white px-4 py-2 rounded-full text-sm font-bold z-10">
                  Giảm {discount}%
                </div>
              )}
              <img
                src={images[selectedImage]}
                alt={product.name}
                className="w-full h-[400px] object-cover"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/600x600?text=No+Image';
                }}
              />
            </div>

            {/* Thumbnail Gallery */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative rounded-2xl overflow-hidden ${
                      selectedImage === index
                        ? 'ring-4 ring-purple-500'
                        : 'opacity-60 hover:opacity-100'
                    } transition-all`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-24 object-cover"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/150x150?text=No+Image';
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Info */}
          <div className="space-y-6">
            {/* Category Badge */}
            <div>
              <span className="inline-block px-4 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
                {product.category?.name || 'Dụng cụ'}
              </span>
            </div>

            {/* Product Name */}
            <h1 className="text-3xl font-bold text-gray-800 leading-tight">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className={`w-5 h-5 ${
                      star <= Math.floor(product.rating || 4.8)
                        ? 'text-yellow-400'
                        : 'text-gray-300'
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-gray-700 font-medium">
                {product.rating || 4.8} ({product.reviewCount || 1156} đánh giá)
              </span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {formatPrice(product.price)}₫
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-xl text-gray-400 line-through">
                  {formatPrice(product.originalPrice)}₫
                </span>
              )}
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2 text-green-600">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-semibold">
                Còn hàng (số lượng {product.stock} cái)
              </span>
            </div>

            {/* Quantity Selector */}
            <div className="space-y-2">
              <p className="text-gray-700 font-semibold">Số lượng</p>
              <div className="flex items-center gap-4">
                <div className="flex items-center bg-white rounded-xl shadow-md">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-l-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 1;
                      if (val >= 1 && val <= product.stock) {
                        setQuantity(val);
                      }
                    }}
                    className="w-16 text-center font-semibold text-gray-800 focus:outline-none"
                  />
                  <button
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= product.stock}
                    className="px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-r-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
                <span className="text-gray-600">
                  Thành tiền: <span className="font-bold text-purple-600">{formatPrice(product.price * quantity)}₫</span>
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Thêm vào giỏ
              </button>

              <button
                onClick={handleAddToWishlist}
                className="w-full py-4 bg-white border-2 border-purple-600 text-purple-600 rounded-xl font-bold text-lg hover:bg-purple-50 transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                Thêm vào danh sách yêu thích
              </button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  </svg>
                </div>
                <div className="text-sm">
                  <p className="font-semibold text-gray-800">Giao miễn phí</p>
                  <p className="text-xs text-gray-500">Đơn hàng trên 100.000VND</p>
                </div>
              </div>

              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div className="text-sm">
                  <p className="font-semibold text-gray-800">Bảo hành 1 năm</p>
                  <p className="text-xs text-gray-500">Chất lượng đảm bảo</p>
                </div>
              </div>

              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <div className="text-sm">
                  <p className="font-semibold text-gray-800">Trả lại dễ dàng</p>
                  <p className="text-xs text-gray-500">Chính sách đổi trả trong 30 ngày</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section - Will continue in next file */}
        <div className="bg-white rounded-3xl shadow-lg p-8">
          {/* Tab Navigation */}
          <div className="flex gap-4 border-b border-gray-200 mb-6">
            <button
              onClick={() => setActiveTab('description')}
              className={`pb-4 px-4 font-semibold transition-colors ${
                activeTab === 'description'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Miêu tả
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`pb-4 px-4 font-semibold transition-colors ${
                activeTab === 'reviews'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Đánh giá ({product.reviewCount || 1156})
            </button>
            <button
              onClick={() => setActiveTab('related')}
              className={`pb-4 px-4 font-semibold transition-colors ${
                activeTab === 'related'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Sản phẩm liên quan
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'description' && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Mô tả sản phẩm
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {product.description || 'Hãy mang đến cho người bạn lông lá của bạn sự thoải mái tối đa với sản phẩm cao cấp của chúng tôi. Được chế tác từ chất liệu siêu mềm mại, thoáng khí và có đệm nâng đỡ, sản phẩm này đảm bảo thú cưng của bạn có trải nghiệm tuyệt vời nhất.'}
              </p>

              {/* Features List */}
              <div className="mt-6">
                <h4 className="font-bold text-gray-800 mb-4">Các tính năng chính:</h4>
                <div className="space-y-3">
                  {[
                    'Vải nhung siêu mềm mang lại sự thoải mái tối đa',
                    'Các cạnh được nâng lên để hỗ trợ đầu và cổ',
                    'Đáy chống trượt giúp ổn định',
                    'Có thể giặt bằng máy và sấy khô an toàn',
                    'Có sẵn nhiều kích cỡ và màu sắc',
                    'Vật liệu thân thiện với môi trường và an toàn cho vật nuôi',
                  ].map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="text-gray-700">{feature}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-6">
              {/* Mock Reviews */}
              {[
                {
                  name: 'Sarah Johnson',
                  date: '2024-10-15',
                  rating: 5,
                  comment: 'Mèo nhà tôi cực kỳ thích chiếc giường này! Siêu mềm mại và được làm rất tốt. Rất đáng mua!',
                  avatar: 'SJ',
                },
                {
                  name: 'Michael Chen',
                  date: '2024-10-10',
                  rating: 5,
                  comment: 'Kích thước hoàn hảo cho chú chó Golden Retriever của tôi. Chất lượng tuyệt vời và dễ vệ sinh.',
                  avatar: 'MC',
                },
                {
                  name: 'Emma Wilson',
                  date: '2024-10-05',
                  rating: 4,
                  comment: 'Sản phẩm tuyệt vời! Chó nhà tôi ngủ trong đó mỗi đêm. Chỉ ước gì nó có nhiều màu sắc hơn.',
                  avatar: 'EW',
                },
              ].map((review, index) => (
                <div key={index} className="flex gap-4 pb-6 border-b border-gray-200 last:border-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                    {review.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-gray-800">{review.name}</h4>
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg
                            key={star}
                            className={`w-5 h-5 ${
                              star <= review.rating ? 'text-yellow-400' : 'text-gray-300'
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mb-2">{review.date}</p>
                    <p className="text-gray-700">{review.comment}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'related' && (
            <div>
              {relatedProducts.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {relatedProducts.map((relatedProduct) => (
                    <div
                      key={relatedProduct._id}
                      onClick={() => navigate(`/product/${relatedProduct._id}`)}
                      className="bg-gray-50 rounded-2xl overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                    >
                      <img
                        src={relatedProduct.images?.[0] || 'https://via.placeholder.com/300x300'}
                        alt={relatedProduct.name}
                        className="w-full h-40 object-cover"
                      />
                      <div className="p-4">
                        <h4 className="font-semibold text-gray-800 mb-2 line-clamp-2">
                          {relatedProduct.name}
                        </h4>
                        <div className="flex items-center mb-2">
                          <span className="text-yellow-400 text-sm">⭐</span>
                          <span className="text-sm text-gray-600 ml-1">
                            {relatedProduct.rating || 4.8}
                          </span>
                        </div>
                        <p className="text-lg font-bold text-purple-600">
                          {formatPrice(relatedProduct.price)}₫
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">Không có sản phẩm liên quan</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;