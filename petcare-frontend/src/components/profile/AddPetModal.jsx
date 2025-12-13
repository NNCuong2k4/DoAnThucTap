import React, { useState } from 'react';
import { petsAPI } from '../../services/api';
import toast from 'react-hot-toast';

const AddPetModal = ({ onClose, onPetAdded }) => {
  const [formData, setFormData] = useState({
    name: '',
    species: 'dog',
    breed: '',
    gender: 'male',
    dob: '',
    weight: '',
    photo: '',
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const speciesOptions = [
    { value: 'dog', label: 'Chó 🐕', icon: '🐕' },
    { value: 'cat', label: 'Mèo 🐱', icon: '🐱' },
    { value: 'bird', label: 'Chim 🐦', icon: '🐦' },
    { value: 'rabbit', label: 'Thỏ 🐰', icon: '🐰' },
    { value: 'hamster', label: 'Chuột Hamster 🐹', icon: '🐹' },
    { value: 'fish', label: 'Cá 🐠', icon: '🐠' },
    { value: 'other', label: 'Khác 🐾', icon: '🐾' },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name || formData.name.trim().length < 2) {
      newErrors.name = 'Tên phải có ít nhất 2 ký tự';
    }

    if (!formData.species) {
      newErrors.species = 'Vui lòng chọn loài';
    }

    if (formData.weight && (isNaN(formData.weight) || Number(formData.weight) <= 0)) {
      newErrors.weight = 'Cân nặng phải là số dương';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Vui lòng kiểm tra lại thông tin!');
      return;
    }

    setLoading(true);

    try {
      // Chuẩn bị data
      const petData = {
        name: formData.name.trim(),
        species: formData.species,
        breed: formData.breed.trim() || undefined,
        gender: formData.gender,
        dob: formData.dob || undefined,
        weight: formData.weight ? Number(formData.weight) : undefined,
        photo: formData.photo.trim() || undefined,
      };

      console.log('📤 Creating pet:', petData);

      const response = await petsAPI.createPet(petData);
      
      console.log('✅ Pet created:', response.data);

      // Backend có thể trả về { pet: {...} } hoặc trực tiếp {...}
      const newPet = response.data.pet || response.data;

      onPetAdded(newPet);

    } catch (error) {
      console.error('❌ Error creating pet:', error);

      const errorMessage = error.response?.data?.message 
        || error.response?.data?.error
        || 'Không thể thêm thú cưng. Vui lòng thử lại!';

      toast.error(errorMessage, {
        icon: '❌',
        duration: 4000,
      });

      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-pink-500 to-purple-600 text-white p-6 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C10.9 2 10 2.9 10 4C10 5.1 10.9 6 12 6C13.1 6 14 5.1 14 4C14 2.9 13.1 2 12 2Z"/>
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold">Thêm thú cưng mới</h2>
                <p className="text-sm text-white/80">Điền thông tin thú cưng của bạn</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-colors"
              disabled={loading}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Name */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Tên thú cưng <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="VD: Max, Luna, Milo..."
              className={`w-full px-4 py-3 rounded-xl border-2 transition-all ${
                errors.name ? 'border-red-500' : 'border-gray-200 focus:border-purple-500'
              } focus:outline-none`}
              disabled={loading}
              required
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Species */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Loài <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {speciesOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFormData({...formData, species: option.value})}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    formData.species === option.value
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                  disabled={loading}
                >
                  <div className="text-2xl mb-1">{option.icon}</div>
                  <div className="text-sm font-medium">{option.label.split(' ')[0]}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Breed & Gender */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Giống</label>
              <input
                type="text"
                name="breed"
                value={formData.breed}
                onChange={handleChange}
                placeholder="VD: Golden Retriever, Scottish Fold..."
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-all"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Giới tính</label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({...formData, gender: 'male'})}
                  className={`flex-1 py-3 rounded-xl border-2 font-medium transition-all ${
                    formData.gender === 'male'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                  disabled={loading}
                >
                  ♂ Đực
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, gender: 'female'})}
                  className={`flex-1 py-3 rounded-xl border-2 font-medium transition-all ${
                    formData.gender === 'female'
                      ? 'border-pink-500 bg-pink-50 text-pink-700'
                      : 'border-gray-200 hover:border-pink-300'
                  }`}
                  disabled={loading}
                >
                  ♀ Cái
                </button>
              </div>
            </div>
          </div>

          {/* DOB & Weight */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Ngày sinh</label>
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-all"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Cân nặng (kg)</label>
              <input
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                placeholder="VD: 5.5"
                step="0.1"
                min="0"
                className={`w-full px-4 py-3 rounded-xl border-2 transition-all ${
                  errors.weight ? 'border-red-500' : 'border-gray-200 focus:border-purple-500'
                } focus:outline-none`}
                disabled={loading}
              />
              {errors.weight && (
                <p className="mt-1 text-sm text-red-600">{errors.weight}</p>
              )}
            </div>
          </div>

          {/* Photo URL */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              URL ảnh (không bắt buộc)
            </label>
            <input
              type="url"
              name="photo"
              value={formData.photo}
              onChange={handleChange}
              placeholder="https://example.com/photo.jpg"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-all"
              disabled={loading}
            />
            <p className="mt-1 text-xs text-gray-500">
              Để trống nếu chưa có ảnh. Icon mặc định sẽ được sử dụng.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
              disabled={loading}
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang thêm...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Thêm thú cưng
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPetModal;