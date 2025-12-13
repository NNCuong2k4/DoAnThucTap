import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // ⭐ ADDED FOR PET DETAIL PAGE
import { useAuth } from '../../contexts/AuthContext';
import { petsAPI } from '../../services/api';
import toast from 'react-hot-toast';
import AddPetModal from './AddPetModal';
import EditPetModal from './EditPetModal';

const PetsTab = () => {
  const { user } = useAuth();
  const navigate = useNavigate(); // ⭐ ADDED FOR PET DETAIL PAGE
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPet, setEditingPet] = useState(null);

  // Fetch pets từ API
  const fetchPets = async () => {
    try {
      setLoading(true);
      console.log('🐾 Fetching pets...');
      
      const response = await petsAPI.getMyPets();
      console.log('✅ Pets fetched:', response.data);
      
      // Backend có thể trả về { pets: [...] } hoặc trực tiếp [...]
      const petsData = response.data.pets || response.data || [];
      setPets(petsData);
      
    } catch (error) {
      console.error('❌ Error fetching pets:', error);
      
      if (error.response?.status === 404) {
        // Không có pets nào
        setPets([]);
      } else {
        toast.error('Không thể tải danh sách thú cưng!', {
          icon: '❌',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPets();
  }, []);

  const handleAddPet = () => {
    setShowAddModal(true);
  };

  const handlePetAdded = (newPet) => {
    setPets([...pets, newPet]);
    setShowAddModal(false);
    toast.success(`Đã thêm ${newPet.name}! 🎉`, {
      icon: '🐾',
    });
  };

  const handleEditPet = (pet) => {
    setEditingPet(pet);
  };

  const handlePetUpdated = (updatedPet) => {
    setPets(pets.map(p => p._id === updatedPet._id ? updatedPet : p));
    setEditingPet(null);
    toast.success(`Đã cập nhật ${updatedPet.name}! ✅`, {
      icon: '✏️',
    });
  };

  const handleDeletePet = async (pet) => {
    if (!window.confirm(`Bạn có chắc muốn xóa ${pet.name}? Hành động này không thể hoàn tác!`)) {
      return;
    }

    try {
      console.log(`🗑️ Deleting pet ${pet._id}...`);
      
      await petsAPI.deletePet(pet._id);
      
      setPets(pets.filter(p => p._id !== pet._id));
      
      toast.success(`Đã xóa ${pet.name}!`, {
        icon: '🗑️',
        duration: 3000,
      });
      
    } catch (error) {
      console.error('❌ Error deleting pet:', error);
      toast.error('Không thể xóa thú cưng. Vui lòng thử lại!', {
        icon: '❌',
      });
    }
  };

  // ⭐ NEW: Navigate to Pet Detail page
  const handleViewDetails = (pet) => {
    navigate(`/pets/${pet._id}`);
  };

  const getSpeciesIcon = (species) => {
    const icons = {
      dog: '🐕',
      cat: '🐱',
      bird: '🦜',
      rabbit: '🐰',
      hamster: '🐹',
      fish: '🐠',
      other: '🐾',
    };
    return icons[species?.toLowerCase()] || '🐾';
  };

  const calculateAge = (dob) => {
    if (!dob) return 'Chưa rõ';
    
    const birthDate = new Date(dob);
    const today = new Date();
    const ageInMonths = (today.getFullYear() - birthDate.getFullYear()) * 12 + 
                        (today.getMonth() - birthDate.getMonth());
    
    if (ageInMonths < 12) {
      return `${ageInMonths} tháng`;
    } else {
      const years = Math.floor(ageInMonths / 12);
      const months = ageInMonths % 12;
      return months > 0 ? `${years} tuổi ${months} tháng` : `${years} tuổi`;
    }
  };

  if (loading) {
    return (
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-lg p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải danh sách thú cưng...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-lg p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-500 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C10.9 2 10 2.9 10 4C10 5.1 10.9 6 12 6C13.1 6 14 5.1 14 4C14 2.9 13.1 2 12 2M6 8C4.9 8 4 8.9 4 10C4 11.1 4.9 12 6 12C7.1 12 8 11.1 8 10C8 8.9 7.1 8 6 8M18 8C16.9 8 16 8.9 16 10C16 11.1 16.9 12 18 12C19.1 12 20 11.1 20 10C20 8.9 19.1 8 18 8Z"/>
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Thú cưng của tôi</h2>
              <p className="text-sm text-gray-600">
                {pets.length === 0 ? 'Chưa có thú cưng nào' : `Quản lý ${pets.length} thú cưng`}
              </p>
            </div>
          </div>

          <button
            onClick={handleAddPet}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="hidden md:inline">Thêm thú cưng</span>
            <span className="md:hidden">Thêm</span>
          </button>
        </div>

        {/* Pets Grid */}
        {pets.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
              <svg className="w-16 h-16 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C10.9 2 10 2.9 10 4C10 5.1 10.9 6 12 6C13.1 6 14 5.1 14 4C14 2.9 13.1 2 12 2M6 8C4.9 8 4 8.9 4 10C4 11.1 4.9 12 6 12C7.1 12 8 11.1 8 10C8 8.9 7.1 8 6 8M18 8C16.9 8 16 8.9 16 10C16 11.1 16.9 12 18 12C19.1 12 20 11.1 20 10C20 8.9 19.1 8 18 8Z"/>
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">Chưa có thú cưng nào</h3>
            <p className="text-gray-500 mb-6">Thêm thú cưng đầu tiên của bạn để bắt đầu quản lý!</p>
            <button
              onClick={handleAddPet}
              className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Thêm thú cưng ngay
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pets.map((pet) => (
              <div
                key={pet._id}
                className="bg-gradient-to-br from-white to-purple-50 rounded-2xl shadow-md hover:shadow-xl transition-all p-6 border-2 border-purple-100"
              >
                {/* Pet Header */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="relative">
                    {pet.photo ? (
                      <img
                        src={pet.photo}
                        alt={pet.name}
                        className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div 
                      className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center border-4 border-white shadow-lg text-3xl"
                      style={{ display: pet.photo ? 'none' : 'flex' }}
                    >
                      {getSpeciesIcon(pet.species)}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-bold text-gray-800 truncate">{pet.name}</h3>
                        <p className="text-sm text-gray-600 truncate">{pet.breed || 'Chưa rõ giống'}</p>
                      </div>
                      <span className={`flex-shrink-0 px-2 py-1 rounded-full text-xs font-medium ${
                        pet.gender === 'male' 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-pink-100 text-pink-700'
                      }`}>
                        {pet.gender === 'male' ? '♂' : '♀'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Pet Info */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <svg className="w-4 h-4 text-purple-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-gray-700 truncate">{calculateAge(pet.dob)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <svg className="w-4 h-4 text-purple-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                    </svg>
                    <span className="text-gray-700 truncate">{pet.weight ? `${pet.weight} kg` : 'Chưa rõ'}</span>
                  </div>
                </div>

                {/* Vaccinations */}
                {pet.vaccinations && pet.vaccinations.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Tiêm phòng ({pet.vaccinations.length})
                    </h4>
                    <div className="space-y-1 max-h-24 overflow-y-auto">
                      {pet.vaccinations.map((vac, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs bg-white/50 rounded-lg px-3 py-2">
                          <span className="font-medium text-gray-700">{vac.name}</span>
                          <span className="text-gray-500">
                            {new Date(vac.date).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t border-purple-100">
                  {/* ⭐ NEW: View Details Button */}
                  <button
                    onClick={() => handleViewDetails(pet)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all font-medium shadow-md hover:shadow-lg"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Chi tiết
                  </button>
                  
                  <button
                    onClick={() => handleEditPet(pet)}
                    className="px-4 py-2.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                    title="Sửa"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  
                  <button
                    onClick={() => handleDeletePet(pet)}
                    className="px-4 py-2.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                    title="Xóa"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddPetModal
          onClose={() => setShowAddModal(false)}
          onPetAdded={handlePetAdded}
        />
      )}

      {editingPet && (
        <EditPetModal
          pet={editingPet}
          onClose={() => setEditingPet(null)}
          onPetUpdated={handlePetUpdated}
        />
      )}
    </>
  );
};

export default PetsTab;