import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productsAPI } from '../services/api';
import toast from 'react-hot-toast';
import Header from '../components/layout/Header';
import ProductCard from '../components/home/ProductCard';
import { useAuth } from '../contexts/AuthContext';
import { 
  Heart, ShoppingCart, Calendar, MessageCircle, 
  CheckCircle, Star, ArrowRight, Users, Clock,
  Stethoscope
} from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      setLoading(true);
      const response = await productsAPI.getAll({ limit: 4, sortBy: 'soldCount', sortOrder: 'desc' });
      const productsData = response.data?.data || response.data || [];
      setFeaturedProducts(productsData);
    } catch (error) {
      console.error('❌ Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: Heart,
      title: 'Hồ Sơ Sức Khỏe',
      description: 'Lưu trữ toàn bộ lịch sử y tế, vắc-xin và dữ liệu sức khỏe của thú cưng trong một nơi an toàn.',
      color: 'from-pink-500 to-rose-500'
    },
    {
      icon: Calendar,
      title: 'Đặt Lịch Dịch Vụ',
      description: 'Đặt lịch khám bác sĩ thú y, spa làm đẹp và lớp huấn luyện chỉ với vài cú nhấp chuột.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: ShoppingCart,
      title: 'Mua Sắm Sản Phẩm',
      description: 'Duyệt và mua sắm thức ăn, đồ chơi, phụ kiện và sản phẩm chăm sóc sức khỏe chất lượng cao.',
      color: 'from-purple-500 to-indigo-500'
    },
    {
      icon: MessageCircle,
      title: 'Tư Vấn Chuyên Gia',
      description: 'Truy cập blog với các mẹo, hướng dẫn và thông tin từ các chuyên gia thú y và chăm sóc thú cưng.',
      color: 'from-orange-500 to-amber-500'
    }
  ];

  const services = [
    {
      title: 'Chăm Sóc Thú Y',
      description: 'Chăm sóc y tế chuyên nghiệp từ các bác sĩ thú y có kinh nghiệm. Từ khám định kỳ đến dịch vụ khẩn cấp.',
      image: 'https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?w=800&h=600&fit=crop',
      buttonText: 'Đặt Lịch Ngay'
    },
    {
      title: 'Grooming & Spa',
      description: 'Nuông chiều thú cưng của bạn với dịch vụ chăm sóc cao cấp. Tắm chuyên nghiệp, cắt tỉa lông, cắt móng.',
      image: 'https://images.unsplash.com/photo-1558788353-f76d92427f16?w=800&h=600&fit=crop',
      buttonText: 'Đặt Lịch Ngay'
    },
    {
      title: 'Khách Sạn Thú Cưng',
      description: 'Cơ sở lưu trú an toàn và thoải mái khi bạn đi vắng. Thú cưng của bạn sẽ được tận hưởng chỗ ở rộng rãi.',
      image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800&h=600&fit=crop',
      buttonText: 'Đặt Lịch Ngay'
    },
    {
      title: 'Lớp Huấn Luyện',
      description: 'Chương trình huấn luyện chuyên nghiệp cho thú cưng ở mọi lứa tuổi. Từ vâng lời cơ bản đến kỹ năng nâng cao.',
      image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&h=600&fit=crop',
      buttonText: 'Đặt Lịch Ngay'
    }
  ];

  const blogPosts = [
    {
      category: 'Chăm Sóc',
      title: '10 Lời Khuyên Thiết Yếu Cho Người Nuôi Thú Cưng Lần Đầu',
      excerpt: 'Đón thú cưng đầu tiên về nhà? Học các mẹo và thủ thuật thiết yếu để quá trình chuyển đổi diễn ra suôn sẻ.',
      author: 'BS. Minh Tuấn',
      date: '3 Th12, 2024',
      readTime: '7 phút đọc',
      image: 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=600&h=400&fit=crop'
    },
    {
      category: 'Sức Khỏe',
      title: 'Hiểu Về Lịch Tiêm Chủng Cho Thú Cưng',
      excerpt: 'Giữ cho thú cưng khỏe mạnh với các loại vắc-xin đúng vào đúng thời điểm. Hướng dẫn toàn diện về lịch tiêm chủng.',
      author: 'BS. Emily Watson',
      date: '5 Th12, 2024',
      readTime: '5 phút đọc',
      image: 'https://images.unsplash.com/photo-1548681528-6a5c45b66b42?w=600&h=400&fit=crop'
    },
    {
      category: 'Làm Đẹp',
      title: 'Phương Pháp Grooming Tốt Nhất Cho Các Giống Thú Cưng',
      excerpt: 'Mỗi giống có nhu cầu chăm sóc riêng. Khám phá các phương pháp tốt nhất để giữ cho thú cưng luôn đẹp.',
      author: 'Thu Hà',
      date: '1 Th12, 2024',
      readTime: '6 phút đọc',
      image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=600&h=400&fit=crop'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header user={user} />

      {/* Hero Section */}
      <section className="relative min-h-[700px] flex items-center">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=1920&h=1080&fit=crop" 
            alt="Hero"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 via-blue-800/80 to-transparent" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full max-w-7xl">
          <div className="max-w-2xl text-white">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-sm font-medium">Được tin tưởng bởi 10,000+ Chủ thú cưng</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Chăm Sóc Toàn Diện Cho Thú Cưng Yêu Quý
            </h1>

            <p className="text-lg md:text-xl mb-8 text-blue-50">
              Dịch vụ thú y chuyên nghiệp, spa làm đẹp, sản phẩm chất lượng và theo dõi sức khỏe - tất cả trong một nền tảng
            </p>

            <div className="flex flex-wrap gap-4 mb-12">
              <button 
                onClick={() => navigate('/register')}
                className="px-8 py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold rounded-xl hover:shadow-xl hover:scale-105 transition-all"
              >
                Bắt Đầu Ngay
              </button>
              <button 
                onClick={() => navigate('/shop')}
                className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl border-2 border-white/20 hover:bg-white/20 transition-all"
              >
                Tìm Hiểu Thêm
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8">
              <div className="text-center">
                <Users className="w-8 h-8 text-blue-300 mx-auto mb-2" />
                <div className="text-2xl md:text-3xl font-bold mb-1">10K+</div>
                <div className="text-sm text-blue-200">Thú Cưng Hạnh Phúc</div>
              </div>
              <div className="text-center">
                <Stethoscope className="w-8 h-8 text-blue-300 mx-auto mb-2" />
                <div className="text-2xl md:text-3xl font-bold mb-1">50+</div>
                <div className="text-sm text-blue-200">Bác Sĩ Thú Y</div>
              </div>
              <div className="text-center">
                <Clock className="w-8 h-8 text-blue-300 mx-auto mb-2" />
                <div className="text-2xl md:text-3xl font-bold mb-1">24/7</div>
                <div className="text-sm text-blue-200">Hỗ Trợ</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-white to-blue-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 w-full max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Mọi Thứ Thú Cưng Cần
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Dịch vụ và sản phẩm chăm sóc thú cưng toàn diện
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2"
              >
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {feature.description}
                </p>
                
                <button className="text-pink-600 font-semibold flex items-center gap-2 hover:gap-3 transition-all">
                  Tìm hiểu thêm
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 w-full max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Cách Hoạt Động
            </h2>
            <p className="text-lg text-gray-600">
              Bắt đầu chỉ trong ba bước đơn giản
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              { num: '1', title: 'Tạo Hồ Sơ', desc: 'Đăng ký trong vài giây và thiết lập tài khoản với thông tin cơ bản của bạn.' },
              { num: '2', title: 'Thêm Thú Cưng', desc: 'Thêm những người bạn lông xù với thông tin chi tiết, ảnh và thông tin sức khỏe.' },
              { num: '3', title: 'Truy Cập Mọi Dịch Vụ', desc: 'Đặt lịch hẹn, mua sắm sản phẩm và quản lý mọi thứ từ một bảng điều khiển.' }
            ].map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-6">
                  {step.num}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <button 
              onClick={() => navigate('/register')}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:shadow-xl hover:scale-105 transition-all"
            >
              Bắt Đầu Ngay
            </button>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 w-full max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Dịch Vụ Của Chúng Tôi
            </h2>
            <p className="text-lg text-gray-600">
              Dịch vụ chăm sóc thú cưng cao cấp được thiết kế riêng
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {services.map((service, index) => (
              <div key={index} className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all">
                <div className="relative h-64 overflow-hidden">
                  <img 
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{service.title}</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">{service.description}</p>
                  <button 
                    onClick={() => navigate('/appointments/create')}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
                  >
                    {service.buttonText}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-gradient-to-b from-white to-blue-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 w-full max-w-7xl">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Sản Phẩm Nổi Bật
              </h2>
              <p className="text-lg text-gray-600">
                Sản phẩm bán chạy nhất
              </p>
            </div>
            
            <button 
              onClick={() => navigate('/shop')}
              className="hidden md:flex items-center gap-2 text-pink-600 font-semibold hover:gap-3 transition-all"
            >
              Xem Tất Cả
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600"></div>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}

          <div className="text-center mt-8 md:hidden">
            <button 
              onClick={() => navigate('/shop')}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
            >
              Xem Tất Cả Sản Phẩm
            </button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 w-full max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Khách Hàng Nói Gì
            </h2>
            <p className="text-lg text-gray-600">
              Hàng nghìn chủ thú cưng hạnh phúc
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {[
              {
                name: 'Trần Minh Tuấn',
                role: 'Chủ Nhân Chó Cưng',
                avatar: 'MT',
                content: 'Care4Pets đã thay đổi hoàn toàn cách tôi quản lý sức khỏe cho cún cưng.'
              },
              {
                name: 'Nguyễn Thu Hà',
                role: 'Sen Mèo',
                avatar: 'NH',
                content: 'Tôi rất thích tính năng theo dõi sức khỏe! Dịch vụ grooming cũng tuyệt vời.'
              },
              {
                name: 'Lê Phương Anh',
                role: 'Phụ Huynh Thú Cưng',
                avatar: 'PA',
                content: 'Nền tảng chăm sóc thú cưng tốt nhất mà tôi từng sử dụng.'
              }
            ].map((testimonial, index) => (
              <div 
                key={index}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                <p className="text-gray-700 mb-6 leading-relaxed italic">
                  "{testimonial.content}"
                </p>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
                    <span className="text-white font-bold">{testimonial.avatar}</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 mb-2">4.9/5</div>
              <div className="text-gray-600">Đánh Giá</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 mb-2">10K+</div>
              <div className="text-gray-600">Khách Hàng</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 mb-2">50K+</div>
              <div className="text-gray-600">Lịch Hẹn</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 mb-2">99%</div>
              <div className="text-gray-600">Hài Lòng</div>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section className="py-20 bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 w-full max-w-7xl">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Bài Viết Mới Nhất
              </h2>
              <p className="text-lg text-gray-600">
                Lời khuyên chuyên gia về chăm sóc thú cưng
              </p>
            </div>
            
            <button className="hidden md:flex items-center gap-2 text-pink-600 font-semibold hover:gap-3 transition-all">
              Xem Tất Cả Bài Viết
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {blogPosts.map((post, index) => (
              <div key={index} className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all group">
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-white rounded-full text-sm font-semibold text-purple-600">
                      {post.category}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">B</span>
                      </div>
                      <span>{post.author}</span>
                    </div>
                    <span>{post.readTime}</span>
                  </div>
                  <div className="text-sm text-gray-400 mb-4">{post.date}</div>
                  <button className="text-pink-600 font-semibold flex items-center gap-2 hover:gap-3 transition-all">
                    Đọc Thêm
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-20 bg-gradient-to-br from-pink-500 via-rose-500 to-purple-600">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 w-full max-w-4xl">
          <div className="text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Đăng Ký Nhận Bản Tin
            </h2>
            <p className="text-lg text-white/90 mb-8">
              Nhận ưu đãi đặc biệt, mẹo chăm sóc thú cưng và cập nhật mới nhất
            </p>

            <form className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
              <input 
                type="email"
                placeholder="Địa chỉ email của bạn"
                className="flex-1 px-6 py-4 rounded-xl bg-white/10 backdrop-blur-sm text-white placeholder-white/60 border-2 border-white/20 focus:outline-none focus:border-white/40"
              />
              <button 
                type="submit"
                className="px-8 py-4 bg-white text-pink-600 font-semibold rounded-xl hover:shadow-xl hover:scale-105 transition-all"
              >
                Đăng Ký
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 w-full max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            {/* Company Info */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                  <span className="text-white text-2xl">🐾</span>
                </div>
                <span className="text-xl font-bold">Care4Pets</span>
              </div>
              <p className="text-gray-400 mb-6">
                Đối tác đáng tin cậy của bạn trong việc cung cấp dịch vụ chăm sóc thú cưng toàn diện.
              </p>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-purple-600 transition-colors">
                  <span>f</span>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-purple-600 transition-colors">
                  <span>t</span>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-purple-600 transition-colors">
                  <span>in</span>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-bold text-lg mb-4">Liên Kết Nhanh</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="/" className="hover:text-white transition-colors">Về Chúng Tôi</a></li>
                <li><a href="/shop" className="hover:text-white transition-colors">Mua Sắm</a></li>
                <li><a href="/blog" className="hover:text-white transition-colors">Blog & Tài Nguyên</a></li>
                <li><a href="/contact" className="hover:text-white transition-colors">Liên Hệ</a></li>
              </ul>
            </div>

            {/* Services */}
            <div>
              <h4 className="font-bold text-lg mb-4">Dịch Vụ</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="/appointments" className="hover:text-white transition-colors">Chăm Sóc Thú Y</a></li>
                <li><a href="/appointments" className="hover:text-white transition-colors">Grooming & Spa</a></li>
                <li><a href="/appointments" className="hover:text-white transition-colors">Khách Sạn Thú Cưng</a></li>
                <li><a href="/appointments" className="hover:text-white transition-colors">Lớp Huấn Luyện</a></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-bold text-lg mb-4">Liên Hệ</h4>
              <ul className="space-y-3 text-gray-400">
                <li className="flex items-center gap-2">
                  <span>📞</span>
                  <span>+84 (028) 1234 5678</span>
                </li>
                <li className="flex items-center gap-2">
                  <span>📧</span>
                  <span>hello@care4pets.vn</span>
                </li>
                <li className="flex items-center gap-2">
                  <span>📍</span>
                  <span>123 Đường Thú Cưng, Q1, TP.HCM</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              © 2024 Care4Pets. Tất cả quyền được bảo lưu.
            </p>
            <div className="flex gap-6 text-sm text-gray-400">
              <a href="#" className="hover:text-white transition-colors">Chính Sách Bảo Mật</a>
              <a href="#" className="hover:text-white transition-colors">Điều Khoản Dịch Vụ</a>
              <a href="#" className="hover:text-white transition-colors">Chính Sách Cookie</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;