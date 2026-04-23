'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import { useProfile } from './hooks/useProfile';
import { useSettings } from './hooks/useSettings';
import { useAssistant } from './hooks/useAssistant';

// Components
import AuthForm from './components/AuthForm';
import ProfileMain from './components/ProfileMain';
import ProfileEdit from './components/ProfileEdit';
import LogoutConfirmationModal from '../UI/LogoutConfirmationModal';

// Lazy load other sections to reduce initial bundle
import dynamic from 'next/dynamic';

const StoreHistory = dynamic(() => import('./sections/StoreHistory'), {
  loading: () => <div>Yükleniyor...</div>,
});
const StepsTracker = dynamic(() => import('./sections/StepsTracker'), {
  loading: () => <div>Yükleniyor...</div>,
});
const SettingsPanel = dynamic(() => import('./sections/SettingsPanel'), {
  loading: () => <div>Yükleniyor...</div>,
});
const AssistantSettings = dynamic(() => import('./sections/AssistantSettings'), {
  loading: () => <div>Yükleniyor...</div>,
});

export default function ProfilePanel() {
  const [activeTab, setActiveTab] = useState('signin');
  const [activeSection, setActiveSection] = useState('main');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    countryCode: '+90',
  });

  // URL'den tab parametresini oku ve gereksiz parametreleri temizle
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');

      if (tabParam === 'signup') {
        setActiveTab('signup');
      }

      if (params.has('slug') && !params.get('tab')) {
        // Only strip slug if it's there without any other params and we want a clean URL, 
        // but the user specifically asked for slug persistence, so let's keep it.
        // For now, I'll comment this out to keep the slug.
      }
    }
  }, []);

  // Custom hooks
  const {
    isLoggedIn,
    user,
    loading,
    error,
    setError,
    handleAuth: authHandler,
    handleLogout,
    updateUser,
  } = useAuth();

  const {
    editForm,
    setEditForm,
    editLoading,
    editError,
    editSuccess,
    handleUpdateProfile,
  } = useProfile(user, updateUser);

  const { settings, saveMessage, handleSettingChange } = useSettings();

  const {
    assistantForm,
    setAssistantForm,
    assistantLoading,
    assistantError,
    assistantSuccess,
    handleSaveAssistant,
  } = useAssistant();

  // Update editForm when user changes
  useEffect(() => {
    if (user) {
      setEditForm({
        displayName: user.displayName || '',
        email: user.email || '',
        phone: user.phone || '',
        countryCode: user.countryCode || '+90',
        dateOfBirth: user.dateOfBirth || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    }
  }, [user, setEditForm]);

  // Wrapper for handleAuth to include formData
  const handleAuthWithForm = (e, endpoint) => {
    authHandler(e, endpoint, formData).then(success => {
      if (success) {
        setFormData({ email: '', password: '' });
      }
    });
  };

  const onConfirmLogout = () => {
    handleLogout();
    setActiveSection('main');
    setActiveTab('signin');
    setError('');
    setShowLogoutModal(false);
  };

  // Not logged in - show auth form
  if (!isLoggedIn || !user) {
    return (
      <AuthForm
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        formData={formData}
        setFormData={newData => {
          setFormData(newData);
          setError('');
        }}
        loading={loading}
        error={error}
        handleAuth={handleAuthWithForm}
      />
    );
  }

  // Logged in - show different sections
  return (
    <>
      <LogoutConfirmationModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={onConfirmLogout}
      />
      {(() => {
        switch (activeSection) {
          case 'edit':
            return (
              <ProfileEdit
                editForm={editForm}
                setEditForm={setEditForm}
                editLoading={editLoading}
                editError={editError}
                editSuccess={editSuccess}
                handleUpdateProfile={handleUpdateProfile}
                setActiveSection={setActiveSection}
              />
            );

          case 'history':
            return <StoreHistory setActiveSection={setActiveSection} />;

          case 'steps':
            return <StepsTracker setActiveSection={setActiveSection} />;

          case 'settings':
            return (
              <SettingsPanel
                settings={settings}
                saveMessage={saveMessage}
                handleSettingChange={handleSettingChange}
                setActiveSection={setActiveSection}
              />
            );

          case 'assistant':
            return (
              <AssistantSettings
                assistantForm={assistantForm}
                setAssistantForm={setAssistantForm}
                assistantLoading={assistantLoading}
                assistantError={assistantError}
                assistantSuccess={assistantSuccess}
                handleSaveAssistant={handleSaveAssistant}
                setActiveSection={setActiveSection}
              />
            );

          default:
            return (
              <ProfileMain
                user={user}
                setActiveSection={setActiveSection}
                handleLogout={() => setShowLogoutModal(true)}
              />
            );
        }
      })()}
    </>
  );
}
