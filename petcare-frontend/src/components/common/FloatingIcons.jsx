import React from 'react';

const FloatingIcons = () => {
  const icons = [
    { top: '10%', left: '5%', gradient: 'from-purple-400 to-pink-400', delay: 0 },
    { top: '15%', right: '8%', gradient: 'from-blue-400 to-purple-400', delay: 0.5 },
    { top: '50%', left: '8%', gradient: 'from-pink-400 to-purple-500', delay: 1 },
    { bottom: '15%', left: '12%', gradient: 'from-purple-500 to-blue-500', delay: 1.5 },
    { bottom: '10%', right: '10%', gradient: 'from-blue-400 to-purple-500', delay: 2 },
  ];

  return (
    <>
      {icons.map((icon, index) => (
        <div
          key={index}
          className="absolute hidden lg:flex items-center justify-center"
          style={{
            top: icon.top,
            bottom: icon.bottom,
            left: icon.left,
            right: icon.right,
            animation: `floatAnimation 3s ease-in-out infinite`,
            animationDelay: `${icon.delay}s`,
          }}
        >
          <div className="bg-white rounded-2xl shadow-lg p-4 hover:scale-110 transition-transform duration-300">
            <div className={`w-8 h-8 bg-gradient-to-br ${icon.gradient} rounded-full flex items-center justify-center`}>
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C10.9 2 10 2.9 10 4C10 5.1 10.9 6 12 6C13.1 6 14 5.1 14 4C14 2.9 13.1 2 12 2M6 8C4.9 8 4 8.9 4 10C4 11.1 4.9 12 6 12C7.1 12 8 11.1 8 10C8 8.9 7.1 8 6 8M18 8C16.9 8 16 8.9 16 10C16 11.1 16.9 12 18 12C19.1 12 20 11.1 20 10C20 8.9 19.1 8 18 8Z"/>
              </svg>
            </div>
          </div>
        </div>
      ))}

      <style>{`
        @keyframes floatAnimation {
          0%, 100% { 
            transform: translateY(0px); 
          }
          50% { 
            transform: translateY(-20px); 
          }
        }
      `}</style>
    </>
  );
};

export default FloatingIcons;