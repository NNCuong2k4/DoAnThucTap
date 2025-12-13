import React, { useState } from 'react';

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(query);
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tìm kiếm sản phẩm... (VD: thức ăn cho chó, đồ chơi mèo)"
          className="w-full px-6 py-4 pl-14 pr-24 rounded-2xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-all text-gray-700 placeholder-gray-400"
        />
        
        {/* Search Icon */}
        <div className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Clear Button */}
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-20 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        {/* Search Button */}
        <button
          type="submit"
          className="absolute right-2 top-1/2 transform -translate-y-1/2 px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
        >
          Tìm
        </button>
      </div>

      {/* Quick Search Suggestions */}
      <div className="flex flex-wrap gap-2 mt-3">
        <span className="text-sm text-gray-600">Tìm nhanh:</span>
        {['Thức ăn chó', 'Thức ăn mèo', 'Đồ chơi', 'Phụ kiện', 'Vệ sinh'].map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            onClick={() => {
              setQuery(suggestion);
              onSearch(suggestion);
            }}
            className="px-3 py-1 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:border-purple-500 hover:text-purple-600 transition-colors"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </form>
  );
};

export default SearchBar;