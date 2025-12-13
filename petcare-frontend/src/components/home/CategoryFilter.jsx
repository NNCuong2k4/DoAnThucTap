import React from 'react';

const CategoryFilter = ({ categories = [], selectedCategory, onCategoryChange }) => {
  const allCategory = { _id: 'all', name: 'Tất cả', icon: '🏠' };
  
  const categoryIcons = {
    'Thức ăn': '🍖',
    'Đồ chơi': '🎾',
    'Phụ kiện': '🎀',
    'Vệ sinh': '🧼',
    'Y tế': '💊',
    'Quần áo': '👕',
    'Giường nằm': '🛏️',
    'Khác': '📦',
  };

  const getCategoryIcon = (categoryName) => {
    return categoryIcons[categoryName] || '📦';
  };

  // Đảm bảo categories là array
  const validCategories = Array.isArray(categories) ? categories : [];
  const allCategories = [allCategory, ...validCategories];

  return (
    <div className="bg-white rounded-2xl shadow-md p-4">
      <div className="flex items-center gap-2 mb-3">
        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
        <h3 className="font-bold text-gray-800">Danh mục</h3>
      </div>

      <div className="flex flex-wrap gap-2">
        {allCategories.map((category) => {
          const isSelected = selectedCategory === category._id;
          const icon = category.icon || getCategoryIcon(category.name);

          return (
            <button
              key={category._id}
              onClick={() => onCategoryChange(category._id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                isSelected
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg transform scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
              }`}
            >
              <span className="text-lg">{icon}</span>
              <span>{category.name}</span>
              {category.count && (
                <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                  isSelected ? 'bg-white/20' : 'bg-white'
                }`}>
                  {category.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryFilter;