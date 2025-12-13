import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { blogAPI } from '../services/api';
import Header from '../components/layout/Header';
import toast from 'react-hot-toast';
import { 
  Search, Calendar, User, Clock, ArrowRight, 
  TrendingUp, Tag, MessageCircle 
} from 'lucide-react';

const Blog = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [posts, setPosts] = useState([]);
  const [popularPosts, setPopularPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 9,
    total: 0,
    totalPages: 0
  });

  const categories = [
    { id: 'all', name: 'Tất cả', icon: '📚' },
    { id: 'health', name: 'Sức Khỏe', icon: '💊' },
    { id: 'tips', name: 'Mẹo Vặt', icon: '💡' },
    { id: 'guide', name: 'Hướng Dẫn', icon: '📖' },
    { id: 'product-review', name: 'Đánh Giá', icon: '⭐' },
    { id: 'news', name: 'Tin Tức', icon: '📰' }
  ];

  useEffect(() => {
    fetchPosts();
    fetchPopularPosts();
  }, [selectedCategory, searchQuery, pagination.page]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      
      let response;
      if (searchQuery) {
        response = await blogAPI.search(searchQuery, {
          page: pagination.page,
          limit: pagination.limit
        });
      } else {
        const params = {
          page: pagination.page,
          limit: pagination.limit,
          sortBy: 'date',  // ✅ FIXED: Backend accepts 'date' or 'views'
          sortOrder: 'desc'
        };
        
        if (selectedCategory !== 'all') {
          params.category = selectedCategory;
        }
        
        response = await blogAPI.getAll(params);
      }
      
      const postsData = response.data?.data || response.data || [];
      setPosts(postsData);
      
      if (response.data?.pagination) {
        setPagination(prev => ({
          ...prev,
          total: response.data.pagination.total,
          totalPages: response.data.pagination.totalPages
        }));
      }
    } catch (error) {
      console.error('❌ Error fetching posts:', error);
      toast.error('Không thể tải bài viết!');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPopularPosts = async () => {
    try {
      const response = await blogAPI.getPopular(5);
      const popularData = response.data?.data || response.data || [];
      setPopularPosts(popularData);
    } catch (error) {
      console.error('❌ Error fetching popular posts:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchPosts();
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    setSearchQuery('');
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const truncateText = (text, maxLength) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      <Header user={user} />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white py-20">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 w-full max-w-7xl relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Blog Care4Pets 📝
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-8">
              Kiến thức chăm sóc thú cưng từ các chuyên gia hàng đầu
            </p>
            
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm bài viết... (VD: cách chăm sóc chó, dinh dưỡng cho mèo)"
                className="w-full px-6 py-4 pl-14 pr-32 rounded-xl bg-white/10 backdrop-blur-sm text-white placeholder-white/60 border-2 border-white/20 focus:outline-none focus:border-white/40"
              />
              <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 w-6 h-6 text-white/60" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-24 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white"
                >
                  ✕
                </button>
              )}
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 px-6 py-2 bg-white text-purple-600 rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                Tìm
              </button>
            </form>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 w-full max-w-7xl py-12">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Categories */}
            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Tag className="w-5 h-5" />
                Danh mục
              </h3>
              <div className="flex flex-wrap gap-3">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryChange(category.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                      selectedCategory === category.id
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                        : 'bg-white text-gray-700 hover:bg-gray-50 shadow-md'
                    }`}
                  >
                    <span>{category.icon}</span>
                    <span>{category.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Posts Grid */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Đang tải bài viết...</p>
                </div>
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-32 h-32 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-6xl">📝</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-700 mb-2">
                  Không tìm thấy bài viết
                </h3>
                <p className="text-gray-500 mb-6">
                  Thử tìm kiếm với từ khóa khác hoặc chọn danh mục khác
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSearchQuery('');
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  Xem tất cả bài viết
                </button>
              </div>
            ) : (
              <>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                  {posts.map((post) => (
                    <article
                      key={post._id}
                      onClick={() => navigate(`/blog/${post.slug || post._id}`)}
                      className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all cursor-pointer group"
                    >
                      {/* Image */}
                      <div className="relative h-48 overflow-hidden bg-gray-100">
                        <img
                          src={post.featuredImage || post.image || 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=600&h=400&fit=crop'}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=600&h=400&fit=crop';
                          }}
                        />
                        {/* Category Badge */}
                        {post.category && (
                          <div className="absolute top-4 left-4">
                            <span className="px-3 py-1 bg-white rounded-full text-sm font-semibold text-purple-600 shadow-md">
                              {post.category}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-purple-600 transition-colors">
                          {post.title}
                        </h3>
                        
                        <p className="text-gray-600 mb-4 line-clamp-3">
                          {truncateText(post.excerpt || post.content, 120)}
                        </p>

                        {/* Meta */}
                        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            <span>{post.author?.name || 'Admin'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>{post.readTime || '5'} phút đọc</span>
                          </div>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(post.createdAt || post.publishedAt)}</span>
                          </div>
                          <button className="flex items-center gap-2 text-purple-600 font-semibold hover:gap-3 transition-all">
                            Đọc thêm
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex justify-center">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page === 1}
                        className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                          pagination.page === 1
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-white text-purple-600 hover:bg-purple-50 shadow-md'
                        }`}
                      >
                        ← Trước
                      </button>

                      {[...Array(pagination.totalPages)].map((_, index) => {
                        const pageNumber = index + 1;
                        const showPage =
                          pageNumber === 1 ||
                          pageNumber === pagination.totalPages ||
                          (pageNumber >= pagination.page - 1 && pageNumber <= pagination.page + 1);

                        if (!showPage) {
                          if (pageNumber === pagination.page - 2 || pageNumber === pagination.page + 2) {
                            return <span key={pageNumber} className="px-2 text-gray-400">...</span>;
                          }
                          return null;
                        }

                        return (
                          <button
                            key={pageNumber}
                            onClick={() => handlePageChange(pageNumber)}
                            className={`w-10 h-10 rounded-xl font-semibold transition-all ${
                              pagination.page === pageNumber
                                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                                : 'bg-white text-gray-700 hover:bg-purple-50 shadow-md'
                            }`}
                          >
                            {pageNumber}
                          </button>
                        );
                      })}

                      <button
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page === pagination.totalPages}
                        className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                          pagination.page === pagination.totalPages
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-white text-purple-600 hover:bg-purple-50 shadow-md'
                        }`}
                      >
                        Sau →
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-1">
            {/* Popular Posts */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                Bài viết phổ biến
              </h3>
              <div className="space-y-4">
                {popularPosts.map((post, index) => (
                  <div
                    key={post._id}
                    onClick={() => navigate(`/blog/${post.slug || post._id}`)}
                    className="flex gap-3 cursor-pointer group"
                  >
                    <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={post.featuredImage || post.image || 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=200&h=200&fit=crop'}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=200&h=200&fit=crop';
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 text-sm line-clamp-2 group-hover:text-purple-600 transition-colors mb-1">
                        {post.title}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <MessageCircle className="w-3 h-3" />
                        <span>{post.commentsCount || 0} bình luận</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Newsletter */}
            <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl shadow-lg p-6 text-white">
              <h3 className="text-lg font-bold mb-3">
                📧 Đăng ký nhận bài viết mới
              </h3>
              <p className="text-sm text-white/90 mb-4">
                Nhận thông báo khi có bài viết mới về chăm sóc thú cưng
              </p>
              <form className="space-y-3">
                <input
                  type="email"
                  placeholder="Email của bạn"
                  className="w-full px-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm text-white placeholder-white/60 border-2 border-white/20 focus:outline-none focus:border-white/40"
                />
                <button
                  type="submit"
                  className="w-full px-4 py-3 bg-white text-purple-600 rounded-xl font-semibold hover:shadow-xl transition-all"
                >
                  Đăng ký
                </button>
              </form>
            </div>
          </aside>
        </div>
      </div>

      {/* Newsletter Bottom Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 w-full max-w-4xl text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Đăng Ký Nhận Bản Tin
          </h2>
          <p className="text-lg text-white/90 mb-8">
            Nhận kiến thức chăm sóc thú cưng mỗi tuần
          </p>
          <form className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
            <input
              type="email"
              placeholder="Địa chỉ email của bạn"
              className="flex-1 px-6 py-4 rounded-xl bg-white/10 backdrop-blur-sm text-white placeholder-white/60 border-2 border-white/20 focus:outline-none focus:border-white/40"
            />
            <button
              type="submit"
              className="px-8 py-4 bg-white text-purple-600 font-semibold rounded-xl hover:shadow-xl hover:scale-105 transition-all"
            >
              Đăng Ký
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default Blog;