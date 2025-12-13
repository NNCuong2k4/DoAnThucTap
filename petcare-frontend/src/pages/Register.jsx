import React from 'react';
import Logo from '../components/common/Logo';
import FloatingIcons from '../components/common/FloatingIcons';
import RegisterForm from '../components/auth/RegisterForm';

const Register = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Left Side - Image (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12">
        <div className="relative">
          <div className="absolute -top-6 -left-6">
            <div className="w-14 h-14 bg-gradient-to-br from-pink-400 to-purple-500 rounded-2xl shadow-lg flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </div>
          </div>
          
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden w-96 h-96 flex items-center justify-center">
            <img 
              src="https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=400&fit=crop" 
              alt="Cute pet" 
              className="w-full h-full object-cover"
            />
          </div>

          <div className="mt-8 text-center">
            <Logo size="medium" />
            <p className="text-gray-600 mt-3 text-lg">Nơi mọi thú cưng đều được yêu thương ❤️</p>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4">
        <FloatingIcons />
        
        <div className="card-glass max-w-lg w-full relative z-10">
          <div className="text-center mb-6">
            <div className="lg:hidden mb-4">
              <Logo size="large" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Tạo tài khoản
            </h1>
            <p className="text-gray-600 mt-2">Bắt đầu hành trình chăm sóc thú cưng ngay hôm nay</p>
          </div>
          
          <RegisterForm />
        </div>
      </div>
    </div>
  );
};

export default Register;