import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { productsAPI, categoriesAPI, cartAPI } from '../services/api';
import Header from '../components/layout/Header';
import toast from 'react-hot-toast';
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  Filter,
  X,
  Star,
  TrendingUp,
  Package,
  Sparkles
} from 'lucide-react';

const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=400&h=400&fit=crop';

// ==================== PRICE RANGE SLIDER COMPONENT ====================
const PriceRangeSlider = ({ minPrice, maxPrice, onPriceChange }) => {
  const [localMin, setLocalMin] = useState(minPrice);
  const [localMax, setLocalMax] = useState(maxPrice);

  useEffect(() => {
    setLocalMin(minPrice);
    setLocalMax(maxPrice);
  }, [minPrice, maxPrice]);

  const handleMinChange = (e) => {
    const value = parseInt(e.target.value) || 0;
    if (value <= localMax) {
      setLocalMin(value);
    }
  };

  const handleMaxChange = (e) => {
    const value = parseInt(e.target.value) || 0;
    if (value >= localMin) {
      setLocalMax(value);
    }
  };

  const handleMinSliderChange = (e) => {
    const value = parseInt(e.target.value);
    if (value <= localMax - 50000) {
      setLocalMin(value);
    }
  };

  const handleMaxSliderChange = (e) => {
    const value = parseInt(e.target.value);
    if (value >= localMin + 50000) {
      setLocalMax(value);
    }
  };

  const handleApply = () => {
    onPriceChange(localMin, localMax);
  };

  const formatPrice = (price) => {
    return (price / 1000).toFixed(0) + 'K';
  };

  const sliderStyle = {
    WebkitAppearance: 'none',
    appearance: 'none',
    background: 'transparent',
    cursor: 'pointer',
    height: '2px',
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-700">Khoảng giá</span>
        <button
          onClick={() => {
            setLocalMin(0);
            setLocalMax(5000000);
            onPriceChange(0, 5000000);
          }}
          className="text-xs text-purple-600 hover:text-purple-700 font-semibold"
        >
          Đặt lại
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1">
          <label className="text-xs text-gray-600 mb-1 block">Từ (₫)</label>
          <input
            type="number"
            value={localMin}
            onChange={handleMinChange}
            min="0"
            max={localMax}
            step="50000"
            className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:border-purple-500 focus:outline-none"
            placeholder="0"
          />
        </div>
        <span className="text-gray-400 mt-6">→</span>
        <div className="flex-1">
          <label className="text-xs text-gray-600 mb-1 block">Đến (₫)</label>
          <input
            type="number"
            value={localMax}
            onChange={handleMaxChange}
            min={localMin}
            max="5000000"
            step="50000"
            className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:border-purple-500 focus:outline-none"
            placeholder="5000000"
          />
        </div>
      </div>

      <div className="text-center py-2 bg-purple-50 rounded-lg">
        <span className="text-sm text-purple-700 font-semibold">
          {formatPrice(localMin)} - {formatPrice(localMax)}
        </span>
      </div>

      <div className="relative h-12 flex items-center">
        <div className="absolute w-full h-2 bg-gray-200 rounded-full"></div>
        <div
          className="absolute h-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full pointer-events-none"
          style={{
            left: `${(localMin / 5000000) * 100}%`,
            width: `${((localMax - localMin) / 5000000) * 100}%`,
          }}
        ></div>
        <input
          type="range"
          min="0"
          max="5000000"
          step="50000"
          value={localMin}
          onChange={handleMinSliderChange}
          className="absolute w-full appearance-none bg-transparent pointer-events-auto cursor-pointer z-20 range-slider"
          style={sliderStyle}
        />
        <input
          type="range"
          min="0"
          max="5000000"
          step="50000"
          value={localMax}
          onChange={handleMaxSliderChange}
          className="absolute w-full appearance-none bg-transparent pointer-events-auto cursor-pointer z-30 range-slider"
          style={sliderStyle}
        />
      </div>

      <button
        onClick={handleApply}
        className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
      >
        <Filter size={18} />
        <span>Áp dụng lọc giá</span>
      </button>

      <div className="space-y-2">
        <p className="text-xs text-gray-600 mb-2">Chọn nhanh:</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: 'Dưới 100K', min: 0, max: 100000 },
            { label: '100K - 300K', min: 100000, max: 300000 },
            { label: '300K - 500K', min: 300000, max: 500000 },
            { label: 'Trên 500K', min: 500000, max: 5000000 },
          ].map((range) => (
            <button
              key={range.label}
              onClick={() => {
                setLocalMin(range.min);
                setLocalMax(range.max);
                onPriceChange(range.min, range.max);
              }}
              className="px-3 py-2 bg-gray-50 hover:bg-purple-50 border border-gray-200 hover:border-purple-300 rounded-lg text-xs font-medium text-gray-700 hover:text-purple-600 transition-all"
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// ==================== RATING FILTER COMPONENT ====================
const RatingFilter = ({ selectedRating, onRatingChange }) => {
  const ratings = [5, 4, 3, 2, 1];

  return (
    <div className="space-y-2">
      <span className="text-sm font-semibold text-gray-700 block mb-3">Đánh giá</span>
      {ratings.map((rating) => (
        <button
          key={rating}
          onClick={() => onRatingChange(rating === selectedRating ? null : rating)}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
            rating === selectedRating
              ? 'bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-500'
              : 'bg-white border border-gray-200 hover:border-purple-300'
          }`}
        >
          <div className="flex items-center gap-1">
            {[...Array(rating)].map((_, i) => (
              <Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />
            ))}
            {[...Array(5 - rating)].map((_, i) => (
              <Star key={`empty-${i}`} size={14} className="text-gray-300" />
            ))}
          </div>
          <span className="text-sm text-gray-700">trở lên</span>
        </button>
      ))}
    </div>
  );
};

// ==================== PAGINATION COMPONENT ====================
const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  showPageNumbers = true,
  itemsPerPage,
  totalItems,
}) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const delta = 2;
    const pages = [];
    const rangeStart = Math.max(2, currentPage - delta);
    const rangeEnd = Math.min(totalPages - 1, currentPage + delta);

    pages.push(1);
    if (rangeStart > 2) pages.push('...');
    for (let i = rangeStart; i <= rangeEnd; i++) pages.push(i);
    if (rangeEnd < totalPages - 1) pages.push('...');
    if (totalPages > 1) pages.push(totalPages);

    return pages;
  };

  const handlePageClick = (page) => {
    if (page !== '...' && page !== currentPage) {
      onPageChange(page);
    }
  };

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="mt-12 bg-white rounded-2xl shadow-md p-6">
      <div className="flex items-center justify-center mb-6">
        <p className="text-sm text-gray-600">
          Hiển thị <span className="font-semibold text-purple-600">{startItem}</span> -{' '}
          <span className="font-semibold text-purple-600">{endItem}</span> trong tổng số{' '}
          <span className="font-semibold text-purple-600">{totalItems}</span> sản phẩm
        </p>
      </div>

      <div className="flex items-center justify-center gap-2">
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="p-2 rounded-xl border-2 border-gray-200 hover:border-purple-500 hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <ChevronsLeft size={20} className="text-gray-600" />
        </button>

        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-4 py-2 rounded-xl border-2 border-gray-200 hover:border-purple-500 hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 font-semibold text-gray-700"
        >
          <ChevronLeft size={18} />
          <span className="hidden sm:inline">Trước</span>
        </button>

        {showPageNumbers && totalPages > 1 && (
          <div className="hidden md:flex items-center gap-1">
            {getPageNumbers().map((page, index) => {
              if (page === '...') {
                return <span key={`ellipsis-${index}`} className="px-3 py-2 text-gray-400">...</span>;
              }
              return (
                <button
                  key={page}
                  onClick={() => handlePageClick(page)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    page === currentPage
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg transform scale-105'
                      : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-purple-500 hover:bg-purple-50'
                  }`}
                >
                  {page}
                </button>
              );
            })}
          </div>
        )}

        <div className="md:hidden px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl text-sm font-semibold text-purple-700">
          {currentPage} / {totalPages}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 font-semibold"
        >
          <span className="hidden sm:inline">Sau</span>
          <ChevronRight size={18} />
        </button>

        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-xl border-2 border-gray-200 hover:border-purple-500 hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <ChevronsRight size={20} className="text-gray-600" />
        </button>
      </div>
    </div>
  );
};

// ==================== SHOP COMPONENT ====================
const Shop = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0
  });

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(5000000);
  const [minRating, setMinRating] = useState(null);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [isFeatured, setIsFeatured] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedTag, setSelectedTag] = useState('');

  const brands = ['Royal Canin', 'Pedigree', 'Whiskas', 'Me-O', 'SmartHeart', 'Minino'];
  const tags = ['Bestseller', 'New Arrival', 'On Sale', 'Premium', 'Organic'];

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [
    selectedCategory,
    searchQuery,
    minPrice,
    maxPrice,
    minRating,
    sortBy,
    sortOrder,
    pagination.page,
    isFeatured,
    selectedBrand,
    selectedTag
  ]);

  const fetchCategories = async () => {
    try {
      const response = await categoriesAPI.getAll();
      let categoriesData = [];
      if (Array.isArray(response.data)) {
        categoriesData = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        categoriesData = response.data.data;
      }
      setCategories(categoriesData);
    } catch (error) {
      console.error('❌ Error fetching categories:', error);
      setCategories([]);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        sortBy,
        sortOrder,
      };

      if (selectedCategory && selectedCategory !== 'all') {
        params.categoryId = selectedCategory;
      }

      if (searchQuery && searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      if (minPrice > 0) {
        params.minPrice = minPrice;
      }
      if (maxPrice < 5000000) {
        params.maxPrice = maxPrice;
      }

      if (minRating) {
        params.minRating = minRating;
      }

      if (isFeatured) {
        params.isFeatured = true;
      }

      if (selectedBrand) {
        params.brand = selectedBrand;
      }

      if (selectedTag) {
        params.tag = selectedTag;
      }

      const response = await productsAPI.getAll(params);
      
      let productsData = [];
      if (response?.data?.data && Array.isArray(response.data.data)) {
        productsData = response.data.data;
      } else if (response?.data && Array.isArray(response.data)) {
        productsData = response.data;
      } else if (Array.isArray(response)) {
        productsData = response;
      }
      
      setProducts(productsData);
      
      let paginationInfo = null;
      if (response?.data?.pagination) {
        paginationInfo = response.data.pagination;
      } else if (response?.pagination) {
        paginationInfo = response.pagination;
      } else if (response?.data?.total !== undefined) {
        paginationInfo = {
          total: response.data.total,
          totalPages: response.data.totalPages || Math.ceil(response.data.total / pagination.limit)
        };
      }
      
      if (paginationInfo) {
        setPagination({
          page: pagination.page,
          limit: pagination.limit,
          total: paginationInfo.total || productsData.length,
          totalPages: paginationInfo.totalPages || Math.ceil((paginationInfo.total || productsData.length) / pagination.limit)
        });
      } else {
        setPagination({
          page: pagination.page,
          limit: pagination.limit,
          total: productsData.length,
          totalPages: productsData.length > 0 ? 1 : 0
        });
      }
      
    } catch (error) {
      console.error('❌ Error fetching products:', error);
      toast.error('Không thể tải sản phẩm!');
      setProducts([]);
      setPagination({
        page: 1,
        limit: 12,
        total: 0,
        totalPages: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (e, product) => {
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

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePriceChange = (min, max) => {
    setMinPrice(min);
    setMaxPrice(max);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleRatingChange = (rating) => {
    setMinRating(rating);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleSortChange = (value) => {
    const [newSortBy, newSortOrder] = value.split('-');
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleBrandChange = (brand) => {
    setSelectedBrand(brand === selectedBrand ? '' : brand);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleTagChange = (tag) => {
    setSelectedTag(tag === selectedTag ? '' : tag);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearAllFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    setMinPrice(0);
    setMaxPrice(5000000);
    setMinRating(null);
    setIsFeatured(false);
    setSelectedBrand('');
    setSelectedTag('');
    setSortBy('createdAt');
    setSortOrder('desc');
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (selectedCategory !== 'all') count++;
    if (searchQuery) count++;
    if (minPrice > 0 || maxPrice < 5000000) count++;
    if (minRating) count++;
    if (isFeatured) count++;
    if (selectedBrand) count++;
    if (selectedTag) count++;
    return count;
  };

  const formatPrice = (price) => {
    return Number(price).toLocaleString('vi-VN');
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return { text: 'Hết hàng', bg: 'bg-red-100', text_color: 'text-red-800' };
    if (stock < 10) return { text: 'Sắp hết', bg: 'bg-orange-100', text_color: 'text-orange-800' };
    return { text: 'Còn hàng', bg: 'bg-green-100', text_color: 'text-green-800' };
  };

  const getCategoryIcon = (categoryName) => {
    const icons = {
      'Thức ăn': '🍖',
      'Đồ chơi': '🎾',
      'Phụ kiện': '🎀',
      'Vệ sinh': '🧼',
      'Y tế': '💊',
      'Quần áo': '👕',
      'Giường nằm': '🛏️',
      'Khác': '📦',
    };
    return icons[categoryName] || '📦';
  };

  const allCategory = { _id: 'all', name: 'Tất cả', icon: '🏠' };
  const allCategories = [allCategory, ...categories];
  const displayCount = pagination.total || products.length;
  const activeFiltersCount = getActiveFiltersCount();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      <Header user={user} />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Cửa hàng sản phẩm 🛍️</h1>
            <p className="text-gray-600">
              {loading ? 'Đang tải sản phẩm...' : `${displayCount} sản phẩm`}
            </p>
          </div>
          <button
            onClick={() => navigate('/cart')}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2"
          >
            <Package size={20} />
            <span>Giỏ hàng</span>
          </button>
        </div>

        {/* FIXED Quick Action Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <button
            onClick={() => {
              setIsFeatured(!isFeatured);
              setPagination(prev => ({ ...prev, page: 1 }));
            }}
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all transform ${
              isFeatured
                ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg scale-105 ring-4 ring-yellow-200'
                : 'bg-white text-gray-700 hover:shadow-md hover:scale-105 border-2 border-gray-200'
            }`}
          >
            <Sparkles size={18} className={isFeatured ? 'animate-pulse' : ''} />
            <span>Nổi bật</span>
          </button>

          <button
            onClick={() => {
              const isActive = sortBy === 'soldCount' && sortOrder === 'desc';
              if (isActive) {
                setSortBy('createdAt');
                setSortOrder('desc');
              } else {
                handleSortChange('soldCount-desc');
              }
            }}
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all transform ${
              sortBy === 'soldCount' && sortOrder === 'desc'
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg scale-105 ring-4 ring-green-200'
                : 'bg-white text-gray-700 hover:shadow-md hover:scale-105 border-2 border-gray-200'
            }`}
          >
            <TrendingUp size={18} className={sortBy === 'soldCount' && sortOrder === 'desc' ? 'animate-bounce' : ''} />
            <span>Bán chạy</span>
          </button>

          <button
            onClick={() => {
              const isActive = sortBy === 'createdAt' && sortOrder === 'desc';
              if (isActive) {
                setSortBy('price');
                setSortOrder('asc');
              } else {
                handleSortChange('createdAt-desc');
              }
            }}
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all transform ${
              sortBy === 'createdAt' && sortOrder === 'desc'
                ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg scale-105 ring-4 ring-blue-200'
                : 'bg-white text-gray-700 hover:shadow-md hover:scale-105 border-2 border-gray-200'
            }`}
          >
            <Package size={18} className={sortBy === 'createdAt' && sortOrder === 'desc' ? 'animate-pulse' : ''} />
            <span>Mới nhất</span>
          </button>

          <button
            onClick={() => {
              const isActive = sortBy === 'rating' && sortOrder === 'desc';
              if (isActive) {
                setSortBy('createdAt');
                setSortOrder('desc');
              } else {
                handleSortChange('rating-desc');
              }
            }}
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all transform ${
              sortBy === 'rating' && sortOrder === 'desc'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg scale-105 ring-4 ring-purple-200'
                : 'bg-white text-gray-700 hover:shadow-md hover:scale-105 border-2 border-gray-200'
            }`}
          >
            <Star size={18} />
            <span>Top rating</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-6 bg-white rounded-2xl shadow-md p-4">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Tìm kiếm sản phẩm... (VD: thức ăn cho chó, đồ chơi mèo)"
              className="w-full px-6 py-4 pl-14 pr-24 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-all text-gray-700 placeholder-gray-400"
            />
            
            <div className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {searchQuery && (
              <button
                onClick={() => handleSearch('')}
                className="absolute right-20 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            )}

            <button
              onClick={() => fetchProducts()}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              Tìm
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mt-3">
            <span className="text-sm text-gray-600">Tìm nhanh:</span>
            {['Thức ăn chó', 'Thức ăn mèo', 'Đồ chơi', 'Phụ kiện', 'Vệ sinh'].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => handleSearch(suggestion)}
                className="px-3 py-1 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:border-purple-500 hover:text-purple-600 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-6">
          {/* Sidebar Filters */}
          <div className={`${showFilters ? 'block' : 'hidden'} lg:block w-full lg:w-64 flex-shrink-0`}>
            <div className="bg-white rounded-2xl shadow-md p-6 sticky top-24 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Filter size={20} className="text-purple-600" />
                  <h3 className="font-bold text-gray-800">Bộ lọc</h3>
                  {activeFiltersCount > 0 && (
                    <span className="px-2 py-1 bg-purple-100 text-purple-600 rounded-full text-xs font-semibold">
                      {activeFiltersCount}
                    </span>
                  )}
                </div>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="text-xs text-purple-600 hover:text-purple-700 font-semibold"
                  >
                    Xóa tất cả
                  </button>
                )}
              </div>

              <hr className="border-gray-200" />

              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Danh mục</h4>
                <div className="space-y-2">
                  {allCategories.map((category) => {
                    const isSelected = selectedCategory === category._id;
                    const icon = category.icon || getCategoryIcon(category.name);

                    return (
                      <button
                        key={category._id}
                        onClick={() => handleCategoryChange(category._id)}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all ${
                          isSelected
                            ? 'bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-500 text-purple-700'
                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <span className="text-lg">{icon}</span>
                        <span className="text-sm">{category.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <hr className="border-gray-200" />

              <PriceRangeSlider
                minPrice={minPrice}
                maxPrice={maxPrice}
                onPriceChange={handlePriceChange}
              />

              <hr className="border-gray-200" />

              <RatingFilter
                selectedRating={minRating}
                onRatingChange={handleRatingChange}
              />

              <hr className="border-gray-200" />

              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Thương hiệu</h4>
                <div className="space-y-2">
                  {brands.map((brand) => (
                    <button
                      key={brand}
                      onClick={() => handleBrandChange(brand)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                        selectedBrand === brand
                          ? 'bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-500 text-purple-700 font-semibold'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {brand}
                    </button>
                  ))}
                </div>
              </div>

              <hr className="border-gray-200" />

              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => handleTagChange(tag)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                        selectedTag === tag
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="lg:hidden mb-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white rounded-xl font-semibold text-gray-700 hover:shadow-md transition-all"
              >
                <Filter size={18} />
                <span>Bộ lọc</span>
                {activeFiltersCount > 0 && (
                  <span className="px-2 py-1 bg-purple-100 text-purple-600 rounded-full text-xs">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div className="text-gray-600">
                <span className="font-semibold text-gray-900">{displayCount}</span> sản phẩm
                {searchQuery && (
                  <span className="ml-2">
                    cho "<span className="font-semibold text-purple-600">{searchQuery}</span>"
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <span className="text-gray-600 text-sm">Sắp xếp:</span>
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="px-4 py-2 border-2 border-gray-200 rounded-xl bg-white focus:border-purple-500 focus:outline-none transition-colors text-gray-700 cursor-pointer"
                >
                  <option value="createdAt-desc">Mới nhất</option>
                  <option value="createdAt-asc">Cũ nhất</option>
                  <option value="price-asc">Giá: Thấp → Cao</option>
                  <option value="price-desc">Giá: Cao → Thấp</option>
                  <option value="name-asc">Tên: A-Z</option>
                  <option value="name-desc">Tên: Z-A</option>
                  <option value="soldCount-desc">Bán chạy nhất</option>
                  <option value="rating-desc">Đánh giá cao nhất</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Đang tải...</p>
                </div>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-32 h-32 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-6xl">📦</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-700 mb-2">Không tìm thấy sản phẩm</h3>
                <p className="text-gray-500 mb-6">Thử thay đổi bộ lọc hoặc tìm kiếm từ khóa khác</p>
                <button
                  onClick={clearAllFilters}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  Xóa tất cả bộ lọc
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => {
                  const stockStatus = getStockStatus(product.stock || 0);
                  const imageUrl = product.images?.[0] || PLACEHOLDER_IMAGE;
                  const categoryData = product.category || product.categoryId;
                  const categoryName = categoryData?.name || 'Chưa phân loại';

                  return (
                    <div
                      key={product._id}
                      onClick={() => navigate(`/product/${product._id}`)}
                      className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all cursor-pointer overflow-hidden group"
                    >
                      <div className="relative h-48 bg-gray-100 overflow-hidden">
                        <img
                          src={imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          onError={(e) => {
                            e.target.src = PLACEHOLDER_IMAGE;
                          }}
                        />
                        
                        <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold ${stockStatus.bg} ${stockStatus.text_color}`}>
                          {stockStatus.text}
                        </div>

                        {product.rating > 0 && (
                          <div className="absolute top-3 left-3 px-3 py-1 bg-yellow-400 text-yellow-900 rounded-full text-xs font-semibold flex items-center gap-1">
                            <Star size={12} className="fill-yellow-900" />
                            {product.rating.toFixed(1)}
                          </div>
                        )}

                        {product.isFeatured && (
                          <div className="absolute bottom-3 left-3 px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full text-xs font-semibold flex items-center gap-1">
                            <Sparkles size={12} />
                            Nổi bật
                          </div>
                        )}
                      </div>

                      <div className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-xs text-purple-600 font-semibold">
                            {categoryName}
                          </div>
                          {product.brand && (
                            <div className="text-xs text-gray-500">
                              {product.brand}
                            </div>
                          )}
                        </div>

                        <h3 className="font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors min-h-[3rem]">
                          {product.name}
                        </h3>

                        <p className="text-sm text-gray-600 mb-3 line-clamp-2 min-h-[2.5rem]">
                          {product.description || 'Sản phẩm chất lượng cao cho thú cưng'}
                        </p>

                        {product.tags && product.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {product.tags.slice(0, 2).map((tag, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                          <div>
                            <div className="text-xl font-bold text-purple-600">
                              {formatPrice(product.price)}₫
                            </div>
                            {product.originalPrice && product.originalPrice > product.price && (
                              <div className="flex items-center gap-2">
                                <div className="text-xs text-gray-400 line-through">
                                  {formatPrice(product.originalPrice)}₫
                                </div>
                                <div className="text-xs text-red-600 font-semibold">
                                  -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                                </div>
                              </div>
                            )}
                          </div>

                          <button
                            onClick={(e) => handleAddToCart(e, product)}
                            disabled={product.stock === 0}
                            className={`p-3 rounded-xl transition-all ${
                              product.stock === 0
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg transform hover:scale-110'
                            }`}
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {!loading && products.length > 0 && pagination.totalPages > 1 && (
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
                showPageNumbers={true}
                itemsPerPage={pagination.limit}
                totalItems={pagination.total || products.length}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;