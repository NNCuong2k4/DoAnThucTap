import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import Header from '../components/layout/Header';
import { useAuth } from '../contexts/AuthContext';

const PetDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [pet, setPet] = useState(null);
  const [medicalHistory, setMedicalHistory] = useState([]);
  const [vaccinations, setVaccinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info'); // info, medical, vaccinations
  
  // Medical History States
  const [showAddMedical, setShowAddMedical] = useState(false);
  const [editingMedicalId, setEditingMedicalId] = useState(null);
  const [medicalForm, setMedicalForm] = useState({
    date: '',
    description: '',
    veterinarian: '',
    clinic: '',
    diagnosis: '',
    prescription: '',
    followUpDate: '',
    cost: '',
  });

  const token = localStorage.getItem('accessToken') || '';
  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

  useEffect(() => {
    loadPetDetail();
    loadMedicalHistory();
    loadVaccinations();
  }, [id]);

  const loadPetDetail = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/pets/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPet(response.data.pet);
      setLoading(false);
    } catch (error) {
      console.error('Load pet failed:', error);
      toast.error('Không thể tải thông tin thú cưng');
      navigate('/profile');
    }
  };

  const loadMedicalHistory = async () => {
    try {
      const response = await axios.get(`${API_BASE}/pets/${id}/medical-history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const activeRecords = response.data.medicalHistory.filter((r) => r.isActive !== false);
      setMedicalHistory(activeRecords);
    } catch (error) {
      console.error('Load medical history failed:', error);
    }
  };

  const loadVaccinations = async () => {
    try {
      const response = await axios.get(`${API_BASE}/pets/${id}/vaccinations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVaccinations(response.data.vaccinations || []);
    } catch (error) {
      console.error('Load vaccinations failed:', error);
    }
  };

  const calculateAge = (dob) => {
    if (!dob) return 'Chưa rõ';
    const birthDate = new Date(dob);
    const today = new Date();
    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    if (months < 0) {
      years--;
      months += 12;
    }
    if (years > 0) {
      return `${years} tuổi ${months} tháng`;
    }
    return `${months} tháng`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Chưa rõ';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount || 0);
  };

  const handleAddMedical = async (e) => {
    e.preventDefault();
    try {
      const data = {
        date: medicalForm.date,
        description: medicalForm.description,
        veterinarian: medicalForm.veterinarian,
        clinic: medicalForm.clinic,
        diagnosis: medicalForm.diagnosis ? medicalForm.diagnosis.split(',').map(d => d.trim()) : [],
        prescription: medicalForm.prescription ? medicalForm.prescription.split(',').map(p => p.trim()) : [],
        followUpDate: medicalForm.followUpDate || null,
        cost: medicalForm.cost ? parseFloat(medicalForm.cost) : 0,
      };

      await axios.post(`${API_BASE}/pets/${id}/medical-history`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success('✅ Thêm hồ sơ bệnh án thành công!');
      resetMedicalForm();
      setShowAddMedical(false);
      loadMedicalHistory();
    } catch (error) {
      toast.error('Lỗi: ' + (error.response?.data?.message || 'Không thể thêm hồ sơ'));
    }
  };

  const handleUpdateMedical = async (recordId) => {
    try {
      const data = {
        date: medicalForm.date,
        description: medicalForm.description,
        veterinarian: medicalForm.veterinarian,
        clinic: medicalForm.clinic,
        diagnosis: medicalForm.diagnosis ? medicalForm.diagnosis.split(',').map(d => d.trim()) : [],
        prescription: medicalForm.prescription ? medicalForm.prescription.split(',').map(p => p.trim()) : [],
        followUpDate: medicalForm.followUpDate || null,
        cost: medicalForm.cost ? parseFloat(medicalForm.cost) : 0,
      };

      await axios.put(`${API_BASE}/pets/${id}/medical-history/${recordId}`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success('✅ Cập nhật hồ sơ bệnh án thành công!');
      resetMedicalForm();
      setEditingMedicalId(null);
      loadMedicalHistory();
    } catch (error) {
      toast.error('Lỗi: ' + (error.response?.data?.message || 'Không thể cập nhật hồ sơ'));
    }
  };

  const handleDeleteMedical = async (recordId) => {
    if (!window.confirm('⚠️ Bạn có chắc muốn xóa hồ sơ bệnh án này?')) return;

    try {
      await axios.delete(`${API_BASE}/pets/${id}/medical-history/${recordId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success('✅ Xóa hồ sơ bệnh án thành công!');
      loadMedicalHistory();
    } catch (error) {
      toast.error('Lỗi: ' + (error.response?.data?.message || 'Không thể xóa hồ sơ'));
    }
  };

  const startEditMedical = (record) => {
    setEditingMedicalId(record._id);
    setMedicalForm({
      date: record.date ? new Date(record.date).toISOString().split('T')[0] : '',
      description: record.description || '',
      veterinarian: record.veterinarian || '',
      clinic: record.clinic || '',
      diagnosis: Array.isArray(record.diagnosis) ? record.diagnosis.join(', ') : '',
      prescription: Array.isArray(record.prescription) ? record.prescription.join(', ') : '',
      followUpDate: record.followUpDate ? new Date(record.followUpDate).toISOString().split('T')[0] : '',
      cost: record.cost || '',
    });
  };

  const resetMedicalForm = () => {
    setMedicalForm({
      date: '',
      description: '',
      veterinarian: '',
      clinic: '',
      diagnosis: '',
      prescription: '',
      followUpDate: '',
      cost: '',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
        <Header user={user} />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">🐾 Đang tải thông tin...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
        <Header user={user} />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-20">
            <div className="text-6xl mb-4">❌</div>
            <h3 className="text-2xl font-bold text-gray-700 mb-4">Không tìm thấy thú cưng</h3>
            <button
              onClick={() => navigate('/profile')}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-xl transition-all"
            >
              ← Quay lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      <Header user={user} />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/profile')}
          className="mb-6 flex items-center gap-2 px-6 py-3 bg-white rounded-xl font-semibold text-gray-700 hover:shadow-lg transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Quay lại danh sách
        </button>

        {/* Pet Header */}
        <div className="bg-white rounded-3xl shadow-lg p-8 mb-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              {pet.photo ? (
                <img
                  src={pet.photo}
                  alt={pet.name}
                  className="w-40 h-40 rounded-full object-cover border-4 border-purple-200 shadow-xl"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div
                className="w-40 h-40 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center border-4 border-purple-200 shadow-xl text-5xl"
                style={{ display: pet.photo ? 'none' : 'flex' }}
              >
                {pet.species === 'dog' ? '🐕' : pet.species === 'cat' ? '🐱' : '🐾'}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                {pet.name}
              </h1>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-4">
                <span className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full font-medium">
                  🐾 {pet.species === 'dog' ? 'Chó' : pet.species === 'cat' ? 'Mèo' : 'Khác'}
                </span>
                <span className={`px-4 py-2 rounded-full font-medium ${
                  pet.gender === 'male' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'
                }`}>
                  {pet.gender === 'male' ? '♂️ Đực' : '♀️ Cái'}
                </span>
                <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full font-medium">
                  🎂 {calculateAge(pet.dob)}
                </span>
                {pet.weight && (
                  <span className="px-4 py-2 bg-orange-100 text-orange-700 rounded-full font-medium">
                    ⚖️ {pet.weight} kg
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-3xl shadow-lg p-2 mb-6">
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setActiveTab('info')}
              className={`py-3 px-4 rounded-2xl font-semibold transition-all ${
                activeTab === 'info'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-purple-50'
              }`}
            >
              📋 Thông tin
            </button>
            <button
              onClick={() => setActiveTab('medical')}
              className={`py-3 px-4 rounded-2xl font-semibold transition-all ${
                activeTab === 'medical'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-purple-50'
              }`}
            >
              🏥 Bệnh án ({medicalHistory.length})
            </button>
            <button
              onClick={() => setActiveTab('vaccinations')}
              className={`py-3 px-4 rounded-2xl font-semibold transition-all ${
                activeTab === 'vaccinations'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-purple-50'
              }`}
            >
              💉 Tiêm phòng ({vaccinations.length})
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-3xl shadow-lg p-8">
          {/* Tab: Thông tin chung */}
          {activeTab === 'info' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Thông tin cơ bản</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-purple-100">
                      <span className="font-semibold text-gray-700">Tên:</span>
                      <span className="text-gray-900">{pet.name}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-purple-100">
                      <span className="font-semibold text-gray-700">Loài:</span>
                      <span className="text-gray-900">
                        {pet.species === 'dog' ? 'Chó' : pet.species === 'cat' ? 'Mèo' : 'Khác'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-purple-100">
                      <span className="font-semibold text-gray-700">Giống:</span>
                      <span className="text-gray-900">{pet.breed}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-purple-100">
                      <span className="font-semibold text-gray-700">Giới tính:</span>
                      <span className="text-gray-900">
                        {pet.gender === 'male' ? 'Đực ♂️' : 'Cái ♀️'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-purple-100">
                      <span className="font-semibold text-gray-700">Ngày sinh:</span>
                      <span className="text-gray-900">{formatDate(pet.dob)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-purple-100">
                      <span className="font-semibold text-gray-700">Tuổi:</span>
                      <span className="text-gray-900">{calculateAge(pet.dob)}</span>
                    </div>
                    {pet.weight && (
                      <div className="flex justify-between items-center py-2">
                        <span className="font-semibold text-gray-700">Cân nặng:</span>
                        <span className="text-gray-900">{pet.weight} kg</span>
                      </div>
                    )}
                  </div>
                </div>

                {pet.notes && (
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Ghi chú</h3>
                    <p className="text-gray-700 leading-relaxed">{pet.notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab: Hồ sơ bệnh án */}
          {activeTab === 'medical' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">🏥 Hồ sơ bệnh án</h2>
                <button
                  onClick={() => {
                    setShowAddMedical(true);
                    resetMedicalForm();
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-xl transition-all"
                >
                  ➕ Thêm hồ sơ mới
                </button>
              </div>

              {/* Add/Edit Form Modal */}
              {(showAddMedical || editingMedicalId) && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                    <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-t-3xl">
                      <h3 className="text-2xl font-bold">
                        {editingMedicalId ? '✏️ Cập nhật hồ sơ bệnh án' : '➕ Thêm hồ sơ bệnh án'}
                      </h3>
                    </div>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        editingMedicalId ? handleUpdateMedical(editingMedicalId) : handleAddMedical(e);
                      }}
                      className="p-6 space-y-4"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-gray-700 font-semibold mb-2">Ngày khám *</label>
                          <input
                            type="date"
                            value={medicalForm.date}
                            onChange={(e) => setMedicalForm({ ...medicalForm, date: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700 font-semibold mb-2">Chi phí (VNĐ)</label>
                          <input
                            type="number"
                            value={medicalForm.cost}
                            onChange={(e) => setMedicalForm({ ...medicalForm, cost: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none"
                            placeholder="0"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-gray-700 font-semibold mb-2">Mô tả *</label>
                        <textarea
                          value={medicalForm.description}
                          onChange={(e) => setMedicalForm({ ...medicalForm, description: e.target.value })}
                          rows={3}
                          required
                          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none"
                          placeholder="Mô tả tình trạng sức khỏe, triệu chứng..."
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-gray-700 font-semibold mb-2">Bác sĩ</label>
                          <input
                            type="text"
                            value={medicalForm.veterinarian}
                            onChange={(e) => setMedicalForm({ ...medicalForm, veterinarian: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none"
                            placeholder="Tên bác sĩ"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700 font-semibold mb-2">Phòng khám</label>
                          <input
                            type="text"
                            value={medicalForm.clinic}
                            onChange={(e) => setMedicalForm({ ...medicalForm, clinic: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none"
                            placeholder="Tên phòng khám"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-gray-700 font-semibold mb-2">Chẩn đoán</label>
                        <input
                          type="text"
                          value={medicalForm.diagnosis}
                          onChange={(e) => setMedicalForm({ ...medicalForm, diagnosis: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none"
                          placeholder="Các chẩn đoán, cách nhau bởi dấu phẩy"
                        />
                        <small className="text-gray-500 text-sm">Ví dụ: Viêm da, Dị ứng thức ăn</small>
                      </div>

                      <div>
                        <label className="block text-gray-700 font-semibold mb-2">Đơn thuốc</label>
                        <input
                          type="text"
                          value={medicalForm.prescription}
                          onChange={(e) => setMedicalForm({ ...medicalForm, prescription: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none"
                          placeholder="Các loại thuốc, cách nhau bởi dấu phẩy"
                        />
                        <small className="text-gray-500 text-sm">Ví dụ: Kháng sinh, Thuốc giảm đau</small>
                      </div>

                      <div>
                        <label className="block text-gray-700 font-semibold mb-2">Ngày tái khám</label>
                        <input
                          type="date"
                          value={medicalForm.followUpDate}
                          onChange={(e) => setMedicalForm({ ...medicalForm, followUpDate: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none"
                        />
                      </div>

                      <div className="flex gap-3 pt-4">
                        <button
                          type="button"
                          onClick={() => {
                            setShowAddMedical(false);
                            setEditingMedicalId(null);
                            resetMedicalForm();
                          }}
                          className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
                        >
                          ✖️ Hủy
                        </button>
                        <button
                          type="submit"
                          className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
                        >
                          {editingMedicalId ? '💾 Cập nhật' : '➕ Thêm'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Medical History List */}
              {medicalHistory.length === 0 ? (
                <div className="text-center py-20">
                  <div className="text-6xl mb-4">📋</div>
                  <h3 className="text-2xl font-bold text-gray-700 mb-2">Chưa có hồ sơ bệnh án nào</h3>
                  <p className="text-gray-500">Thêm hồ sơ đầu tiên để bắt đầu theo dõi</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {medicalHistory
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .map((record) => (
                      <div
                        key={record._id}
                        className="bg-gradient-to-br from-white to-purple-50 rounded-2xl p-6 border-2 border-purple-100 hover:shadow-lg transition-all"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                              <span className="text-2xl">📅</span>
                            </div>
                            <div>
                              <h4 className="font-bold text-purple-700 text-lg">{formatDate(record.date)}</h4>
                              {record.cost > 0 && (
                                <p className="text-sm text-gray-600">💰 {formatCurrency(record.cost)}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => startEditMedical(record)}
                              className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                              title="Sửa"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleDeleteMedical(record._id)}
                              className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                              title="Xóa"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>

                        <p className="text-gray-700 mb-4 bg-white/50 rounded-xl p-4">{record.description}</p>

                        {record.veterinarian && (
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold text-gray-700">👨‍⚕️ Bác sĩ:</span>
                            <span className="text-gray-900">{record.veterinarian}</span>
                          </div>
                        )}

                        {record.clinic && (
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold text-gray-700">🏥 Phòng khám:</span>
                            <span className="text-gray-900">{record.clinic}</span>
                          </div>
                        )}

                        {record.diagnosis && record.diagnosis.length > 0 && (
                          <div className="mb-2">
                            <span className="font-semibold text-gray-700">🔍 Chẩn đoán:</span>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {record.diagnosis.map((d, i) => (
                                <span key={i} className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                                  {d}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {record.prescription && record.prescription.length > 0 && (
                          <div className="mb-2">
                            <span className="font-semibold text-gray-700">💊 Đơn thuốc:</span>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {record.prescription.map((p, i) => (
                                <span key={i} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                                  {p}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {record.followUpDate && (
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-700">📆 Tái khám:</span>
                            <span className="text-pink-600 font-semibold">{formatDate(record.followUpDate)}</span>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* Tab: Tiêm phòng */}
          {activeTab === 'vaccinations' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">💉 Lịch sử tiêm phòng</h2>
              {vaccinations.length === 0 ? (
                <div className="text-center py-20">
                  <div className="text-6xl mb-4">💉</div>
                  <h3 className="text-2xl font-bold text-gray-700 mb-2">Chưa có lịch sử tiêm phòng</h3>
                  <p className="text-gray-500">Thêm thông tin tiêm phòng để theo dõi</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {vaccinations
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .map((vac) => (
                      <div
                        key={vac._id}
                        className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200 hover:shadow-lg transition-all"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-bold text-green-700 text-lg">{vac.name}</h4>
                          <span className="text-2xl">💉</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          📅 Ngày tiêm: {formatDate(vac.date)}
                        </p>
                        {vac.nextDue && (
                          <p className="text-sm text-pink-600 font-semibold">
                            📆 Tiêm lại: {formatDate(vac.nextDue)}
                          </p>
                        )}
                        {vac.notes && (
                          <p className="text-sm text-gray-600 mt-3 bg-white/50 rounded-lg p-3">{vac.notes}</p>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PetDetail;