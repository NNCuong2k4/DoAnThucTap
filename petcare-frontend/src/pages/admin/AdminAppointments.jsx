import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/Adminlayout';
import Pagination from '../../components/common/Pagination';
import { appointmentsAPI } from '../../services/api';
import toast from 'react-hot-toast';

const AdminAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({
    totalAppointments: 0,
    appointmentsByStatus: {
      pending: 0,
      confirmed: 0,
      inProgress: 0,
      completed: 0,
      cancelled: 0,
    },
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterStatus, setFilterStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  // Fetch stats
  const fetchStats = async () => {
    try {
      console.log('📊 Fetching appointment stats...');
      const response = await appointmentsAPI.getStatistics();
      console.log('📊 Stats response:', response);
      
      const statsData = response.data || {
        totalAppointments: 0,
        appointmentsByStatus: {
          pending: 0,
          confirmed: 0,
          inProgress: 0,
          completed: 0,
          cancelled: 0,
        },
        totalRevenue: 0,
      };
      
      console.log('✅ Stats data:', statsData);
      setStats(statsData);
    } catch (error) {
      console.error('❌ Error fetching stats:', error);
      setStats({
        totalAppointments: 0,
        appointmentsByStatus: {
          pending: 0,
          confirmed: 0,
          inProgress: 0,
          completed: 0,
          cancelled: 0,
        },
        totalRevenue: 0,
      });
    }
  };

  // Fetch appointments
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        ...(filterStatus && { status: filterStatus }),
      };
      
      console.log('📡 Fetching appointments with params:', params);
      const response = await appointmentsAPI.getAll(params);
      console.log('📦 Appointments response:', response);
      console.log('📦 Response.data structure:', {
        'response.data': response.data,
        'response.data.data': response.data?.data,
        'response.data.pagination': response.data?.pagination,
        'response.pagination': response.pagination,
      });
      
      let appointmentsData = [];
      let totalPagesData = 1;
      
      if (response) {
        // ✅ Handle multiple response structures
        if (response.data) {
          // Structure 1: { data: { data: [...], pagination: {...} } }
          if (response.data.data && Array.isArray(response.data.data)) {
            appointmentsData = response.data.data;
            totalPagesData = response.data.pagination?.totalPages || 
                            Math.ceil((response.data.pagination?.total || appointmentsData.length) / 10);
          }
          // Structure 2: { data: [...], pagination: {...} }
          else if (Array.isArray(response.data)) {
            appointmentsData = response.data;
            totalPagesData = response.pagination?.totalPages || 
                            Math.ceil((response.pagination?.total || appointmentsData.length) / 10);
          }
        }
      }
      
      console.log('✅ Parsed:', {
        appointmentsCount: appointmentsData.length,
        totalPages: totalPagesData,
        hasData: appointmentsData.length > 0
      });
      
      // Client-side search filter
      if (searchTerm) {
        appointmentsData = appointmentsData.filter(apt => {
          const customerName = apt.customerName?.toLowerCase() || '';
          const customerPhone = apt.customerPhone || '';
          const petName = apt.petId?.name?.toLowerCase() || '';
          const search = searchTerm.toLowerCase();
          
          return customerName.includes(search) || 
                 customerPhone.includes(search) || 
                 petName.includes(search);
        });
      }
      
      console.log('✅ Appointments data:', appointmentsData, 'Total pages:', totalPagesData);
      setAppointments(appointmentsData);
      setTotalPages(totalPagesData);
    } catch (error) {
      console.error('❌ Error fetching appointments:', error);
      toast.error(error.response?.data?.message || 'Không thể tải danh sách lịch hẹn!');
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [currentPage, filterStatus]);

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage === 1) {
        fetchAppointments();
      } else {
        setCurrentPage(1);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Handlers
  const handleViewDetail = (appointment) => {
    setSelectedAppointment(appointment);
    setShowDetailModal(true);
  };

  const handleConfirmAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setShowConfirmModal(true);
  };

  const handleRejectAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setShowRejectModal(true);
  };

  const handleCompleteAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setShowCompleteModal(true);
  };

  const handleAppointmentUpdated = () => {
    fetchAppointments();
    fetchStats();
  };

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const badges = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Chờ xác nhận' },
      confirmed: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Đã xác nhận' },
      in_progress: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Đang thực hiện' },
      completed: { bg: 'bg-green-100', text: 'text-green-700', label: 'Hoàn thành' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-700', label: 'Đã hủy' },
    };
    const badge = badges[status] || badges.pending;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  // Get service label
  const getServiceLabel = (serviceType) => {
    const labels = {
      grooming: 'Cắt tỉa lông',
      veterinary: 'Khám sức khỏe',
      spa: 'Pet Spa',
      training: 'Huấn luyện',
      hotel: 'Khách sạn',
    };
    return labels[serviceType] || serviceType;
  };

  if (loading && appointments.length === 0) {
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
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Quản lý Lịch hẹn Dịch vụ 📅</h1>
          <p className="text-gray-600">Xác nhận, duyệt hoặc từ chối các lịch hẹn dịch vụ</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90 mb-1">Tổng lịch hẹn</p>
                <h3 className="text-3xl font-bold">{stats.totalAppointments}</h3>
              </div>
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90 mb-1">Chờ xác nhận</p>
                <h3 className="text-3xl font-bold">{stats.appointmentsByStatus?.pending || 0}</h3>
              </div>
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90 mb-1">Đã xác nhận</p>
                <h3 className="text-3xl font-bold">{stats.appointmentsByStatus?.confirmed || 0}</h3>
              </div>
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90 mb-1">Hoàn thành</p>
                <h3 className="text-3xl font-bold">{stats.appointmentsByStatus?.completed || 0}</h3>
              </div>
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Search */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Tìm kiếm theo tên khách hàng, tên thú cưng hoặc SĐT..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter Buttons */}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setFilterStatus('')}
                className={`px-4 py-2 rounded-xl transition-colors ${
                  filterStatus === ''
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Tất cả
              </button>
              <button
                onClick={() => setFilterStatus('pending')}
                className={`px-4 py-2 rounded-xl transition-colors ${
                  filterStatus === 'pending'
                    ? 'bg-yellow-600 text-white'
                    : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                }`}
              >
                Chờ xác nhận
              </button>
              <button
                onClick={() => setFilterStatus('confirmed')}
                className={`px-4 py-2 rounded-xl transition-colors ${
                  filterStatus === 'confirmed'
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                }`}
              >
                Đã xác nhận
              </button>
              <button
                onClick={() => setFilterStatus('completed')}
                className={`px-4 py-2 rounded-xl transition-colors ${
                  filterStatus === 'completed'
                    ? 'bg-green-600 text-white'
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
              >
                Hoàn thành
              </button>
            </div>
          </div>
        </div>

        {/* Appointments Table */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Khách hàng</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Thú cưng</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Dịch vụ</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Thời gian</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Ghi chú</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Trạng thái</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {appointments.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-lg font-medium">Không có lịch hẹn nào</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  appointments.map((appointment) => (
                    <tr key={appointment._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-gray-800">{appointment.customerName}</p>
                          <p className="text-sm text-gray-500">{appointment.customerPhone}</p>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-800">{appointment.petId?.name || 'N/A'}</p>
                          <p className="text-sm text-gray-500">
                            {appointment.petId?.species} {appointment.petId?.breed && `- ${appointment.petId.breed}`}
                          </p>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-gray-700">
                          {getServiceLabel(appointment.serviceType)}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-800">
                            {formatDate(appointment.appointmentDate)}
                          </p>
                          <p className="text-sm text-gray-500">{appointment.timeSlot}</p>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        {appointment.notes ? (
                          <button
                            onClick={() => handleViewDetail(appointment)}
                            className="text-sm text-blue-600 hover:text-blue-700 underline"
                          >
                            Xem ghi chú
                          </button>
                        ) : (
                          <span className="text-sm text-gray-400">Không có</span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        {getStatusBadge(appointment.status)}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          {/* View Detail Button */}
                          <button
                            onClick={() => handleViewDetail(appointment)}
                            className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition-colors"
                            title="Xem chi tiết"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>

                          {/* Confirm Button - Only for pending */}
                          {appointment.status === 'pending' && (
                            <button
                              onClick={() => handleConfirmAppointment(appointment)}
                              className="p-2 bg-green-100 hover:bg-green-200 text-green-600 rounded-lg transition-colors"
                              title="Duyệt"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </button>
                          )}

                          {/* Reject Button - Only for pending */}
                          {appointment.status === 'pending' && (
                            <button
                              onClick={() => handleRejectAppointment(appointment)}
                              className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors"
                              title="Từ chối"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          )}

                          {/* Complete Button - Only for confirmed or in_progress */}
                          {(appointment.status === 'confirmed' || appointment.status === 'in_progress') && (
                            <button
                              onClick={() => handleCompleteAppointment(appointment)}
                              className="p-2 bg-cyan-100 hover:bg-cyan-200 text-cyan-600 rounded-lg transition-colors"
                              title="Hoàn thành"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* ✅ PAGINATION COMPONENT */}
          {!loading && appointments.length > 0 && (
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
              <div className="text-center text-sm text-gray-500 mt-2">
                Hiển thị {appointments.length} lịch hẹn - Trang {currentPage}/{totalPages}
              </div>
            </div>
          )}
        </div>

        {/* Modals */}
        {showDetailModal && selectedAppointment && (
          <AppointmentDetailModal
            appointment={selectedAppointment}
            onClose={() => setShowDetailModal(false)}
          />
        )}

        {showConfirmModal && selectedAppointment && (
          <ConfirmAppointmentModal
            appointment={selectedAppointment}
            onClose={() => setShowConfirmModal(false)}
            onSuccess={handleAppointmentUpdated}
          />
        )}

        {showRejectModal && selectedAppointment && (
          <RejectAppointmentModal
            appointment={selectedAppointment}
            onClose={() => setShowRejectModal(false)}
            onSuccess={handleAppointmentUpdated}
          />
        )}

        {showCompleteModal && selectedAppointment && (
          <CompleteAppointmentModal
            appointment={selectedAppointment}
            onClose={() => setShowCompleteModal(false)}
            onSuccess={handleAppointmentUpdated}
          />
        )}
      </div>
    </AdminLayout>
  );
};

// ==================== APPOINTMENT DETAIL MODAL ====================
const AppointmentDetailModal = ({ appointment, onClose }) => {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('vi-VN');
  };

  const getServiceLabel = (serviceType) => {
    const labels = {
      grooming: 'Cắt tỉa lông',
      veterinary: 'Khám sức khỏe',
      spa: 'Pet Spa',
      training: 'Huấn luyện',
      hotel: 'Khách sạn',
    };
    return labels[serviceType] || serviceType;
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Chờ xác nhận',
      confirmed: 'Đã xác nhận',
      in_progress: 'Đang thực hiện',
      completed: 'Hoàn thành',
      cancelled: 'Đã hủy',
    };
    return labels[status] || status;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-4 flex items-center justify-between rounded-t-2xl sticky top-0 z-10">
          <div>
            <h3 className="text-xl font-bold">Chi tiết lịch hẹn</h3>
            <p className="text-sm opacity-90">Thông tin chi tiết về lịch hẹn dịch vụ</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h4 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Thông tin khách hàng
            </h4>
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <p><span className="font-semibold">Tên:</span> {appointment.customerName}</p>
              <p><span className="font-semibold">SĐT:</span> {appointment.customerPhone}</p>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Thông tin thú cưng
            </h4>
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <p><span className="font-semibold">Tên:</span> {appointment.petId?.name}</p>
              <p><span className="font-semibold">Loài:</span> {appointment.petId?.species}</p>
              <p><span className="font-semibold">Giống:</span> {appointment.petId?.breed}</p>
              {appointment.petId?.age && (
                <p><span className="font-semibold">Tuổi:</span> {appointment.petId.age} tuổi</p>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Thông tin lịch hẹn
            </h4>
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <p><span className="font-semibold">Dịch vụ:</span> {getServiceLabel(appointment.serviceType)}</p>
              <p><span className="font-semibold">Ngày hẹn:</span> {formatDate(appointment.appointmentDate)}</p>
              <p><span className="font-semibold">Khung giờ:</span> {appointment.timeSlot}</p>
              <p><span className="font-semibold">Giá:</span> <span className="text-lg font-bold text-purple-600">{formatCurrency(appointment.price)}</span></p>
              {appointment.notes && (
                <div>
                  <p className="font-semibold mb-1">Ghi chú:</p>
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <p className="text-gray-700">{appointment.notes}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {appointment.statusHistory && appointment.statusHistory.length > 0 && (
            <div>
              <h4 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Lịch sử trạng thái
              </h4>
              <div className="space-y-2">
                {appointment.statusHistory.map((history, index) => (
                  <div key={index} className="bg-gray-50 rounded-xl p-3 flex items-start gap-3">
                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-indigo-600">{index + 1}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-semibold text-gray-800">{getStatusLabel(history.status)}</p>
                        <p className="text-sm text-gray-600">{formatDate(history.timestamp)}</p>
                      </div>
                      {history.note && <p className="text-sm text-gray-600">{history.note}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="bg-gray-50 px-6 py-4 rounded-b-2xl flex justify-end sticky bottom-0">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-xl transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

// ==================== CONFIRM APPOINTMENT MODAL ====================
const ConfirmAppointmentModal = ({ appointment, onClose, onSuccess }) => {
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    try {
      setLoading(true);
      await appointmentsAPI.updateStatus(appointment._id, {
        status: 'confirmed',
        note: note || 'Lịch hẹn đã được xác nhận',
      });
      toast.success('Xác nhận lịch hẹn thành công!');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error confirming appointment:', error);
      toast.error(error.response?.data?.message || 'Xác nhận lịch hẹn thất bại!');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  const getServiceLabel = (serviceType) => {
    const labels = {
      grooming: 'Cắt tỉa lông',
      veterinary: 'Khám sức khỏe',
      spa: 'Pet Spa',
      training: 'Huấn luyện',
      hotel: 'Khách sạn',
    };
    return labels[serviceType] || serviceType;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h3 className="text-xl font-bold">Xác nhận lịch hẹn</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <p className="font-semibold text-green-800 mb-1">Xác nhận lịch hẹn</p>
                <p className="text-sm text-green-700">
                  Bạn đang xác nhận lịch hẹn này. Khách hàng sẽ nhận được thông báo.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <p><span className="font-semibold">Khách hàng:</span> {appointment.customerName}</p>
            <p><span className="font-semibold">Thú cưng:</span> {appointment.petId?.name}</p>
            <p><span className="font-semibold">Dịch vụ:</span> {getServiceLabel(appointment.serviceType)}</p>
            <p><span className="font-semibold">Thời gian:</span> {appointment.timeSlot}</p>
            <p><span className="font-semibold">Giá:</span> <span className="text-lg font-bold text-green-600">{formatCurrency(appointment.price)}</span></p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ghi chú
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              placeholder="Nhập ghi chú (tùy chọn)..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white rounded-xl transition-colors disabled:opacity-50"
            >
              {loading ? 'Đang xử lý...' : 'Xác nhận'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== REJECT APPOINTMENT MODAL ====================
const RejectAppointmentModal = ({ appointment, onClose, onSuccess }) => {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReject = async () => {
    if (!reason.trim()) {
      toast.error('Vui lòng nhập lý do từ chối!');
      return;
    }

    try {
      setLoading(true);
      await appointmentsAPI.updateStatus(appointment._id, {
        status: 'cancelled',
        note: `Lịch hẹn bị từ chối. Lý do: ${reason}`,
      });
      toast.success('Từ chối lịch hẹn thành công!');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error rejecting appointment:', error);
      toast.error(error.response?.data?.message || 'Từ chối lịch hẹn thất bại!');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  const getServiceLabel = (serviceType) => {
    const labels = {
      grooming: 'Cắt tỉa lông',
      veterinary: 'Khám sức khỏe',
      spa: 'Pet Spa',
      training: 'Huấn luyện',
      hotel: 'Khách sạn',
    };
    return labels[serviceType] || serviceType;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div className="bg-gradient-to-r from-red-600 to-pink-600 text-white px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h3 className="text-xl font-bold">Từ chối lịch hẹn</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div className="flex-1">
                <p className="font-semibold text-red-800 mb-1">Cảnh báo</p>
                <p className="text-sm text-red-700">
                  Bạn đang từ chối lịch hẹn này. Hành động này không thể hoàn tác!
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <p><span className="font-semibold">Khách hàng:</span> {appointment.customerName}</p>
            <p><span className="font-semibold">Thú cưng:</span> {appointment.petId?.name}</p>
            <p><span className="font-semibold">Dịch vụ:</span> {getServiceLabel(appointment.serviceType)}</p>
            <p><span className="font-semibold">Thời gian:</span> {appointment.timeSlot}</p>
            <p><span className="font-semibold">Giá:</span> <span className="text-lg font-bold text-red-600">{formatCurrency(appointment.price)}</span></p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lý do từ chối <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
              placeholder="Nhập lý do từ chối lịch hẹn (bắt buộc)..."
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl transition-colors"
            >
              Đóng
            </button>
            <button
              onClick={handleReject}
              disabled={loading || !reason.trim()}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Đang xử lý...' : 'Xác nhận từ chối'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== COMPLETE APPOINTMENT MODAL ====================
const CompleteAppointmentModal = ({ appointment, onClose, onSuccess }) => {
  const [veterinarianNotes, setVeterinarianNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleComplete = async () => {
    try {
      setLoading(true);
      await appointmentsAPI.updateStatus(appointment._id, {
        status: 'completed',
        note: 'Lịch hẹn đã hoàn thành',
        veterinarianNotes: veterinarianNotes || undefined,
      });
      toast.success('Hoàn thành lịch hẹn thành công!');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error completing appointment:', error);
      toast.error(error.response?.data?.message || 'Hoàn thành lịch hẹn thất bại!');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  const getServiceLabel = (serviceType) => {
    const labels = {
      grooming: 'Cắt tỉa lông',
      veterinary: 'Khám sức khỏe',
      spa: 'Pet Spa',
      training: 'Huấn luyện',
      hotel: 'Khách sạn',
    };
    return labels[serviceType] || serviceType;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h3 className="text-xl font-bold">Hoàn thành lịch hẹn</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-cyan-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <div className="flex-1">
                <p className="font-semibold text-cyan-800 mb-1">Hoàn thành lịch hẹn</p>
                <p className="text-sm text-cyan-700">
                  Xác nhận lịch hẹn này đã được hoàn thành và thanh toán.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <p><span className="font-semibold">Khách hàng:</span> {appointment.customerName}</p>
            <p><span className="font-semibold">Thú cưng:</span> {appointment.petId?.name}</p>
            <p><span className="font-semibold">Dịch vụ:</span> {getServiceLabel(appointment.serviceType)}</p>
            <p><span className="font-semibold">Thời gian:</span> {appointment.timeSlot}</p>
            <p><span className="font-semibold">Giá:</span> <span className="text-lg font-bold text-cyan-600">{formatCurrency(appointment.price)}</span></p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ghi chú bác sĩ / Nhân viên
            </label>
            <textarea
              value={veterinarianNotes}
              onChange={(e) => setVeterinarianNotes(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
              placeholder="Nhập ghi chú về dịch vụ đã thực hiện (tùy chọn)..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleComplete}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white rounded-xl transition-colors disabled:opacity-50"
            >
              {loading ? 'Đang xử lý...' : 'Hoàn thành'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAppointments;