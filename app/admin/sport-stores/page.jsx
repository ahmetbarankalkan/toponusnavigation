/**
 * Spor Mağazaları Yönetimi Sayfası
 * Admin panelinde spor rotası için mağaza yönetimi
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminProvider, useAdmin } from '@/contexts/AdminContext';
import AdminLayout from '@/components/admin/AdminLayout';
import SportStoreManager from '@/components/admin/SportStoreManager';

function SportStoresPageContent() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const router = useRouter();
  const { selectedPlace } = useAdmin();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('admin_token');

    if (!token) {
      router.push('/admin/login');
      return;
    }

    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
      } else {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        router.push('/admin/login');
      }
    } catch (error) {
      console.error('Auth check error:', error);
      router.push('/admin/login');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-dark mx-auto"></div>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <AdminLayout
      title="Spor Mağazaları Yönetimi"
      description="Spor rotası için mağazaları yönetin. Seçilen mağazalar spor modunda rotanın önünden geçirilir."
    >
      <div className="space-y-6">
        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {selectedPlace ? (
            <SportStoreManager
              selectedPlace={selectedPlace}
              onUpdate={() => {

              }}
            />
          ) : (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🏃</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Yer Seçin
              </h3>
              <p className="text-gray-500">
                Spor mağazalarını yönetmek için yukarıdan bir yer seçin.
              </p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

export default function SportStoresPage() {
  return (
    <AdminProvider>
      <SportStoresPageContent />
    </AdminProvider>
  );
}
