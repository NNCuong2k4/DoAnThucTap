import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { appointmentsAPI, petsAPI } from '../services/api';
import toast from 'react-hot-toast';

const AppointmentsCreate = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [selectedPet, setSelectedPet] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const services = [
    {
      id: 'spa',
      value: 'spa',
      name: 'Spa thú cưng',
      description: 'Trị liệu spa thư giãn',
      icon: '✨',
      color: 'bg-gradient-to-br from-pink-400 to-pink-500',
      price: '250,000₫'
    },
    {
      id: 'veterinary',
      value: 'veterinary',
      name: 'Thú y',
      description: 'Kiểm tra sức khỏe và chăm sóc',
      icon: '🏥',
      color: 'bg-gradient-to-br from-blue-400 to-blue-500',
      price: '300,000₫'
    },
    {
      id: 'grooming',
      value: 'grooming',
      name: 'Chải chuốt',
      description: 'chải chuốt chuyên nghiệp',
      icon: '✂️',
      color: 'bg-gradient-to-br from-purple-400 to-purple-500',
      price: '200,000₫'
    },
    {
      id: 'training',
      value: 'training',
      name: 'Huấn luyện',
      description: 'Huấn luyện hành vi chuyên nghiệp',
      icon: '🎓',
      color: 'bg-gradient-to-br from-green-400 to-green-500',
      price: '500,000₫'
    },
    {
      id: 'hotel',
      value: 'hotel',
      name: 'Trông giữ',
      description: 'Dịch vụ trông giữ thú cưng',
      icon: '🏨',
      color: 'bg-gradient-to-br from-yellow-400 to-yellow-500',
      price: '150,000₫/ngày'
    }
  ];

  useEffect(() => {
    fetchPets();
  }, []);

  useEffect(() => {
    if (selectedDate && selectedService) {
      fetchAvailableSlots();
    } else {
      setAvailableSlots([]);
      setSelectedSlot(null);
    }
  }, [selectedDate, selectedService]);

  const fetchPets = async () => {
    try {
      setLoading(true);
      const response = await petsAPI.getMyPets();
      
      console.log('🔍 Full response:', response);
      console.log('🔍 response.data:', response.data);
      
      let petsData = [];
      
      // Handle different response formats
      if (Array.isArray(response.data)) {
        // Direct array: response.data = [...]
        petsData = response.data;
      } else if (response.data?.pets && Array.isArray(response.data.pets)) {
        // Backend format: { pets: [...] } ← FIX: Check this first!
        petsData = response.data.pets;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        // Nested format: { data: [...] }
        petsData = response.data.data;
      }
      
      console.log('📦 Parsed pets:', petsData);
      console.log('📊 Count:', petsData.length);
      
      setPets(petsData);
      
      if (location.state?.petId && petsData.length > 0) {
        const pet = petsData.find(p => p._id === location.state.petId);
        if (pet) setSelectedPet(pet);
      }
    } catch (error) {
      console.error('❌ Error fetching pets:', error);
      console.error('❌ Error details:', error.response?.data);
      setPets([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableSlots = async () => {
    try {
      setLoadingSlots(true);
      const response = await appointmentsAPI.getAvailableSlots({
        date: selectedDate.toISOString().split('T')[0],
        serviceType: selectedService.value,
      });
      const slots = response.data?.data?.availableSlots || [];
      setAvailableSlots(slots);
    } catch (error) {
      console.error('❌ Error fetching slots:', error);
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const formatTimeSlot = (slot) => {
    // Convert "08:00-09:00" to "08:00 AM"
    const startTime = slot.split('-')[0];
    const [hour, minute] = startTime.split(':');
    const hourNum = parseInt(hour);
    const ampm = hourNum >= 12 ? 'PM' : 'AM';
    const displayHour = hourNum > 12 ? hourNum - 12 : hourNum;
    return `${displayHour.toString().padStart(2, '0')}:${minute} ${ampm}`;
  };

  const handleSubmit = async () => {
    if (!selectedPet) {
      toast.error('Vui lòng chọn thú cưng!');
      return;
    }
    if (!selectedService) {
      toast.error('Vui lòng chọn dịch vụ!');
      return;
    }
    if (!selectedDate) {
      toast.error('Vui lòng chọn ngày!');
      return;
    }
    if (!selectedSlot) {
      toast.error('Vui lòng chọn giờ!');
      return;
    }

    const appointmentData = {
      petId: selectedPet._id,
      serviceType: selectedService.value,
      appointmentDate: selectedDate.toISOString().split('T')[0],
      timeSlot: selectedSlot,
      notes: '',
      customerName: user?.name || 'Guest',
      customerPhone: user?.phone || '0000000000',
    };

    console.log('📦 Creating appointment:', appointmentData);

    try {
      setSubmitting(true);
      const response = await appointmentsAPI.create(appointmentData);
      console.log('✅ Success:', response);
      toast.success('Đặt lịch thành công! 🎉');
      navigate('/appointments');
    } catch (error) {
      console.error('❌ Error:', error);
      console.error('❌ Response:', error.response?.data);
      toast.error(error.response?.data?.message || 'Đặt lịch thất bại!');
    } finally {
      setSubmitting(false);
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    return { daysInMonth, startingDayOfWeek };
  };

  const renderCalendar = () => {
    const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);
    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="text-center py-2"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const isPast = date < today;
      const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();

      days.push(
        <button
          key={day}
          onClick={() => !isPast && setSelectedDate(date)}
          disabled={isPast}
          className={`
            text-center py-2 rounded-lg transition-all text-sm
            ${isPast ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-blue-50 cursor-pointer text-gray-700'}
            ${isSelected ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold' : ''}
          `}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  const changeMonth = (offset) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + offset);
    setCurrentMonth(newMonth);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (pets.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🐾</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Chưa có thú cưng</h2>
          <p className="text-gray-600 mb-6">Vui lòng thêm thú cưng trước khi đặt lịch</p>
          <button
            onClick={() => navigate('/pets')}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            Thêm thú cưng
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate('/appointments')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Đặt dịch vụ
              </h1>
              <p className="text-sm text-gray-600">Chọn dịch vụ và đặt lịch hẹn cho thú cưng của bạn</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Select Pet */}
            <div className="bg-white rounded-3xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
                  <span className="text-2xl">🐾</span>
                </div>
                <h2 className="text-xl font-bold text-gray-800">Chọn thú cưng của bạn</h2>
              </div>
              
              <div className="mb-3 text-sm text-gray-600">Thú cưng của bạn</div>
              
              <div className="space-y-2">
                {pets.map(pet => (
                  <div
                    key={pet._id}
                    onClick={() => setSelectedPet(pet)}
                    className={`
                      flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border-2
                      ${selectedPet?._id === pet._id 
                        ? 'bg-blue-50 border-blue-500' 
                        : 'bg-white border-gray-200 hover:border-gray-300'}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <img 
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${pet.name}`}
                        alt={pet.name}
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <p className="font-semibold text-gray-800">{pet.name}</p>
                        <p className="text-xs text-gray-500">{pet.breed}</p>
                      </div>
                    </div>
                    {selectedPet?._id === pet._id && (
                      <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                ))}
              </div>

              {selectedPet && (
                <div className="mt-4 p-3 bg-blue-50 rounded-xl">
                  <p className="text-xs text-blue-600 font-semibold">Đặt cho</p>
                  <p className="text-sm font-bold text-blue-900">{selectedPet.name}</p>
                </div>
              )}
            </div>

            {/* Select Service */}
            <div className="bg-white rounded-3xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center">
                  <span className="text-2xl">✨</span>
                </div>
                <h2 className="text-xl font-bold text-gray-800">Chọn dịch vụ</h2>
              </div>
              
              <div className="space-y-3">
                {services.map(service => (
                  <div
                    key={service.id}
                    onClick={() => setSelectedService(service)}
                    className={`
                      flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border-2
                      ${selectedService?.id === service.id 
                        ? 'border-purple-500 shadow-md' 
                        : 'border-transparent hover:border-purple-200'}
                    `}
                  >
                    <div className={`w-12 h-12 ${service.color} rounded-xl flex items-center justify-center text-2xl flex-shrink-0`}>
                      {service.icon}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-800 text-sm">{service.name}</p>
                      <p className="text-xs text-gray-600">{service.description}</p>
                    </div>
                    {selectedService?.id === service.id && (
                      <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Calendar */}
            <div className="bg-white rounded-3xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-800">Chọn ngày</h2>
              </div>

              <div className="flex items-center justify-between mb-4">
                <button onClick={() => changeMonth(-1)} className="p-1 hover:bg-gray-100 rounded">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h3 className="text-base font-bold text-gray-800">
                  {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h3>
                <button onClick={() => changeMonth(1)} className="p-1 hover:bg-gray-100 rounded">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                  <div key={day} className="text-center text-xs font-semibold text-gray-500 py-1">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {renderCalendar()}
              </div>
            </div>

            {/* Time Slots */}
            {selectedDate && selectedService && (
              <div className="bg-white rounded-3xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Các khung giờ trống</h3>
                <p className="text-sm text-gray-600 mb-4">{selectedService.name}</p>
                
                {loadingSlots ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : availableSlots.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    {availableSlots.map(slot => (
                      <button
                        key={slot}
                        onClick={() => setSelectedSlot(slot)}
                        className={`
                          py-3 px-4 rounded-xl font-semibold text-sm transition-all
                          ${selectedSlot === slot 
                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                        `}
                      >
                        {formatTimeSlot(slot)}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-3xl mb-2">😔</p>
                    <p className="text-sm">Không còn khung giờ trống</p>
                  </div>
                )}
              </div>
            )}

            {/* Submit Button */}
            {selectedPet && selectedService && selectedDate && selectedSlot && (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-lg font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Đang xử lý...' : 'Xác nhận lịch hẹn'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentsCreate;