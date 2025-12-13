import React from 'react';

const StatCard = ({ title, value, icon, color, trend, bgGradient }) => {
  const gradients = {
    blue: 'from-blue-400 to-blue-500',
    purple: 'from-purple-400 to-purple-500',
    pink: 'from-pink-400 to-pink-500',
    green: 'from-green-400 to-green-500',
    yellow: 'from-yellow-400 to-yellow-500',
    red: 'from-red-400 to-red-500',
  };

  const iconBgs = {
    blue: 'bg-blue-100',
    purple: 'bg-purple-100',
    pink: 'bg-pink-100',
    green: 'bg-green-100',
    yellow: 'bg-yellow-100',
    red: 'bg-red-100',
  };

  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all p-6">
      <div className="flex items-start justify-between mb-4">
        <div
          className={`w-14 h-14 ${iconBgs[color]} rounded-xl flex items-center justify-center`}
        >
          <span className="text-3xl">{icon}</span>
        </div>
        {trend && (
          <div
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-sm font-semibold ${
              trend > 0
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            <span>{trend > 0 ? '↑' : '↓'}</span>
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>

      <div>
        <p className="text-gray-600 text-sm font-medium mb-1">{title}</p>
        <p className="text-3xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
};

export default StatCard;