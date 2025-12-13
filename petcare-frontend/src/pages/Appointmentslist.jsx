import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { appointmentsAPI } from '../services/api';
import Header from '../components/layout/Header';
import toast from 'react-hot-toast';

const AppointmentsList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await appointmentsAPI.getMyAppointments({});
      
      let appointmentsData = [];
      if (Array.isArray(response.data)) {
        appointmentsData = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        appointmentsData = response.data.data;
      }
      
      setAppointments(appointmentsData);
    } catch (error) {
      console.error('❌ Error fetching appointments:', error);
      toast.error('Không thể tải lịch hẹn!');
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    const reason = window.prompt('Vui lòng nhập lý do hủy:');
    if (!reason) return;

    try {
      await appointmentsAPI.cancel(appointmentId, { reason });
      toast.success('Đã hủy lịch hẹn!');
      fetchAppointments();
    } catch (error) {
      console.error('❌ Error cancelling:', error);
      toast.error(error.response?.data?.message || 'Hủy thất bại!');
    }
  };

  const getServiceInfo = (serviceType) => {
    const services = {
      grooming: { label: '🐕 Tắm & Cắt tỉa lông', color: 'purple', price: '200,000' },
      veterinary: { label: '🏥 Khám thú y', color: 'blue', price: '300,000' },
      spa: { label: '💆 Spa thú cưng', color: 'pink', price: '250,000' },
      training: { label: '🎓 Huấn luyện', color: 'green', price: '500,000' },
      hotel: { label: '🏨 Trông giữ', color: 'yellow', price: '150,000' },
    };
    return services[serviceType] || services.veterinary;
  };

  const getStatusConfig = (status) => {
    const configs = {
      pending: { label: 'Chờ xác nhận', color: 'yellow', icon: '⏳', bg: 'bg-yellow-100', text: 'text-yellow-800' },
      confirmed: { label: 'Đã xác nhận', color: 'blue', icon: '✓', bg: 'bg-blue-100', text: 'text-blue-800' },
      in_progress: { label: 'Đang thực hiện', color: 'purple', icon: '🔄', bg: 'bg-purple-100', text: 'text-purple-800' },
      completed: { label: 'Hoàn thành', color: 'green', icon: '✅', bg: 'bg-green-100', text: 'text-green-800' },
      cancelled: { label: 'Đã hủy', color: 'red', icon: '❌', bg: 'bg-red-100', text: 'text-red-800' },
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      <Header user={user} />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Lịch hẹn của tôi 🗓️</h1>
            <p className="text-gray-600">
              {appointments.length > 0 ? `${appointments.length} lịch hẹn` : 'Chưa có lịch hẹn'}
            </p>
          </div>
          <button
            onClick={() => navigate('/appointments/create')}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Đặt lịch mới</span>
          </button>
        </div>

        {/* Appointments List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Đang tải...</p>
            </div>
          </div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-32 h-32 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <span className="text-6xl">📅</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">Chưa có lịch hẹn</h3>
            <p className="text-gray-500 mb-6">Đặt lịch hẹn đầu tiên của bạn!</p>
            <button
              onClick={() => navigate('/appointments/create')}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              Đặt lịch ngay
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {appointments.map((appointment) => {
              const serviceInfo = getServiceInfo(appointment.serviceType);
              const statusConfig = getStatusConfig(appointment.status);
              const pet = appointment.petId;

              return (
                <div
                  key={appointment._id}
                  className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all p-6 cursor-pointer"
                  onClick={() => navigate(`/appointments/${appointment._id}`)}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className={`px-3 py-1 rounded-full text-sm font-semibold ${statusConfig.bg} ${statusConfig.text}`}>
                      {statusConfig.icon} {statusConfig.label}
                    </div>
                    {(appointment.status === 'pending' || appointment.status === 'confirmed') && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCancelAppointment(appointment._id);
                        }}
                        className="text-red-600 hover:text-red-700"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>

                  {/* Service */}
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {serviceInfo.label}
                  </h3>

                  {/* Pet Info */}
                  <div className="bg-purple-50 rounded-xl p-3 mb-4">
                    <p className="text-sm font-semibold text-purple-900">
                      {pet?.name || 'Thú cưng'} 
                      {pet && ` (${pet.species})`}
                    </p>
                  </div>

                  {/* Date & Time */}
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{formatDate(appointment.appointmentDate)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{appointment.timeSlot}</span>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="pt-4 border-t border-gray-100">
                    <p className="text-lg font-bold text-purple-600">
                      {serviceInfo.price}₫
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentsList;