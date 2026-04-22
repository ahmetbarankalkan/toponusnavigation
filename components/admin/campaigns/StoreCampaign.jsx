'use client';

import { useState, useEffect } from 'react';
import ConfirmDialog from '../ConfirmDialog';
import SuccessNotification from '../SuccessNotification';
import ErrorNotification from '../ErrorNotification';

export default function StoreCampaign({ room, placeId, onCampaignUpdate }) {
  const [campaigns, setCampaigns] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null); // This will now be the campaign object
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showError, setShowError] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [campaignToDelete, setCampaignToDelete] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    discountPercentage: '',
    discountAmount: '',
    startDate: '',
    endDate: '',
    image: null,
    isActive: true,
  });

  const fetchCampaigns = async () => {
    if (!room?.room_id) return;
    try {
      const response = await fetch(`/api/admin/campaigns?roomId=${room.room_id}&placeId=${placeId}&type=store`);
      const data = await response.json();
      if (data.success) {
        setCampaigns(data.campaigns);
      }
    } catch (error) {
      console.error('Kampanya yükleme hatası:', error);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, [room, placeId]);

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      discountPercentage: '',
      discountAmount: '',
      startDate: '',
      endDate: '',
      image: null,
      isActive: true,
    });
    setShowAddForm(false);
    setEditingCampaign(null);
  };

  const handleImageUpload = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        try {
          const token = localStorage.getItem('admin_token');
          const response = await fetch('/api/admin/upload', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              type: 'campaigns',
              imageData: reader.result,
              roomId: room.room_id,
            }),
          });
          const data = await response.json();
          if (data.success) {
            resolve(data.path);
          } else {
            reject(data.error);
          }
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setShowConfirmDialog(true);
  };

  const performSave = async () => {
    setShowConfirmDialog(false);
    setLoading(true);

    try {
      const token = localStorage.getItem('admin_token');
      let imagePath = formData.imagePath;

      if (formData.image instanceof File) {
        imagePath = await handleImageUpload(formData.image);
      }

      const campaignData = {
        title: formData.title,
        description: formData.description,
        discountPercentage: formData.discountPercentage ? Number(formData.discountPercentage) : undefined,
        discountAmount: formData.discountAmount ? Number(formData.discountAmount) : undefined,
        startDate: formData.startDate,
        endDate: formData.endDate,
        image: imagePath,
        isActive: formData.isActive,
        type: 'store',
        roomId: room.room_id,
        placeId: placeId,
      };

      const url = '/api/admin/campaigns';
      const method = editingCampaign ? 'PUT' : 'POST';
      
      if (editingCampaign) {
        campaignData.id = editingCampaign._id;
      }

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(campaignData),
      });

      const result = await response.json();

      if (result.success) {
        await fetchCampaigns();
        resetForm();
        setSuccessMessage(editingCampaign ? 'Kampanya güncellendi!' : 'Kampanya eklendi!');
        setShowSuccess(true);
      } else {
        setErrorMessage(`Hata: ${result.error}`);
        setShowError(true);
      }
    } catch (error) {
      console.error('Kampanya kaydetme hatası:', error);
      setErrorMessage('Kampanya kaydedilirken hata oluştu!');
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCampaign = async () => {
    setShowDeleteDialog(false);
    setLoading(true);

    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`/api/admin/campaigns?id=${campaignToDelete._id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (result.success) {
        await fetchCampaigns();
        setSuccessMessage('Kampanya silindi!');
        setShowSuccess(true);
      } else {
        setErrorMessage(`Hata: ${result.error}`);
        setShowError(true);
      }
    } catch (error) {
      setErrorMessage('Kampanya silinirken hata oluştu!');
      setShowError(true);
    } finally {
      setLoading(false);
      setCampaignToDelete(null);
    }
  };

  const handleEditCampaign = (campaign) => {
    setEditingCampaign(campaign);
    setFormData({
      title: campaign.title || '',
      description: campaign.description || '',
      discountPercentage: campaign.discountPercentage?.toString() || '',
      discountAmount: campaign.discountAmount?.toString() || '',
      startDate: campaign.startDate ? new Date(campaign.startDate).toISOString().split('T')[0] : '',
      endDate: campaign.endDate ? new Date(campaign.endDate).toISOString().split('T')[0] : '',
      image: null,
      imagePath: campaign.image,
      isActive: campaign.isActive !== false,
    });
    setShowAddForm(true);
  };

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-brand-light to-brand-light border-2 border-brand-light rounded-xl p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="text-4xl">🏪</div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Mağaza Kampanyası</h3>
            <p className="text-sm text-gray-600">
              Mağazanız için kampanyalar oluşturun. Bu kampanyalar Keşfet sayfasındaki Kampanyalar bölümünde görünür.
            </p>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-md font-medium text-gray-900">
            Kampanyalar ({campaigns.length})
          </h4>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-gradient-to-r from-brand to-brand-dark text-white text-sm font-semibold rounded-lg hover:from-brand-dark hover:to-brand-darkest transition-all shadow-md"
          >
            + Kampanya Ekle
          </button>
        </div>

        {campaigns.length === 0 ? (
          <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <div className="text-4xl mb-2">🎯</div>
            <p>Henüz kampanya eklenmemiş</p>
          </div>
        ) : (
          <div className="space-y-3">
            {campaigns.map((campaign) => (
              <div
                key={campaign._id}
                className={`p-4 border-2 rounded-xl ${
                  campaign.isActive ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h5 className="font-medium text-gray-900">{campaign.title}</h5>
                      <span className={`px-2 py-1 text-xs rounded-full font-semibold ${
                        campaign.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {campaign.isActive ? '✓ Aktif' : 'Pasif'}
                      </span>
                    </div>
                    {campaign.description && <p className="text-sm text-gray-600 mb-2">{campaign.description}</p>}
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      {campaign.discountPercentage && (
                        <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full font-semibold">%{campaign.discountPercentage} İndirim</span>
                      )}
                      {campaign.discountAmount && (
                        <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full font-semibold">{campaign.discountAmount} TL İndirim</span>
                      )}
                      {campaign.startDate && (
                        <span>📅 {new Date(campaign.startDate).toLocaleDateString('tr-TR')}</span>
                      )}
                      {campaign.endDate && (
                        <span>→ {new Date(campaign.endDate).toLocaleDateString('tr-TR')}</span>
                      )}
                    </div>
                    {campaign.image && (
                      <div className="mt-3">
                        <img src={campaign.image} alt={campaign.title} className="w-32 h-20 object-cover rounded-lg border" />
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleEditCampaign(campaign)}
                      className="px-3 py-1.5 bg-brand text-white text-xs font-semibold rounded-lg hover:bg-brand-dark transition-colors"
                    >
                      Düzenle
                    </button>
                    <button
                      onClick={() => { setCampaignToDelete(campaign); setShowDeleteDialog(true); }}
                      className="px-3 py-1.5 bg-red-500 text-white text-xs font-semibold rounded-lg hover:bg-red-600 transition-colors"
                    >
                      Sil
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAddForm && (
        <div className="bg-gradient-to-br from-gray-50 to-brand-light p-6 rounded-xl border-2 border-brand-light">
          <div className="flex items-center justify-between mb-4">
            <h5 className="font-bold text-gray-900 text-lg">
              {editingCampaign ? 'Kampanya Düzenle' : 'Yeni Kampanya Ekle'}
            </h5>
            <button onClick={resetForm} className="text-gray-500 hover:text-gray-700 text-xl">✕</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kampanya Başlığı *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-light0"
                  placeholder="Örn: Yaz İndirimi"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-light0"
                  placeholder="Kampanya detayları"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">İndirim Yüzdesi (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.discountPercentage}
                  onChange={e => setFormData({ ...formData, discountPercentage: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-light0"
                  placeholder="20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sabit İndirim (TL)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.discountAmount}
                  onChange={e => setFormData({ ...formData, discountAmount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-light0"
                  placeholder="50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Başlangıç Tarihi</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-light0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bitiş Tarihi</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-light0"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kampanya Görseli</label>
              <input
                type="file"
                accept="image/*"
                onChange={e => setFormData({ ...formData, image: e.target.files[0] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              {formData.imagePath && !formData.image && (
                 <div className="mt-2">
                    <img src={formData.imagePath} alt="Mevcut" className="w-20 h-20 object-cover rounded border" />
                 </div>
              )}
            </div>

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-4 w-4 text-brand-dark focus:ring-brand-light0 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700 font-medium">Kampanya Aktif</span>
              </label>
            </div>

            <div className="flex gap-2 pt-4">
              <button
                type="submit"
                disabled={loading || !formData.title}
                className="px-6 py-2 bg-gradient-to-r from-brand to-brand-dark text-white font-semibold rounded-lg hover:from-brand-dark hover:to-brand-darkest disabled:from-gray-400 disabled:to-gray-500 transition-all shadow-md"
              >
                {loading ? 'Kaydediliyor...' : editingCampaign ? 'Güncelle' : 'Kampanya Ekle'}
              </button>
              <button type="button" onClick={resetForm} className="px-6 py-2 bg-gray-500 text-white font-semibold rounded-lg hover:bg-gray-600 transition-colors">İptal</button>
            </div>
          </form>
        </div>
      )}

      <ConfirmDialog
        isOpen={showConfirmDialog}
        onConfirm={performSave}
        onCancel={() => setShowConfirmDialog(false)}
        title="Değişiklikleri Kaydet"
        message={editingCampaign ? 'Kampanya güncellensin mi?' : 'Yeni kampanya eklensin mi?'}
        confirmText="Kaydet"
        cancelText="İptal"
        type="success"
      />

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onConfirm={handleDeleteCampaign}
        onCancel={() => { setShowDeleteDialog(false); setCampaignToDelete(null); }}
        title="Kampanyayı Sil"
        message="Bu kampanyayı silmek istediğinizden emin misiniz?"
        confirmText="Sil"
        cancelText="İptal"
        type="danger"
      />

      <SuccessNotification message={successMessage} isVisible={showSuccess} onClose={() => setShowSuccess(false)} />
      <ErrorNotification message={errorMessage} isVisible={showError} onClose={() => setShowError(false)} />
    </div>
  );
}
