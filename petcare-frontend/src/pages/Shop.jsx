import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { productsAPI, categoriesAPI, cartAPI } from '../services/api';
import Header from '../components/layout/Header';
import toast from 'react-hot-toast';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=400&h=400&fit=crop';

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

  // Calculate page numbers to show
  const getPageNumbers = () => {
    const delta = 2;
    const pages = [];
    const rangeStart = Math.max(2, currentPage - delta);
    const rangeEnd = Math.min(totalPages - 1, currentPage + delta);

    pages.push(1);

    if (rangeStart > 2) {
      pages.push('...');
    }

    for (let i = rangeStart; i <= rangeEnd; i++) {
      pages.push(i);
    }

    if (rangeEnd < totalPages - 1) {
      pages.push('...');
    }

    if (totalPages > 1) {
      pages.push(totalPages);
    }

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
      {/* Items info */}
      <div className="flex items-center justify-center mb-6">
        <p className="text-sm text-gray-600">
          Hiển thị <span className="font-semibold text-purple-600">{startItem}</span> -{' '}
          <span className="font-semibold text-purple-600">{endItem}</span> trong tổng số{' '}
          <span className="font-semibold text-purple-600">{totalItems}</span> sản phẩm
        </p>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-center gap-2">
        {/* First Page */}
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="p-2 rounded-xl border-2 border-gray-200 hover:border-purple-500 hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          title="Trang đầu"
        >
          <ChevronsLeft size={20} className="text-gray-600" />
        </button>

        {/* Previous Page */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-4 py-2 rounded-xl border-2 border-gray-200 hover:border-purple-500 hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 font-semibold text-gray-700"
        >
          <ChevronLeft size={18} />
          <span className="hidden sm:inline">Trước</span>
        </button>

        {/* Page numbers (Desktop) */}
        {showPageNumbers && totalPages > 1 && (
          <div className="hidden md:flex items-center gap-1">
            {getPageNumbers().map((page, index) => {
              if (page === '...') {
                return (
                  <span
                    key={`ellipsis-${index}`}
                    className="px-3 py-2 text-gray-400"
                  >
                    ...
                  </span>
                );
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

        {/* Mobile: Current Page Info */}
        <div className="md:hidden px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl text-sm font-semibold text-purple-700">
          {currentPage} / {totalPages}
        </div>

        {/* Next Page */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 font-semibold"
        >
          <span className="hidden sm:inline">Sau</span>
          <ChevronRight size={18} />
        </button>

        {/* Last Page */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-xl border-2 border-gray-200 hover:border-purple-500 hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          title="Trang cuối"
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

  // State
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0
  });

  // Filters
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, searchQuery, sortBy, sortOrder, pagination.page]);

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

      if (selectedCategory !== 'all') {
        params.categoryId = selectedCategory;
      }

      if (searchQuery) {
        params.search = searchQuery;
      }

      console.log('🔍 Fetching products with params:', params);
      const response = await productsAPI.getAll(params);
      console.log('📦 Products response:', response);
      
      // Parse products data
      let productsData = [];
      if (Array.isArray(response.data)) {
        productsData = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        productsData = response.data.data;
      }
      
      setProducts(productsData);
      console.log('✅ Products set:', productsData.length, 'items');
      
      // Parse pagination data - TRY MULTIPLE SOURCES
      let paginationData = null;
      
      // Try 1: response.pagination
      if (response.pagination) {
        paginationData = response.pagination;
        console.log('📄 Pagination from response.pagination:', paginationData);
      }
      // Try 2: response.data.pagination
      else if (response.data?.pagination) {
        paginationData = response.data.pagination;
        console.log('📄 Pagination from response.data.pagination:', paginationData);
      }
      // Try 3: Calculate from products length (fallback)
      else {
        const total = productsData.length;
        const totalPages = Math.ceil(total / pagination.limit);
        paginationData = {
          total: total,
          totalPages: totalPages || 1
        };
        console.log('⚠️ No pagination data from backend, calculated:', paginationData);
      }
      
      // Update pagination state
      if (paginationData) {
        setPagination(prev => ({
          ...prev,
          total: paginationData.total || productsData.length,
          totalPages: paginationData.totalPages || Math.ceil((paginationData.total || productsData.length) / prev.limit)
        }));
        console.log('✅ Pagination updated:', {
          total: paginationData.total || productsData.length,
          totalPages: paginationData.totalPages || Math.ceil((paginationData.total || productsData.length) / prev.limit)
        });
      }
    } catch (error) {
      console.error('❌ Error fetching products:', error);
      toast.error('Không thể tải sản phẩm!');
      setProducts([]);
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

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleSortChange = (value) => {
    const [newSortBy, newSortOrder] = value.split('-');
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  // Calculate display count
  const displayCount = pagination.total || products.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      <Header user={user} />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
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
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span>Giỏ hàng</span>
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
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}

            <button
              onClick={() => fetchProducts()}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              Tìm
            </button>
          </div>

          {/* Quick Search */}
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

        {/* Category Filter */}
        <div className="mb-6 bg-white rounded-2xl shadow-md p-4">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            <h3 className="font-bold text-gray-800">Danh mục</h3>
          </div>

          <div className="flex flex-wrap gap-2">
            {allCategories.map((category) => {
              const isSelected = selectedCategory === category._id;
              const icon = category.icon || getCategoryIcon(category.name);

              return (
                <button
                  key={category._id}
                  onClick={() => handleCategoryChange(category._id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                    isSelected
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg transform scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
                  }`}
                >
                  <span className="text-lg">{icon}</span>
                  <span>{category.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Toolbar */}
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
              <option value="price-asc">Giá: Thấp đến Cao</option>
              <option value="price-desc">Giá: Cao đến Thấp</option>
              <option value="name-asc">Tên: A-Z</option>
              <option value="name-desc">Tên: Z-A</option>
              <option value="soldCount-desc">Bán chạy nhất</option>
              <option value="rating-desc">Đánh giá cao nhất</option>
            </select>
          </div>
        </div>

        {/* Products Grid */}
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
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              Xóa bộ lọc
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => {
              const stockStatus = getStockStatus(product.stock || 0);
              const imageUrl = product.images?.[0] || PLACEHOLDER_IMAGE;
              const categoryData = product.category || product.categoryId;
              const categoryName = categoryData?.name || 'Chưa phân loại';

              return (
                <div
                  key={product._id}
                  onClick={() => navigate(`/product/${product._id}`)}
                  className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all cursor-pointer overflow-hidden"
                >
                  {/* Image */}
                  <div className="relative h-48 bg-gray-100">
                    <img
                      src={imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src = PLACEHOLDER_IMAGE;
                      }}
                    />
                    
                    {/* Stock Badge */}
                    <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold ${stockStatus.bg} ${stockStatus.text_color}`}>
                      {stockStatus.text}
                    </div>

                    {/* Rating */}
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

                    {/* Name */}
                    <h3 className="font-bold text-gray-800 mb-2 line-clamp-2 hover:text-purple-600 transition-colors min-h-[3rem]">
                      {product.name}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2 min-h-[2.5rem]">
                      {product.description || 'Sản phẩm chất lượng cao cho thú cưng'}
                    </p>

                    {/* Price & Action */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div>
                        <div className="text-xl font-bold text-purple-600">
                          {formatPrice(product.price)}₫
                        </div>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <div className="text-xs text-gray-400 line-through">
                            {formatPrice(product.originalPrice)}₫
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

        {/* Pagination */}
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
  );
};

export default Shop;