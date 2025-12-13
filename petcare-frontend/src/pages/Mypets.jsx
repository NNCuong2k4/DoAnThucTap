import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { petsAPI } from '../services/api';
import Header from '../components/layout/Header';
import toast from 'react-hot-toast';

const MyPets = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    species: 'dog',
    breed: '',
    age: '',
    weight: '',
    gender: 'male',
    color: '',
    microchipId: '',
    notes: '',
  });

  useEffect(() => {
    fetchPets();
  }, []);

  const fetchPets = async () => {
    try {
      setLoading(true);
      const response = await petsAPI.getMyPets();
      console.log('✅ Pets response:', response.data);

      // Handle different response formats
      let petsData = [];
      if (Array.isArray(response.data)) {
        petsData = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        petsData = response.data.data;
      } else if (response.data?.pets && Array.isArray(response.data.pets)) {
        petsData = response.data.pets;
      }
      
      console.log('📦 Parsed pets:', petsData);
      console.log('📊 Count:', petsData.length);
      
      setPets(petsData);
    } catch (error) {
      console.error('❌ Error fetching pets:', error);
      toast.error('Không thể tải danh sách thú cưng!');
      setPets([]); // Ensure empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log(`📝 Input change: ${name} = "${value}"`);
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      console.log('📦 New form data:', newData);
      return newData;
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      species: 'dog',
      breed: '',
      age: '',
      weight: '',
      gender: 'male',
      color: '',
      microchipId: '',
      notes: '',
    });
  };

  const handleAddPet = async (e) => {
    e.preventDefault();
    
    try {
      const petData = {
        ...formData,
        age: Number(formData.age),
        weight: Number(formData.weight),
      };

      await petsAPI.create(petData);
      toast.success('Thêm thú cưng thành công! 🐾');
      
      setShowAddModal(false);
      resetForm();
      fetchPets();
    } catch (error) {
      console.error('❌ Error creating pet:', error);
      const errorMessage = error.response?.data?.message || 'Thêm thú cưng thất bại!';
      toast.error(errorMessage);
    }
  };

  const handleEditPet = async (e) => {
    e.preventDefault();
    
    try {
      const petData = {
        ...formData,
        age: Number(formData.age),
        weight: Number(formData.weight),
      };

      await petsAPI.update(selectedPet._id, petData);
      toast.success('Cập nhật thú cưng thành công! 🐾');
      
      setShowEditModal(false);
      setSelectedPet(null);
      resetForm();
      fetchPets();
    } catch (error) {
      console.error('❌ Error updating pet:', error);
      const errorMessage = error.response?.data?.message || 'Cập nhật thất bại!';
      toast.error(errorMessage);
    }
  };

  const handleDelete = async (petId) => {
    if (!window.confirm('Bạn có chắc muốn xóa thú cưng này?')) {
      return;
    }

    try {
      await petsAPI.delete(petId);
      toast.success('Đã xóa thú cưng!');
      fetchPets();
    } catch (error) {
      console.error('❌ Error deleting pet:', error);
      toast.error('Xóa thất bại!');
    }
  };

  const openEditModal = (pet) => {
    setSelectedPet(pet);
    setFormData({
      name: pet.name || '',
      species: pet.species || 'dog',
      breed: pet.breed || '',
      age: pet.age || '',
      weight: pet.weight || '',
      gender: pet.gender || 'male',
      color: pet.color || '',
      microchipId: pet.microchipId || '',
      notes: pet.notes || '',
    });
    setShowEditModal(true);
  };

  // ⭐ NEW: Navigate to Pet Detail page
  const handleViewDetails = (petId) => {
    navigate(`/pets/${petId}`);
  };

  const getSpeciesIcon = (species) => {
    const icons = {
      dog: '🐕',
      cat: '🐈',
      bird: '🐦',
      rabbit: '🐰',
      hamster: '🐹',
      other: '🐾',
    };
    return icons[species] || '🐾';
  };

  const getGenderIcon = (gender) => {
    return gender === 'male' ? '♂️' : '♀️';
  };

  const PetFormModal = ({ isEdit = false, onSubmit, onClose }) => (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      ></div>
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">
            {isEdit ? 'Chỉnh sửa thú cưng' : 'Thêm thú cưng mới'}
          </h3>
          
          <form onSubmit={onSubmit} className="space-y-4">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tên thú cưng <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="VD: Milo"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Loại <span className="text-red-500">*</span>
                </label>
                <select
                  name="species"
                  value={formData.species}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="dog">🐕 Chó</option>
                  <option value="cat">🐈 Mèo</option>
                  <option value="bird">🐦 Chim</option>
                  <option value="rabbit">🐰 Thỏ</option>
                  <option value="hamster">🐹 Chuột Hamster</option>
                  <option value="other">🐾 Khác</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Giống <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="breed"
                  value={formData.breed}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="VD: Golden Retriever"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Giới tính <span className="text-red-500">*</span>
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="male">♂️ Đực</option>
                  <option value="female">♀️ Cái</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tuổi (năm) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.1"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="VD: 2"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Cân nặng (kg) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.1"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="VD: 25.5"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Màu lông
                </label>
                <input
                  type="text"
                  name="color"
                  value={formData.color}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="VD: Vàng nâu"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Mã chip
                </label>
                <input
                  type="text"
                  name="microchipId"
                  value={formData.microchipId}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="VD: 123456789012345"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Ghi chú
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Thông tin bổ sung về thú cưng..."
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
              >
                {isEdit ? 'Cập nhật' : 'Thêm mới'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      <Header user={user} />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Thú cưng của tôi 🐾</h1>
            <p className="text-gray-600">
              {pets.length > 0 ? `${pets.length} thú cưng` : 'Chưa có thú cưng nào'}
            </p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Thêm thú cưng</span>
          </button>
        </div>

        {/* Pets List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Đang tải...</p>
            </div>
          </div>
        ) : pets.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-32 h-32 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <span className="text-6xl">🐾</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">Chưa có thú cưng</h3>
            <p className="text-gray-500 mb-6">Thêm thú cưng đầu tiên của bạn!</p>
            <button
              onClick={() => {
                resetForm();
                setShowAddModal(true);
              }}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              Thêm thú cưng
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.isArray(pets) && pets.map((pet) => (
              <div
                key={pet._id}
                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all p-6"
              >
                {/* Pet Icon */}
                <div className="flex items-start justify-between mb-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center">
                    <span className="text-4xl">{getSpeciesIcon(pet.species)}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(pet)}
                      className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                      title="Chỉnh sửa"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(pet._id)}
                      className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                      title="Xóa"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Pet Info */}
                <h3 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                  {pet.name}
                  <span className="text-lg">{getGenderIcon(pet.gender)}</span>
                </h3>
                <p className="text-purple-600 font-semibold mb-4">{pet.breed}</p>

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Tuổi:</span>
                    <span>{pet.age} năm</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Cân nặng:</span>
                    <span>{pet.weight} kg</span>
                  </div>
                  {pet.color && (
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">Màu:</span>
                      <span>{pet.color}</span>
                    </div>
                  )}
                  {pet.microchipId && (
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">Chip:</span>
                      <span className="font-mono text-xs">{pet.microchipId}</span>
                    </div>
                  )}
                </div>

                {pet.notes && (
                  <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                    <p className="text-sm text-gray-700">{pet.notes}</p>
                  </div>
                )}

                {/* Actions - ⭐ UPDATED WITH VIEW DETAILS BUTTON */}
                <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                  {/* ⭐ NEW: View Details Button */}
                  <button
                    onClick={() => handleViewDetails(pet._id)}
                    className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Xem chi tiết
                  </button>
                  
                  {/* Existing: Book Appointment Button */}
                  <button
                    onClick={() => {
                      navigate('/appointments', { state: { petId: pet._id } });
                    }}
                    className="w-full px-4 py-2 bg-purple-50 text-purple-600 rounded-lg font-semibold hover:bg-purple-100 transition-colors"
                  >
                    Đặt lịch khám
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <PetFormModal
          isEdit={false}
          onSubmit={handleAddPet}
          onClose={() => {
            setShowAddModal(false);
            resetForm();
          }}
        />
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <PetFormModal
          isEdit={true}
          onSubmit={handleEditPet}
          onClose={() => {
            setShowEditModal(false);
            setSelectedPet(null);
            resetForm();
          }}
        />
      )}
    </div>
  );
};

export default MyPets;