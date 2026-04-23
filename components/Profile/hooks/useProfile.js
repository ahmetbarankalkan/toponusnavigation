import { useState } from 'react';

export function useProfile(user, updateUser) {
  const [editForm, setEditForm] = useState({
    displayName: user?.displayName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    countryCode: user?.countryCode || '+90',
    dateOfBirth: user?.dateOfBirth || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');

  const handleUpdateProfile = async () => {
    setEditLoading(true);
    setEditError('');
    setEditSuccess('');

    try {
      const token = localStorage.getItem('user_token');
      const updates = {};

      // Sadece değiştirilen alanları gönder
      if (editForm.displayName !== user?.displayName) {
        updates.displayName = editForm.displayName;
      }

      if (editForm.phone !== user?.phone) {
        updates.phone = editForm.phone;
      }

      if (editForm.dateOfBirth !== user?.dateOfBirth) {
        updates.dateOfBirth = editForm.dateOfBirth;
      }

      // Şifre değişikliği varsa
      if (editForm.newPassword) {
        if (editForm.newPassword !== editForm.confirmPassword) {
          setEditError('Yeni şifreler eşleşmiyor');
          setEditLoading(false);
          return;
        }
        if (editForm.newPassword.length < 4) {
          setEditError('Şifre en az 4 karakter olmalı');
          setEditLoading(false);
          return;
        }
        updates.currentPassword = editForm.currentPassword;
        updates.newPassword = editForm.newPassword;
      }

      if (Object.keys(updates).length === 0) {
        setEditError('Değişiklik yapılmadı');
        setEditLoading(false);
        return;
      }

      const response = await fetch('/api/user/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      const data = await response.json();

      if (data.success) {
        setEditSuccess('Profil başarıyla güncellendi');
        updateUser(data.user);
        setEditForm({
          ...editForm,
          displayName: data.user.displayName || '',
          phone: data.user.phone || '',
          countryCode: data.user.countryCode || '+90',
          dateOfBirth: data.user.dateOfBirth || '',
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } else {
        setEditError(data.error || 'Güncelleme başarısız');
      }
    } catch (err) {
      setEditError('Sunucuya bağlanılamadı');
    } finally {
      setEditLoading(false);
    }
  };

  return {
    editForm,
    setEditForm,
    editLoading,
    editError,
    editSuccess,
    handleUpdateProfile,
  };
}
