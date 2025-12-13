import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import UserHeader from '../components/profile/UserHeader';
import TabNavigation from '../components/profile/TabNavigation';
import PersonalInfo from '../components/profile/PersonalInfo';
import PetsTab from '../components/profile/PetsTab';
import SettingsTab from '../components/profile/SettingsTab';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('info');
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate('/home')}
          className="mb-4 flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-md hover:shadow-lg transition-all text-gray-700 hover:text-purple-600"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Quay lại
        </button>

        {/* User Header */}
        <UserHeader />
        
        {/* Tab Navigation */}
        <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
        
        {/* Tab Content */}
        <div className="transition-all duration-300">
          {activeTab === 'info' && <PersonalInfo />}
          {activeTab === 'pets' && <PetsTab />}
          {activeTab === 'settings' && <SettingsTab />}
        </div>
      </div>
    </div>
  );
};

export default Profile;