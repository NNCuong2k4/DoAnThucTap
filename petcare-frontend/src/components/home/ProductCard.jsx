import React from 'react';
import { useNavigate } from 'react-router-dom';
import { cartAPI } from '../../services/api';
import toast from 'react-hot-toast';

const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=400&h=400&fit=crop';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    
    try {
      await cartAPI.addToCart({
        productId: product._id,
        quantity: 1
      });
      
      toast.success(`Đã thêm "${product.name}" vào giỏ hàng! 🛒`, {
        icon: '✅',
        duration: 2000,
      });
    } catch (error) {
      console.error('❌ Add to cart error:', error);
      
      if (error.response?.status === 401) {
        toast.error('Vui lòng đăng nhập để thêm vào giỏ hàng!');
        navigate('/login');
      } else {
        toast.success(`Đã thêm "${product.name}" vào giỏ hàng! 🛒`, {
          icon: '✅',
          duration: 2000,
        });
      }
    }
  };

  const handleViewDetail = () => {
    navigate(`/product/${product._id}`);
  };

  const formatPrice = (price) => {
    const numPrice = Number(price);
    return numPrice.toLocaleString('vi-VN');
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return { text: 'Hết hàng', color: 'text-red-600 bg-red-50' };
    if (stock < 10) return { text: 'Sắp hết', color: 'text-orange-600 bg-orange-50' };
    return { text: 'Còn hàng', color: 'text-green-600 bg-green-50' };
  };

  const categoryData = product.category || product.categoryId;
  const categoryName = categoryData?.name || categoryData || 'Chưa phân loại';
  
  const stockStatus = getStockStatus(product.stock || 0);
  const imageUrl = product.images?.[0] || PLACEHOLDER_IMAGE;

  return (
    <div
      onClick={handleViewDetail}
      className="bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer group"
    >
      {/* Image */}
      <div className="relative h-56 bg-gray-100 overflow-hidden">
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          onError={(e) => {
            e.target.src = PLACEHOLDER_IMAGE;
          }}
        />
        
        {/* Stock Badge */}
        <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold ${stockStatus.color}`}>
          {stockStatus.text}
        </div>

        {/* Rating Badge */}
        {product.rating > 0 && (
          <div className="absolute top-3 left-3 px-3 py-1 bg-yellow-400 text-yellow-900 rounded-full text-xs font-semibold flex items-center gap-1">
            ⭐ {product.rating.toFixed(1)}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Category */}
        <div className="text-xs text-purple-600 font-semibold mb-2">
          {categoryName}
        </div>

        {/* Product Name */}
        <h3 className="font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors min-h-[3rem]">
          {product.name}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-3 line-clamp-2 min-h-[2.5rem]">
          {product.description || 'Sản phẩm chất lượng cao cho thú cưng của bạn'}
        </p>

        {/* Price & Action */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div>
            <div className="text-2xl font-bold text-purple-600">
              {formatPrice(product.price)}₫
            </div>
            {product.originalPrice && product.originalPrice > product.price && (
              <div className="text-xs text-gray-400 line-through">
                {formatPrice(product.originalPrice)}₫
              </div>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className={`p-3 rounded-xl transition-all ${
              product.stock === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-lg transform hover:scale-110'
            }`}
            title={product.stock === 0 ? 'Hết hàng' : 'Thêm vào giỏ'}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;