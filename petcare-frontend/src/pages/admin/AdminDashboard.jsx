import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/Adminlayout';
import StatCard from '../../components/admin/StatCard';
import { adminAPI, ordersAPI, appointmentsAPI } from '../../services/api';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    activeUsers: 0,
    totalAppointments: 0,
    revenueGrowth: 0,
    ordersGrowth: 0,
    usersGrowth: 0,
    appointmentsGrowth: 0,
  });
  const [salesData, setSalesData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('week');

  useEffect(() => {
    fetchDashboardData();
  }, [period]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // ✅ 1. Fetch dashboard statistics
      const dashboardResponse = await adminAPI.getDashboard({ period });
      console.log('📊 Dashboard data:', dashboardResponse.data);
      
      if (dashboardResponse.data) {
        const responseData = dashboardResponse.data;
        const stats = responseData.data?.overview || responseData.overview || responseData;
        
        setStats({
          totalRevenue: stats.totalRevenue || 0,
          totalOrders: stats.totalOrders || 0,
          activeUsers: stats.activeUsers || stats.totalUsers || 0,
          totalAppointments: stats.totalAppointments || 0,
          revenueGrowth: stats.revenueGrowth || 0,
          ordersGrowth: stats.ordersGrowth || 0,
          usersGrowth: stats.usersGrowth || 0,
          appointmentsGrowth: stats.appointmentsGrowth || 0,
        });
      }

      // ✅ 2. Fetch sales analytics for chart
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);

      const salesResponse = await adminAPI.getSalesAnalytics({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        groupBy: 'day',
      });
      
      console.log('📈 Sales data:', salesResponse.data);
      const salesData = salesResponse.data?.data || salesResponse.data;
      
      if (salesData?.chartData && salesData.chartData.length > 0) {
        setSalesData(salesData.chartData);
      }

      // ✅ 3. Fetch category distribution
      const categoryResponse = await adminAPI.getCategoryDistribution({ period });
      console.log('🥧 Category data:', categoryResponse.data);
      
      if (categoryResponse.data?.categories) {
        const colors = ['#8B5CF6', '#3B82F6', '#EC4899', '#10B981', '#F59E0B', '#EF4444'];
        const transformedCategories = categoryResponse.data.categories.map((cat, index) => ({
          name: cat.name,
          value: cat.percentage,
          totalSold: cat.totalSold,
          totalRevenue: cat.totalRevenue,
          color: colors[index % colors.length]
        }));
        setCategoryData(transformedCategories);
      }

      // ✅ 4. Fetch top products
      const productsResponse = await adminAPI.getTopProducts({ limit: 4, period });
      console.log('🏆 Top products data:', productsResponse.data);
      
      if (productsResponse.data?.products) {
        setTopProducts(productsResponse.data.products);
      }

      // ✅ 5. Fetch recent orders (NEW)
      try {
        const ordersResponse = await ordersAPI.getAll({ page: 1, limit: 5 });
        console.log('📦 Recent orders:', ordersResponse.data);
        
        let ordersData = [];
        if (ordersResponse) {
          if (ordersResponse.data && Array.isArray(ordersResponse.data.data)) {
            ordersData = ordersResponse.data.data;
          } else if (Array.isArray(ordersResponse.data)) {
            ordersData = ordersResponse.data;
          }
        }
        setRecentOrders(ordersData.slice(0, 5));
      } catch (error) {
        console.log('⚠️ Could not fetch recent orders:', error);
      }

      // ✅ 6. Fetch recent appointments (NEW)
      try {
        const appointmentsResponse = await appointmentsAPI.getAll({ page: 1, limit: 5 });
        console.log('📅 Recent appointments:', appointmentsResponse.data);
        
        let appointmentsData = [];
        if (appointmentsResponse) {
          if (appointmentsResponse.data && Array.isArray(appointmentsResponse.data.data)) {
            appointmentsData = appointmentsResponse.data.data;
          } else if (Array.isArray(appointmentsResponse.data)) {
            appointmentsData = appointmentsResponse.data;
          }
        }
        setRecentAppointments(appointmentsData.slice(0, 5));
      } catch (error) {
        console.log('⚠️ Could not fetch recent appointments:', error);
      }

    } catch (error) {
      console.error('❌ Error fetching dashboard:', error);
      toast.error('Không thể tải dữ liệu dashboard');
    } finally {
      setLoading(false);
    }
  };

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN').format(value);
  };

  // Format number
  const formatNumber = (value) => {
    return new Intl.NumberFormat('vi-VN').format(value);
  };

  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  // Format datetime
  const formatDateTime = (date) => {
    return new Date(date).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get status badge for orders
  const getOrderStatusBadge = (status) => {
    const badges = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Chờ xác nhận' },
      confirmed: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Đã xác nhận' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-700', label: 'Đã hủy' },
    };
    const badge = badges[status] || badges.pending;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  // Get status badge for appointments
  const getAppointmentStatusBadge = (status) => {
    const badges = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Chờ xác nhận' },
      confirmed: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Đã xác nhận' },
      in_progress: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Đang thực hiện' },
      completed: { bg: 'bg-green-100', text: 'text-green-700', label: 'Hoàn thành' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-700', label: 'Đã hủy' },
    };
    const badge = badges[status] || badges.pending;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Tổng quan hệ thống 📊
            </h1>
            <p className="text-gray-600">
              Xin chào Admin! Cùng theo dõi hoạt động và số lượng chăm sóc thú cưng của người dùng.
            </p>
          </div>

          {/* Period Filter */}
          <div className="flex gap-2">
            {['today', 'week', 'month', 'year'].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-xl transition-all ${
                  period === p
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                {p === 'today' && 'Hôm nay'}
                {p === 'week' && 'Tuần này'}
                {p === 'month' && 'Tháng này'}
                {p === 'year' && 'Năm nay'}
              </button>
            ))}
          </div>
        </div>

        {/* ✅ Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Doanh thu"
            value={formatCurrency(stats.totalRevenue)}
            icon="💰"
            color="blue"
            trend={stats.revenueGrowth}
          />
          <StatCard
            title="Tổng đơn"
            value={formatNumber(stats.totalOrders)}
            icon="🛒"
            color="purple"
            trend={stats.ordersGrowth}
          />
          <StatCard
            title="Người dùng hoạt động"
            value={formatNumber(stats.activeUsers)}
            icon="👥"
            color="pink"
            trend={stats.usersGrowth}
          />
          <StatCard
            title="Lịch hẹn"
            value={formatNumber(stats.totalAppointments)}
            icon="📅"
            color="green"
            trend={stats.appointmentsGrowth}
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sales & Appointments Chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-800">
                  Bán hàng & Lịch hẹn
                </h3>
                <p className="text-sm text-gray-500">
                  Tổng quan hiệu suất 30 ngày gần đây
                </p>
              </div>
            </div>

            {salesData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="date"
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="orders"
                    name="Đơn hàng"
                    stroke="#8B5CF6"
                    strokeWidth={2}
                    dot={{ fill: '#8B5CF6', r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="appointments"
                    name="Lịch hẹn"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    dot={{ fill: '#3B82F6', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-400">
                Không có dữ liệu
              </div>
            )}
          </div>

          {/* Category Distribution */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Phân phối sản phẩm
            </h3>
            <p className="text-sm text-gray-500 mb-6">Theo danh mục</p>

            {categoryData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>

                <div className="mt-4 space-y-2">
                  {categoryData.map((category) => (
                    <div key={category.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: category.color }}
                        ></div>
                        <span className="text-sm text-gray-600">{category.name}</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-800">
                        {category.value}%
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-400">
                Không có dữ liệu
              </div>
            )}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-800">
                Sản phẩm hàng đầu
              </h3>
              <p className="text-sm text-gray-500">
                Top 4 sản phẩm bán chạy nhất
              </p>
            </div>
            <Link
              to="/admin/products"
              className="text-purple-600 hover:text-purple-700 text-sm font-semibold"
            >
              Xem tất cả →
            </Link>
          </div>

          {topProducts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Sản phẩm
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Đã bán
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Doanh thu
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Xu hướng
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {topProducts.map((product, index) => (
                    <tr key={product.productId} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full text-white font-bold text-sm">
                          {index + 1}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {product.image && (
                            <img 
                              src={product.image} 
                              alt={product.name}
                              className="w-10 h-10 rounded-lg object-cover"
                            />
                          )}
                          <div>
                            <p className="text-sm font-semibold text-gray-800">
                              {product.name}
                            </p>
                            <p className="text-xs text-gray-500">{product.category}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600">
                          {formatNumber(product.sold)}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-gray-800">
                          ₫{formatCurrency(product.revenue)}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                            product.trend >= 0
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {product.trend >= 0 ? '↑' : '↓'} {Math.abs(product.trend)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="h-32 flex items-center justify-center text-gray-400">
              Không có dữ liệu
            </div>
          )}
        </div>

        {/* Recent Activities Row - ✨ NEW */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-800">
                  Đơn hàng gần đây
                </h3>
                <p className="text-sm text-gray-500">
                  5 đơn hàng mới nhất
                </p>
              </div>
              <Link
                to="/admin/orders"
                className="text-purple-600 hover:text-purple-700 text-sm font-semibold"
              >
                Xem tất cả →
              </Link>
            </div>

            {recentOrders.length > 0 ? (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div 
                    key={order._id} 
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-gray-800 text-sm">
                          #{order.orderNumber}
                        </p>
                        {getOrderStatusBadge(order.status)}
                      </div>
                      <p className="text-xs text-gray-500">
                        {order.userId?.fullName || 'N/A'} • {formatDateTime(order.createdAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-purple-600">
                        ₫{formatCurrency(order.totalAmount)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {order.items?.length || 0} sản phẩm
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-32 flex items-center justify-center text-gray-400">
                Chưa có đơn hàng nào
              </div>
            )}
          </div>

          {/* Recent Appointments - ✨ NEW */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-800">
                  Lịch hẹn gần đây
                </h3>
                <p className="text-sm text-gray-500">
                  5 lịch hẹn mới nhất
                </p>
              </div>
              <Link
                to="/admin/appointments"
                className="text-purple-600 hover:text-purple-700 text-sm font-semibold"
              >
                Xem tất cả →
              </Link>
            </div>

            {recentAppointments.length > 0 ? (
              <div className="space-y-4">
                {recentAppointments.map((appointment) => (
                  <div 
                    key={appointment._id} 
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-gray-800 text-sm">
                          {appointment.customerName}
                        </p>
                        {getAppointmentStatusBadge(appointment.status)}
                      </div>
                      <p className="text-xs text-gray-500">
                        {appointment.petId?.name} • {appointment.timeSlot}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-blue-600">
                        ₫{formatCurrency(appointment.price)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(appointment.appointmentDate)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-32 flex items-center justify-center text-gray-400">
                Chưa có lịch hẹn nào
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions - ✨ NEW */}
        <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl shadow-lg p-6 text-white">
          <h3 className="text-xl font-bold mb-4">Thao tác nhanh</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              to="/admin/products"
              className="bg-white/10 hover:bg-white/20 backdrop-blur rounded-xl p-4 transition-all text-center"
            >
              <div className="text-3xl mb-2">📦</div>
              <p className="font-semibold">Thêm sản phẩm</p>
            </Link>
            <Link
              to="/admin/orders"
              className="bg-white/10 hover:bg-white/20 backdrop-blur rounded-xl p-4 transition-all text-center"
            >
              <div className="text-3xl mb-2">🛒</div>
              <p className="font-semibold">Quản lý đơn hàng</p>
            </Link>
            <Link
              to="/admin/appointments"
              className="bg-white/10 hover:bg-white/20 backdrop-blur rounded-xl p-4 transition-all text-center"
            >
              <div className="text-3xl mb-2">📅</div>
              <p className="font-semibold">Quản lý lịch hẹn</p>
            </Link>
            <Link
              to="/admin/users"
              className="bg-white/10 hover:bg-white/20 backdrop-blur rounded-xl p-4 transition-all text-center"
            >
              <div className="text-3xl mb-2">👥</div>
              <p className="font-semibold">Quản lý user</p>
            </Link>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;