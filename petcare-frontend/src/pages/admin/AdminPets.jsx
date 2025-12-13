import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../components/admin/Adminlayout';
import { petsAPI } from '../../services/api';
import ImageUploadCloudinary from './ImageUploadCloudinary';
import Pagination from '../../components/common/Pagination';
import toast from 'react-hot-toast';

const AdminPets = () => {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    healthy: 0,
    needCare: 0,
    newPets: 0,
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10; // Items per page

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);
  const [activeTab, setActiveTab] = useState('info'); // info, medical, services, appointments

  // Form data
  const [formData, setFormData] = useState({
    name: '',
    species: 'dog',
    breed: '',
    dob: '',
    weight: '',
    gender: 'male',
    photo: '',
  });

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('vi-VN');
  };

  // Fetch pets
  const fetchPets = useCallback(async () => {
    try {
      setLoading(true);
      const response = await petsAPI.getAll();
      console.log('🐾 Pets response:', response.data);

      // Handle different response structures
      let allPetsData = [];
      
      if (response.data) {
        // Check if data has pets array
        if (response.data.data && Array.isArray(response.data.data.pets)) {
          allPetsData = response.data.data.pets;
        } 
        // Check if data.pets exists
        else if (response.data.pets && Array.isArray(response.data.pets)) {
          allPetsData = response.data.pets;
        }
        // Check if data.data is array
        else if (Array.isArray(response.data.data)) {
          allPetsData = response.data.data;
        }
        // Check if response.data is array
        else if (Array.isArray(response.data)) {
          allPetsData = response.data;
        }
      }

      console.log('✅ Processed pets data:', allPetsData);

      // ✅ CLIENT-SIDE PAGINATION: Apply search filter first
      let pets = allPetsData;
      if (searchQuery) {
        pets = allPetsData.filter(pet => 
          pet.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          pet.species?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          pet.breed?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          pet.ownerId?.name?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      // ✅ Calculate pagination based on filtered data
      const totalPagesCalc = Math.ceil(pets.length / limit);
      setTotalPages(totalPagesCalc);

      // ✅ Paginate the filtered data
      const startIndex = (currentPage - 1) * limit;
      const paginatedPets = pets.slice(startIndex, startIndex + limit);

      console.log('📄 Pagination:', {
        total: pets.length,
        currentPage,
        limit,
        totalPages: totalPagesCalc,
        displaying: paginatedPets.length
      });

      setPets(paginatedPets);

      // Calculate stats from ALL pets (not just current page)
      if (allPetsData.length > 0) {
        const healthyPets = allPetsData.filter((p) => p.healthStatus === 'healthy').length;
        const needCarePets = allPetsData.filter((p) => p.healthStatus === 'needCare').length;
        
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const newPets = allPetsData.filter(
          (p) => new Date(p.createdAt) > thirtyDaysAgo
        ).length;

        setStats({
          total: allPetsData.length,
          healthy: healthyPets,
          needCare: needCarePets,
          newPets: newPets,
        });
      } else {
        setStats({
          total: 0,
          healthy: 0,
          needCare: 0,
          newPets: 0,
        });
      }
    } catch (error) {
      console.error('❌ Error fetching pets:', error);
      toast.error('Không thể tải danh sách thú cưng!');
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery, limit]);

  useEffect(() => {
    fetchPets();
  }, [fetchPets]);

  // ✅ Auto-reset to page 1 when search changes
  useEffect(() => {
    if (searchQuery) {
      setCurrentPage(1);
    }
  }, [searchQuery]);

  // Filter pets by search
  // ✅ Filtering now done in fetchPets with pagination

  const resetForm = () => {
    setFormData({
      name: '',
      species: 'dog',
      breed: '',
      dob: '',
      weight: '',
      gender: 'male',
      photo: '',
    });
  };

  const handleOpenAddModal = () => {
    resetForm();
    setActiveTab('info');
    setShowAddModal(true);
  };

  const handleOpenEditModal = (pet) => {
    setSelectedPet(pet);
    setFormData({
      name: pet.name || '',
      species: pet.species || 'dog',
      breed: pet.breed || '',
      dob: pet.dob ? pet.dob.split('T')[0] : '',
      weight: pet.weight || '',
      gender: pet.gender || 'male',
      photo: pet.photo || '',
    });
    setActiveTab('info');
    setShowEditModal(true);
  };

  const handleOpenDeleteModal = (pet) => {
    setSelectedPet(pet);
    setShowDeleteModal(true);
  };

  const handleOpenDetailsModal = (pet) => {
    setSelectedPet(pet);
    setActiveTab('info');
    setShowDetailsModal(true);
  };

  const handleAddPet = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.species) {
      toast.error('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    try {
      const response = await petsAPI.create(formData);
      console.log('✅ Create success:', response.data);
      
      toast.success('✅ Thêm thú cưng thành công!');
      setShowAddModal(false);
      resetForm();
      fetchPets();
    } catch (error) {
      console.error('❌ Error adding pet:', error);
      const errorMsg = error.response?.data?.message || error.message;
      toast.error(errorMsg || 'Thêm thú cưng thất bại!');
    }
  };

  const handleUpdatePet = async (e) => {
    e.preventDefault();

    if (!selectedPet) return;

    if (!formData.name || !formData.species) {
      toast.error('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    try {
      const response = await petsAPI.update(selectedPet._id, formData);
      console.log('✅ Update success:', response.data);
      
      toast.success('✅ Cập nhật thú cưng thành công!');
      setShowEditModal(false);
      setSelectedPet(null);
      resetForm();
      fetchPets();
    } catch (error) {
      console.error('❌ Error updating pet:', error);
      
      // Show specific error message
      const errorMsg = error.response?.data?.message || error.message;
      if (error.response?.status === 404) {
        toast.error('❌ Không tìm thấy thú cưng!');
      } else if (error.response?.status === 401) {
        toast.error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!');
      } else if (error.response?.status === 403) {
        toast.error('Bạn không có quyền chỉnh sửa thú cưng này!');
      } else {
        toast.error(errorMsg || 'Cập nhật thú cưng thất bại!');
      }
    }
  };

  const handleDeletePet = async () => {
    if (!selectedPet) return;

    try {
      await petsAPI.delete(selectedPet._id);
      toast.success('✅ Xóa thú cưng thành công!');
      setShowDeleteModal(false);
      setSelectedPet(null);
      fetchPets();
    } catch (error) {
      console.error('❌ Error deleting pet:', error);
      toast.error(error.response?.data?.message || 'Xóa thú cưng thất bại!');
    }
  };

  const getHealthBadge = (status) => {
    if (status === 'healthy') {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
          Khỏe mạnh
        </span>
      );
    } else if (status === 'needCare') {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
          Cần chú ý
        </span>
      );
    }
    return null;
  };

  if (loading && pets.length === 0) {
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
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Quản Lý Thú Cưng 🐾</h1>
          <p className="text-gray-600">
            Quản lý thông tin sức khỏe và hồ sơ thú cưng
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">🐾</span>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Tổng thú cưng</p>
                <h3 className="text-2xl font-bold text-gray-800">{stats.total}</h3>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">✅</span>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Khỏe mạnh</p>
                <h3 className="text-2xl font-bold text-gray-800">{stats.healthy}</h3>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">⚠️</span>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Cần chú ý</p>
                <h3 className="text-2xl font-bold text-gray-800">{stats.needCare}</h3>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">🆕</span>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Thú cưng mới</p>
                <h3 className="text-2xl font-bold text-gray-800">{stats.newPets}</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Search & Add Button */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">Thú cưng</h2>
            <button
              onClick={handleOpenAddModal}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Thêm Thú Cưng
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, loại thú cưng..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <svg
              className="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Pets Cards */}
        <div className="space-y-4">
          {pets.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-md p-12 text-center">
              <p className="text-gray-500">Không tìm thấy thú cưng nào</p>
            </div>
          ) : (
            pets.map((pet) => (
              <div
                key={pet._id}
                className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start gap-4">
                  {/* Avatar - Show real photo or emoji */}
                  <div className="w-16 h-16 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0 bg-gradient-to-r from-pink-100 to-purple-100">
                    {pet.photo || (pet.photos && pet.photos[0]) ? (
                      <img
                        src={pet.photo || pet.photos[0]}
                        alt={pet.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML = '<span class="text-3xl">🐕</span>';
                        }}
                      />
                    ) : (
                      <span className="text-3xl">{pet.species === 'dog' ? '🐕' : pet.species === 'cat' ? '🐈' : '🐾'}</span>
                    )}
                  </div>

                  {/* Pet Info */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-bold text-gray-800">{pet.name}</h3>
                        <p className="text-sm text-gray-500">{pet.species}</p>
                      </div>
                      <div className="flex gap-2">
                        {getHealthBadge(pet.healthStatus)}
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-500">Loại & Giống</p>
                        <p className="text-sm font-semibold text-gray-800">
                          {pet.breed || pet.species}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Thông số</p>
                        <p className="text-sm font-semibold text-gray-800">
                          Cân nặng: {pet.weight ? `${pet.weight}kg` : 'N/A'}
                          <br />
                          Giới tính: {pet.gender === 'male' ? 'Đực' : pet.gender === 'female' ? 'Cái' : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Ngày sinh</p>
                        <p className="text-sm font-semibold text-gray-800">
                          {formatDate(pet.dob)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Y tế</p>
                        <p className="text-sm font-semibold text-gray-800">
                          {Array.isArray(pet.vaccinations) ? pet.vaccinations.length : 0} mũi tiêm
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Hồ sơ y tế</p>
                        <p className="text-sm font-semibold text-gray-800">
                          {Array.isArray(pet.medicalHistory) ? pet.medicalHistory.length : 0} hồ sơ
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Ngày tạo</p>
                        <p className="text-sm font-semibold text-gray-800">
                          {formatDate(pet.createdAt)}
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleOpenDetailsModal(pet)}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all text-sm font-semibold"
                      >
                        📋 Hồ Sơ Chi Tiết
                      </button>
                      
                      <button
                        onClick={() => handleOpenEditModal(pet)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Chỉnh sửa"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </button>
                      
                      <button
                        onClick={() => handleOpenDeleteModal(pet)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Xóa"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ✅ PAGINATION COMPONENT */}
        {!loading && pets.length > 0 && (
          <div className="mt-6">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      {/* Add Pet Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">Thêm Thú Cưng Mới</h3>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-sm text-gray-600">Nhập thông tin thú cưng để thêm vào hệ thống quản lý</p>
            </div>

            <form onSubmit={handleAddPet} className="p-6 space-y-4">
              {/* Thông tin cơ bản */}
              <div>
                <h4 className="text-sm font-bold text-gray-700 mb-3">Thông tin cơ bản</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Tên thú cưng <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Max, Luna, Charlie..."
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Loại <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.species}
                        onChange={(e) => setFormData({ ...formData, species: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        required
                      >
                        <option value="dog">Chó</option>
                        <option value="cat">Mèo</option>
                        <option value="bird">Chim</option>
                        <option value="other">Khác</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Giống</label>
                      <input
                        type="text"
                        value={formData.breed}
                        onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Golden Retriever, Persian..."
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Ngày sinh</label>
                      <input
                        type="date"
                        value={formData.dob}
                        onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Giới tính</label>
                      <select
                        value={formData.gender}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="male">Đực</option>
                        <option value="female">Cái</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Cân nặng (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="27.5"
                    />
                  </div>

                  {/* Photo Upload */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Ảnh thú cưng</label>
                    <ImageUploadCloudinary
                      value={formData.photo}
                      onChange={(urls) => setFormData({ ...formData, photo: urls[0] || '' })}
                      multiple={false}
                    />
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all"
                >
                  Thêm Thú Cưng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Pet Modal */}
      {showEditModal && selectedPet && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">Chỉnh Sửa Thông Tin Thú Cưng</h3>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedPet(null);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-sm text-gray-600">Cập nhật thông tin thú cưng trong hệ thống</p>
            </div>

            <form onSubmit={handleUpdatePet} className="p-6 space-y-4">
              <div>
                <h4 className="text-sm font-bold text-gray-700 mb-3">Thông tin cơ bản</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Tên thú cưng <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Loại <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.species}
                        onChange={(e) => setFormData({ ...formData, species: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        required
                      >
                        <option value="dog">Chó</option>
                        <option value="cat">Mèo</option>
                        <option value="bird">Chim</option>
                        <option value="other">Khác</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Giống</label>
                      <input
                        type="text"
                        value={formData.breed}
                        onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Ngày sinh</label>
                      <input
                        type="date"
                        value={formData.dob}
                        onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Giới tính</label>
                      <select
                        value={formData.gender}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="male">Đực</option>
                        <option value="female">Cái</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Cân nặng (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  {/* Photo Upload */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Ảnh thú cưng</label>
                    <ImageUploadCloudinary
                      value={formData.photo}
                      onChange={(urls) => setFormData({ ...formData, photo: urls[0] || '' })}
                      multiple={false}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedPet(null);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all"
                >
                  Lưu Thay Đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedPet && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-red-600">Xác nhận xóa thú cưng</h3>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedPet(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-6">
              <p className="text-gray-600 mb-2">
                Bạn có chắc chắn muốn xóa thú cưng <strong>{selectedPet.name}</strong>?
              </p>
              <p className="text-sm text-red-600">
                ⚠️ Hành động này không thể hoàn tác và sẽ xóa toàn bộ dữ liệu liên quan.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedPet(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleDeletePet}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
              >
                Xóa thú cưng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pet Details Modal with Tabs */}
      {showDetailsModal && selectedPet && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">Hồ Sơ Chi Tiết - {selectedPet.name}</h3>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedPet(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-sm text-gray-600 mb-4">Thông tin đầy đủ về sức khỏe và dịch vụ đã sử dụng</p>

              {/* Tabs */}
              <div className="flex gap-2 border-b">
                <button
                  onClick={() => setActiveTab('info')}
                  className={`px-4 py-2 font-semibold transition-colors ${
                    activeTab === 'info'
                      ? 'text-purple-600 border-b-2 border-purple-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Thông tin
                </button>
                <button
                  onClick={() => setActiveTab('medical')}
                  className={`px-4 py-2 font-semibold transition-colors ${
                    activeTab === 'medical'
                      ? 'text-purple-600 border-b-2 border-purple-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Y tế
                </button>
                <button
                  onClick={() => setActiveTab('services')}
                  className={`px-4 py-2 font-semibold transition-colors ${
                    activeTab === 'services'
                      ? 'text-purple-600 border-b-2 border-purple-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Dịch vụ
                </button>
                <button
                  onClick={() => setActiveTab('appointments')}
                  className={`px-4 py-2 font-semibold transition-colors ${
                    activeTab === 'appointments'
                      ? 'text-purple-600 border-b-2 border-purple-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Lịch Hẹn
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Info Tab */}
              {activeTab === 'info' && (
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-gray-700 mb-3">Thông tin chi tiết</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Tên thú cưng</p>
                      <p className="font-semibold text-gray-800">{selectedPet.name}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Tuổi</p>
                      <p className="font-semibold text-gray-800">{selectedPet.age || 'N/A'}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Loại</p>
                      <p className="font-semibold text-gray-800">{selectedPet.species}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Giống</p>
                      <p className="font-semibold text-gray-800">{selectedPet.breed || 'N/A'}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Cân nặng</p>
                      <p className="font-semibold text-gray-800">{selectedPet.weight || 'N/A'}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Chiều cao</p>
                      <p className="font-semibold text-gray-800">{selectedPet.height || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Medical Tab */}
              {activeTab === 'medical' && (
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-gray-700 mb-3">Lịch sử y tế</h4>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="font-semibold text-gray-800 mb-2">Lịch sử tiêm chủng</p>
                    <p className="text-sm text-gray-600">
                      Đã tiêm {selectedPet.vaccinations || 0} mũi - Đầy đủ vắc-xin cơ bản
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="font-semibold text-gray-800 mb-2">Khám gần nhất</p>
                    <p className="text-sm text-gray-600">
                      Ngày {formatDate(selectedPet.createdAt)} - Sức khỏe tốt
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="font-semibold text-gray-800 mb-2">Ghi chú y tế</p>
                    <p className="text-sm text-gray-600">
                      Không có vấn đề sức khỏe đặc biệt
                    </p>
                  </div>
                </div>
              )}

              {/* Services Tab */}
              {activeTab === 'services' && (
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-gray-700 mb-3">Dịch vụ đã sử dụng</h4>
                  <div className="space-y-3">
                    <div className="bg-gray-50 rounded-lg p-4 flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-gray-800">Spa & Grooming</p>
                        <p className="text-sm text-gray-600">6 lần</p>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-gray-800">Khám sức khỏe</p>
                        <p className="text-sm text-gray-600">4 lần</p>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-gray-800">Cắt tỉa lông</p>
                        <p className="text-sm text-gray-600">2 lần</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Appointments Tab */}
              {activeTab === 'appointments' && (
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-gray-700 mb-3">Lịch hẹn sắp tới</h4>
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <p className="text-sm text-gray-600">Chưa có lịch hẹn nào</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminPets;