import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { appointmentsAPI } from '../services/api';
import Header from '../components/layout/Header';
import toast from 'react-hot-toast';

const AppointmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetchAppointmentDetail();
  }, [id]);

  const fetchAppointmentDetail = async () => {
    try {
      setLoading(true);
      const response = await appointmentsAPI.getById(id);
      
      let appointmentData = null;
      if (response.data?.data) {
        appointmentData = response.data.data;
      } else if (response.data) {
        appointmentData = response.data;
      }
      
      console.log('📦 Appointment detail:', appointmentData);
      setAppointment(appointmentData);
    } catch (error) {
      console.error('❌ Error fetching appointment:', error);
      toast.error('Không thể tải thông tin lịch hẹn!');
      if (error.response?.status === 404) {
        navigate('/appointments');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    const reason = window.prompt('Vui lòng nhập lý do hủy:');
    if (!reason || !reason.trim()) {
      toast.error('Vui lòng nhập lý do hủy!');
      return;
    }

    try {
      setCancelling(true);
      await appointmentsAPI.cancel(id, { reason: reason.trim() });
      toast.success('Đã hủy lịch hẹn!');
      fetchAppointmentDetail(); // Refresh data
    } catch (error) {
      console.error('❌ Error cancelling:', error);
      toast.error(error.response?.data?.message || 'Hủy thất bại!');
    } finally {
      setCancelling(false);
    }
  };

  const getServiceInfo = (serviceType) => {
    const services = {
      grooming: { 
        label: '✂️ Tắm & Cắt tỉa lông', 
        color: 'purple', 
        price: '200,000',
        icon: '✂️',
        bg: 'bg-purple-100',
        text: 'text-purple-800',
        gradient: 'from-purple-400 to-purple-600'
      },
      veterinary: { 
        label: '🏥 Khám thú y', 
        color: 'blue', 
        price: '300,000',
        icon: '🏥',
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        gradient: 'from-blue-400 to-blue-600'
      },
      spa: { 
        label: '💆 Spa thú cưng', 
        color: 'pink', 
        price: '250,000',
        icon: '✨',
        bg: 'bg-pink-100',
        text: 'text-pink-800',
        gradient: 'from-pink-400 to-pink-600'
      },
      training: { 
        label: '🎓 Huấn luyện', 
        color: 'green', 
        price: '500,000',
        icon: '🎓',
        bg: 'bg-green-100',
        text: 'text-green-800',
        gradient: 'from-green-400 to-green-600'
      },
      hotel: { 
        label: '🏨 Trông giữ', 
        color: 'yellow', 
        price: '150,000',
        icon: '🏨',
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        gradient: 'from-yellow-400 to-yellow-600'
      },
    };
    return services[serviceType] || services.veterinary;
  };

  const getStatusConfig = (status) => {
    const configs = {
      pending: { 
        label: 'Chờ xác nhận', 
        icon: '⏳', 
        bg: 'bg-yellow-100', 
        text: 'text-yellow-800',
        border: 'border-yellow-300',
        gradient: 'from-yellow-400 to-yellow-500',
        description: 'Lịch hẹn đang chờ được xác nhận'
      },
      confirmed: { 
        label: 'Đã xác nhận', 
        icon: '✓', 
        bg: 'bg-blue-100', 
        text: 'text-blue-800',
        border: 'border-blue-300',
        gradient: 'from-blue-400 to-blue-500',
        description: 'Lịch hẹn đã được xác nhận và sẵn sàng'
      },
      in_progress: { 
        label: 'Đang thực hiện', 
        icon: '🔄', 
        bg: 'bg-purple-100', 
        text: 'text-purple-800',
        border: 'border-purple-300',
        gradient: 'from-purple-400 to-purple-500',
        description: 'Dịch vụ đang được thực hiện'
      },
      completed: { 
        label: 'Hoàn thành', 
        icon: '✅', 
        bg: 'bg-green-100', 
        text: 'text-green-800',
        border: 'border-green-300',
        gradient: 'from-green-400 to-green-500',
        description: 'Dịch vụ đã hoàn thành'
      },
      cancelled: { 
        label: 'Đã hủy', 
        icon: '❌', 
        bg: 'bg-red-100', 
        text: 'text-red-800',
        border: 'border-red-300',
        gradient: 'from-red-400 to-red-500',
        description: 'Lịch hẹn đã bị hủy'
      },
    };
    return configs[status] || configs.pending;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeSlot) => {
    if (!timeSlot) return '';
    // timeSlot format: "08:00-09:00"
    const [start, end] = timeSlot.split('-');
    return `${start} - ${end}`;
  };

  const canCancel = appointment?.status === 'pending' || appointment?.status === 'confirmed';

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
        <Header user={user} />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
        <Header user={user} />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <p className="text-gray-600 text-xl mb-4">Không tìm thấy lịch hẹn</p>
            <button
              onClick={() => navigate('/appointments')}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              Quay lại danh sách
            </button>
          </div>
        </div>
      </div>
    );
  }

  const serviceInfo = getServiceInfo(appointment.serviceType);
  const statusConfig = getStatusConfig(appointment.status);
  const pet = appointment.petId;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      <Header user={user} />

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/appointments')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="font-medium">Quay lại danh sách</span>
        </button>

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Chi tiết lịch hẹn</h1>
              <p className="text-gray-600">Mã lịch hẹn: #{appointment._id?.slice(-8).toUpperCase()}</p>
            </div>
            <div className={`px-4 py-2 rounded-xl ${statusConfig.bg} border-2 ${statusConfig.border}`}>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{statusConfig.icon}</span>
                <div>
                  <p className={`font-bold ${statusConfig.text}`}>{statusConfig.label}</p>
                  <p className={`text-xs ${statusConfig.text}`}>{statusConfig.description}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Cancel Button */}
          {canCancel && (
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="w-full sm:w-auto px-6 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>{cancelling ? 'Đang hủy...' : 'Hủy lịch hẹn'}</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Service Info */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className={`w-12 h-12 bg-gradient-to-r ${serviceInfo.gradient} rounded-xl flex items-center justify-center text-2xl`}>
                {serviceInfo.icon}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Dịch vụ</h2>
                <p className="text-gray-600 text-sm">Thông tin dịch vụ đã đặt</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className={`p-4 ${serviceInfo.bg} rounded-xl`}>
                <p className="text-sm text-gray-600 mb-1">Loại dịch vụ</p>
                <p className={`text-lg font-bold ${serviceInfo.text}`}>{serviceInfo.label}</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-600 mb-1">Giá dịch vụ</p>
                <p className="text-2xl font-bold text-purple-600">{serviceInfo.price}₫</p>
              </div>
            </div>
          </div>

          {/* Pet Info */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🐾</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Thú cưng</h2>
                <p className="text-gray-600 text-sm">Thông tin thú cưng</p>
              </div>
            </div>

            {pet ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl">
                  <img
                    src={pet.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${pet.name}`}
                    alt={pet.name}
                    className="w-16 h-16 rounded-full border-4 border-white shadow-md"
                  />
                  <div>
                    <p className="text-xl font-bold text-blue-900">{pet.name}</p>
                    <p className="text-sm text-blue-700">{pet.species} • {pet.breed}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-600 mb-1">Giới tính</p>
                    <p className="font-semibold text-gray-800">
                      {pet.gender === 'male' ? '♂️ Đực' : pet.gender === 'female' ? '♀️ Cái' : 'Khác'}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-600 mb-1">Tuổi</p>
                    <p className="font-semibold text-gray-800">{pet.age || 'N/A'} tuổi</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-600 mb-1">Cân nặng</p>
                    <p className="font-semibold text-gray-800">{pet.weight || 'N/A'} kg</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-600 mb-1">Màu sắc</p>
                    <p className="font-semibold text-gray-800">{pet.color || 'N/A'}</p>
                  </div>
                </div>

                {pet.medicalHistory && pet.medicalHistory.length > 0 && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                    <p className="text-xs text-yellow-700 font-semibold mb-2">⚠️ Lưu ý y tế:</p>
                    <p className="text-sm text-yellow-800">{pet.medicalHistory[0]}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>Không có thông tin thú cưng</p>
              </div>
            )}
          </div>

          {/* Date & Time */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-blue-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Ngày & Giờ</h2>
                <p className="text-gray-600 text-sm">Thời gian đặt lịch</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-cyan-50 rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <svg className="w-5 h-5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm text-cyan-700 font-semibold">Ngày hẹn</p>
                </div>
                <p className="text-lg font-bold text-cyan-900">{formatDate(appointment.appointmentDate)}</p>
              </div>

              <div className="p-4 bg-blue-50 rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-blue-700 font-semibold">Giờ hẹn</p>
                </div>
                <p className="text-lg font-bold text-blue-900">{formatTime(appointment.timeSlot)}</p>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-green-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Liên hệ</h2>
                <p className="text-gray-600 text-sm">Thông tin khách hàng</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-xl">
                <p className="text-sm text-green-700 mb-1">Tên khách hàng</p>
                <p className="text-lg font-bold text-green-900">
                  {appointment.customerName || user?.name || 'N/A'}
                </p>
              </div>

              <div className="p-4 bg-blue-50 rounded-xl">
                <p className="text-sm text-blue-700 mb-1">Số điện thoại</p>
                <p className="text-lg font-bold text-blue-900">
                  {appointment.customerPhone || user?.phone || 'N/A'}
                </p>
              </div>

              {appointment.notes && (
                <div className="p-4 bg-purple-50 rounded-xl">
                  <p className="text-sm text-purple-700 mb-1">Ghi chú</p>
                  <p className="text-sm text-purple-900">{appointment.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Cancel Reason (if cancelled) */}
        {appointment.status === 'cancelled' && appointment.cancellationReason && (
          <div className="mt-6 bg-red-50 border-2 border-red-200 rounded-2xl p-6">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">❌</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-red-900 mb-2">Lý do hủy</h3>
                <p className="text-red-800">{appointment.cancellationReason}</p>
                {appointment.cancelledAt && (
                  <p className="text-sm text-red-600 mt-2">
                    Hủy vào: {new Date(appointment.cancelledAt).toLocaleString('vi-VN')}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Timeline (optional - if you want to show history) */}
        <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Lịch sử</h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <p className="font-semibold text-gray-800">Lịch hẹn được tạo</p>
                <p className="text-sm text-gray-600">
                  {new Date(appointment.createdAt).toLocaleString('vi-VN')}
                </p>
              </div>
            </div>
            {appointment.updatedAt !== appointment.createdAt && (
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-semibold text-gray-800">Cập nhật gần nhất</p>
                  <p className="text-sm text-gray-600">
                    {new Date(appointment.updatedAt).toLocaleString('vi-VN')}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentDetail;