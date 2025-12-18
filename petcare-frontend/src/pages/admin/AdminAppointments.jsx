import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../components/admin/Adminlayout';
import StatCard from '../../components/admin/StatCard';
import Pagination from '../../components/common/Pagination';
import { appointmentsAPI } from '../../services/api';
import toast from 'react-hot-toast';

const AdminAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    inProgress: 0,
    completed: 0,
    cancelled: 0,
    totalRevenue: 0,
  });

  // Pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
  });

  // Filters
  const [filters, setFilters] = useState({
    status: '',
    serviceType: '',
    dateFrom: '',
    dateTo: '',
  });

  // Modals
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  // Form states
  const [cancelReason, setCancelReason] = useState('');
  const [veterinarianNotes, setVeterinarianNotes] = useState('');

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('vi-VN');
  };

  const formatDateTime = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString('vi-VN');
  };

  // Fetch statistics
  const fetchStatistics = async () => {
    try {
      const response = await appointmentsAPI.getStatistics();
      console.log('📊 Statistics response:', response.data);

      if (response.data?.data) {
        const data = response.data.data;
        setStats({
          total: data.totalAppointments || 0,
          pending: data.appointmentsByStatus?.pending || 0,
          confirmed: data.appointmentsByStatus?.confirmed || 0,
          inProgress: data.appointmentsByStatus?.inProgress || 0,
          completed: data.appointmentsByStatus?.completed || 0,
          cancelled: data.appointmentsByStatus?.cancelled || 0,
          totalRevenue: data.totalRevenue || 0,
        });
      }
    } catch (error) {
      console.error('❌ Error fetching statistics:', error);
    }
  };

  // Fetch appointments
  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);

      const params = {
        page: pagination.page,
        limit: pagination.limit,
      };

      if (filters.status) params.status = filters.status;
      if (filters.serviceType) params.serviceType = filters.serviceType;
      if (filters.dateFrom) params.dateFrom = filters.dateFrom;
      if (filters.dateTo) params.dateTo = filters.dateTo;

      const response = await appointmentsAPI.getAll(params);
      console.log('📦 Appointments response:', response.data);

      if (response.data) {
        const appointmentsData = response.data.data || [];
        const paginationInfo = response.data.pagination || {};

        setAppointments(Array.isArray(appointmentsData) ? appointmentsData : []);

        setPagination((prev) => ({
          ...prev,
          page: paginationInfo.page || prev.page,
          totalPages: paginationInfo.totalPages || 1,
        }));
      }
    } catch (error) {
      console.error('❌ Error fetching appointments:', error);
      toast.error(error.response?.data?.message || 'Không thể tải danh sách lịch hẹn!');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filters]);

  useEffect(() => {
    fetchStatistics();
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchAppointments();
  };

  const handleOpenDetailsModal = (appointment) => {
    setSelectedAppointment(appointment);
    setShowDetailsModal(true);
  };

  const handleOpenCancelModal = (appointment) => {
    setSelectedAppointment(appointment);
    setCancelReason('');
    setShowCancelModal(true);
  };

  const handleOpenCompleteModal = (appointment) => {
    setSelectedAppointment(appointment);
    setVeterinarianNotes('');
    setShowCompleteModal(true);
  };

  const handleCloseModals = () => {
    setShowDetailsModal(false);
    setShowCancelModal(false);
    setShowCompleteModal(false);
    setSelectedAppointment(null);
    setCancelReason('');
    setVeterinarianNotes('');
  };

  // ==================== ✅ FIXED FUNCTIONS ====================

  const handleConfirm = async (appointmentId) => {
    try {
      setLoading(true);

      const payload = {
        status: 'confirmed',
        note: 'Đã xác nhận lịch hẹn',
      };

      console.log('📤 Confirm payload:', payload);

      await appointmentsAPI.updateStatus(appointmentId, payload);

      toast.success('Xác nhận lịch hẹn thành công!');
      fetchAppointments();
      fetchStatistics();
    } catch (error) {
      console.error('❌ Error confirming:', error);
      console.error('❌ Response:', error.response?.data);

      const errorMsg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Xác nhận lịch hẹn thất bại!';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    try {
      setLoading(true);

      // ✅ FIXED: Build payload correctly
      const payload = {
        status: 'completed',
        note: 'Lịch hẹn đã hoàn thành',
      };

      // Only add veterinarianNotes if provided and not empty
      if (veterinarianNotes && veterinarianNotes.trim()) {
        payload.veterinarianNotes = veterinarianNotes.trim();
      }

      console.log('📤 Complete payload:', payload);

      await appointmentsAPI.updateStatus(selectedAppointment._id, payload);

      toast.success('Hoàn thành lịch hẹn thành công!');
      handleCloseModals();
      fetchAppointments();
      fetchStatistics();
    } catch (error) {
      console.error('❌ Error completing:', error);
      console.error('❌ Response:', error.response?.data);

      const errorMsg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Hoàn thành lịch hẹn thất bại!';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    // Validate cancel reason
    if (!cancelReason || !cancelReason.trim()) {
      toast.error('Vui lòng nhập lý do hủy!');
      return;
    }

    try {
      setLoading(true);

      // ✅ FIXED: Use note instead of cancelReason (backend DTO doesn't have cancelReason)
      const payload = {
        status: 'cancelled',
        note: `Đã hủy lịch hẹn. Lý do: ${cancelReason.trim()}`,
      };

      console.log('📤 Cancel payload:', payload);

      await appointmentsAPI.updateStatus(selectedAppointment._id, payload);

      toast.success('Hủy lịch hẹn thành công!');
      handleCloseModals();
      fetchAppointments();
      fetchStatistics();
    } catch (error) {
      console.error('❌ Error cancelling:', error);
      console.error('❌ Response:', error.response?.data);

      const errorMsg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Hủy lịch hẹn thất bại!';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleInProgress = async (appointmentId) => {
    try {
      setLoading(true);

      const payload = {
        status: 'in_progress', // ⚠️ Note: underscore, not camelCase
        note: 'Đang thực hiện dịch vụ',
      };

      console.log('📤 In Progress payload:', payload);

      await appointmentsAPI.updateStatus(appointmentId, payload);

      toast.success('Cập nhật trạng thái thành công!');
      fetchAppointments();
      fetchStatistics();
    } catch (error) {
      console.error('❌ Error updating:', error);
      console.error('❌ Response:', error.response?.data);

      const errorMsg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Cập nhật trạng thái thất bại!';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // ==================== END FIXED FUNCTIONS ====================

  const getServiceLabel = (serviceType) => {
    const labels = {
      grooming: 'Cắt tỉa lông',
      veterinary: 'Khám sức khỏe',
      spa: 'Pet Spa',
      training: 'Huấn luyện',
      hotel: 'Khách sạn thú cưng',
    };
    return labels[serviceType] || serviceType;
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: {
        text: 'Chờ xác nhận',
        className: 'bg-yellow-100 text-yellow-700',
      },
      confirmed: {
        text: 'Đã xác nhận',
        className: 'bg-blue-100 text-blue-700',
      },
      in_progress: {
        text: 'Đang thực hiện',
        className: 'bg-purple-100 text-purple-700',
      },
      completed: {
        text: 'Hoàn thành',
        className: 'bg-green-100 text-green-700',
      },
      cancelled: {
        text: 'Đã hủy',
        className: 'bg-red-100 text-red-700',
      },
    };

    const badge = badges[status] || badges.pending;

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.className}`}>
        {badge.text}
      </span>
    );
  };

  const getActionButtons = (appointment) => {
    const { status } = appointment;

    // Pending: Can confirm or cancel
    if (status === 'pending') {
      return (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleConfirm(appointment._id)}
            className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            Xác nhận
          </button>
          <button
            onClick={() => handleOpenCancelModal(appointment)}
            className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
          >
            Hủy
          </button>
        </div>
      );
    }

    // Confirmed: Can start or cancel
    if (status === 'confirmed') {
      return (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleInProgress(appointment._id)}
            className="px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
          >
            Bắt đầu
          </button>
          <button
            onClick={() => handleOpenCancelModal(appointment)}
            className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
          >
            Hủy
          </button>
        </div>
      );
    }

    // In Progress: Can complete
    if (status === 'in_progress') {
      return (
        <button
          onClick={() => handleOpenCompleteModal(appointment)}
          className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
        >
          Hoàn thành
        </button>
      );
    }

    // Completed or Cancelled: No actions
    return (
      <span className="text-sm text-gray-500">
        {status === 'completed' ? 'Đã hoàn thành' : 'Đã hủy'}
      </span>
    );
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
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Quản lý lịch hẹn 📅</h1>
          <p className="text-gray-600">Quản lý tất cả lịch hẹn dịch vụ</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Tổng lịch hẹn"
            value={stats.total.toLocaleString()}
            icon="📅"
            color="blue"
          />
          <StatCard
            title="Chờ xác nhận"
            value={stats.pending.toLocaleString()}
            icon="⏳"
            color="yellow"
          />
          <StatCard
            title="Đã xác nhận"
            value={stats.confirmed.toLocaleString()}
            icon="✅"
            color="green"
          />
          <StatCard
            title="Doanh thu"
            value={formatCurrency(stats.totalRevenue)}
            icon="💰"
            color="purple"
          />
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Đang thực hiện"
            value={stats.inProgress.toLocaleString()}
            icon="🔄"
            color="purple"
          />
          <StatCard
            title="Hoàn thành"
            value={stats.completed.toLocaleString()}
            icon="✔️"
            color="green"
          />
          <StatCard
            title="Đã hủy"
            value={stats.cancelled.toLocaleString()}
            icon="❌"
            color="red"
          />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Status Filter */}
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="pending">Chờ xác nhận</option>
              <option value="confirmed">Đã xác nhận</option>
              <option value="in_progress">Đang thực hiện</option>
              <option value="completed">Hoàn thành</option>
              <option value="cancelled">Đã hủy</option>
            </select>

            {/* Service Type Filter */}
            <select
              value={filters.serviceType}
              onChange={(e) => handleFilterChange('serviceType', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Tất cả dịch vụ</option>
              <option value="grooming">Cắt tỉa lông</option>
              <option value="veterinary">Khám sức khỏe</option>
              <option value="spa">Pet Spa</option>
              <option value="training">Huấn luyện</option>
              <option value="hotel">Khách sạn thú cưng</option>
            </select>

            {/* Date From */}
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Từ ngày"
            />

            {/* Date To */}
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Đến ngày"
            />
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={handleSearch}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all"
            >
              Tìm kiếm
            </button>
          </div>
        </div>

        {/* Appointments Table */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Khách hàng
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Thú cưng
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Dịch vụ
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Ngày & Giờ
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Giá
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {appointments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      Không tìm thấy lịch hẹn nào
                    </td>
                  </tr>
                ) : (
                  appointments.map((appointment) => (
                    <tr key={appointment._id} className="hover:bg-gray-50 transition-colors">
                      {/* Customer */}
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-gray-800">
                            {appointment.customerName || 'N/A'}
                          </p>
                          <p className="text-sm text-gray-500">
                            {appointment.customerPhone || 'N/A'}
                          </p>
                        </div>
                      </td>

                      {/* Pet */}
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-gray-800">
                            {appointment.petId?.name || 'N/A'}
                          </p>
                          <p className="text-sm text-gray-500">
                            {appointment.petId?.species || ''} - {appointment.petId?.breed || ''}
                          </p>
                        </div>
                      </td>

                      {/* Service */}
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
                          {getServiceLabel(appointment.serviceType)}
                        </span>
                      </td>

                      {/* Date & Time */}
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-semibold text-gray-800">
                            {formatDate(appointment.appointmentDate)}
                          </p>
                          <p className="text-xs text-gray-500">{appointment.timeSlot}</p>
                        </div>
                      </td>

                      {/* Price */}
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-800">
                          {formatCurrency(appointment.price)}
                        </p>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">{getStatusBadge(appointment.status)}</td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenDetailsModal(appointment)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Xem chi tiết"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                          </button>
                          {getActionButtons(appointment)}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && appointments.length > 0 && (
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={(page) => setPagination((prev) => ({ ...prev, page }))}
            />
          )}
        </div>
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">Chi tiết lịch hẹn</h3>
              <button
                onClick={handleCloseModals}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {/* Customer Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-2">Thông tin khách hàng</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-sm text-gray-600">Tên khách hàng</p>
                    <p className="font-semibold">{selectedAppointment.customerName || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Số điện thoại</p>
                    <p className="font-semibold">{selectedAppointment.customerPhone || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Pet Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-2">Thông tin thú cưng</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-sm text-gray-600">Tên</p>
                    <p className="font-semibold">
                      {selectedAppointment.petId?.name || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Loài</p>
                    <p className="font-semibold">
                      {selectedAppointment.petId?.species || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Giống</p>
                    <p className="font-semibold">
                      {selectedAppointment.petId?.breed || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Tuổi</p>
                    <p className="font-semibold">
                      {selectedAppointment.petId?.age || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Appointment Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-2">Thông tin lịch hẹn</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-sm text-gray-600">Dịch vụ</p>
                    <p className="font-semibold">
                      {getServiceLabel(selectedAppointment.serviceType)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Ngày hẹn</p>
                    <p className="font-semibold">
                      {formatDate(selectedAppointment.appointmentDate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Khung giờ</p>
                    <p className="font-semibold">{selectedAppointment.timeSlot}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Giá</p>
                    <p className="font-semibold">{formatCurrency(selectedAppointment.price)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Trạng thái</p>
                    <div className="mt-1">{getStatusBadge(selectedAppointment.status)}</div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Thanh toán</p>
                    <p className="font-semibold">
                      {selectedAppointment.isPaid ? 'Đã thanh toán' : 'Chưa thanh toán'}
                    </p>
                  </div>
                </div>

                {selectedAppointment.notes && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-600">Ghi chú</p>
                    <p className="text-gray-800">{selectedAppointment.notes}</p>
                  </div>
                )}

                {selectedAppointment.veterinarianNotes && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-600">Ghi chú của bác sĩ</p>
                    <p className="text-gray-800">{selectedAppointment.veterinarianNotes}</p>
                  </div>
                )}

                {selectedAppointment.cancelReason && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-600">Lý do hủy</p>
                    <p className="text-red-600">{selectedAppointment.cancelReason}</p>
                  </div>
                )}
              </div>

              {/* Timestamps */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-2">Thời gian</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-gray-600">Ngày tạo</p>
                    <p>{formatDateTime(selectedAppointment.createdAt)}</p>
                  </div>
                  {selectedAppointment.completedAt && (
                    <div>
                      <p className="text-gray-600">Ngày hoàn thành</p>
                      <p>{formatDateTime(selectedAppointment.completedAt)}</p>
                    </div>
                  )}
                  {selectedAppointment.cancelledAt && (
                    <div>
                      <p className="text-gray-600">Ngày hủy</p>
                      <p>{formatDateTime(selectedAppointment.cancelledAt)}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={handleCloseModals}
                className="px-6 py-2 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Complete Modal */}
      {showCompleteModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">Hoàn thành lịch hẹn</h3>
              <button onClick={handleCloseModals} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="mb-4">
              <p className="text-gray-600 mb-4">
                Xác nhận hoàn thành lịch hẹn cho{' '}
                <strong>{selectedAppointment.customerName}</strong>?
              </p>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Ghi chú của bác sĩ (tùy chọn)
                </label>
                <textarea
                  value={veterinarianNotes}
                  onChange={(e) => setVeterinarianNotes(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Nhập ghi chú về tình trạng sức khỏe, điều trị..."
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCloseModals}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleComplete}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Đang xử lý...' : 'Hoàn thành'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-red-600">Hủy lịch hẹn</h3>
              <button onClick={handleCloseModals} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="mb-4">
              <p className="text-gray-600 mb-4">
                Bạn có chắc chắn muốn hủy lịch hẹn cho{' '}
                <strong>{selectedAppointment.customerName}</strong>?
              </p>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Lý do hủy <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Nhập lý do hủy lịch hẹn..."
                  required
                />
              </div>

              <p className="text-sm text-red-600 mt-2">⚠️ Hành động này không thể hoàn tác!</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCloseModals}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Không
              </button>
              <button
                onClick={handleCancel}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Đang xử lý...' : 'Hủy lịch hẹn'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminAppointments;