'use client';

import { useState, useEffect } from 'react';
import SuccessNotification from '../SuccessNotification';
import ErrorNotification from '../ErrorNotification';
import ConfirmDialog from '../ConfirmDialog';

export default function ProductCampaign({ room, placeId }) {
  const [campaigns, setCampaigns] = useState([]);
  const [myProducts, setMyProducts] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [campaignToDelete, setCampaignToDelete] = useState(null);

  const [formData, setFormData] = useState({
    productId: '',
    title: '',
    description: '',
    discountPercentage: '',
    discountAmount: '',
    startDate: '',
    endDate: '',
    isActive: true,
  });

  const fetchCampaigns = async () => {
    if (!room?.room_id) return;
    try {
      const response = await fetch(`/api/admin/campaigns?roomId=${room.room_id}&placeId=${placeId}&type=product`);
      const data = await response.json();
      if (data.success) {
        setCampaigns(data.campaigns);
      }
    } catch (error) {
      console.error('Kampanya yükleme hatası:', error);
    }
  };

  const fetchProducts = async () => {
    if (!room?.room_id) return;
    try {
      const response = await fetch(`/api/admin/products?roomId=${room.room_id}&placeId=${placeId}`);
      const data = await response.json();
      if (data.success) {
        setMyProducts(data.products);
      }
    } catch (error) {
      console.error('Ürün yükleme hatası:', error);
    }
  };

  useEffect(() => {
    fetchCampaigns();
    fetchProducts();
  }, [room, placeId]);

  const resetForm = () => {
    setFormData({
      productId: '',
      title: '',
      description: '',
      discountPercentage: '',
      discountAmount: '',
      startDate: '',
      endDate: '',
      isActive: true,
    });
    setShowAddForm(false);
    setEditingCampaign(null);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('admin_token');
      
      const campaignData = {
        title: formData.title,
        description: formData.description,
        type: 'product',
        productId: formData.productId,
        discountPercentage: formData.discountPercentage ? Number(formData.discountPercentage) : undefined,
        discountAmount: formData.discountAmount ? Number(formData.discountAmount) : undefined,
        startDate: formData.startDate,
        endDate: formData.endDate,
        isActive: formData.isActive,
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
        setSuccessMessage(editingCampaign ? 'Ürün kampanyası güncellendi!' : 'Ürün kampanyası eklendi!');
        setShowSuccess(true);
      } else {
        setErrorMessage(`Hata: ${result.error}`);
        setShowError(true);
      }
    } catch (error) {
      setErrorMessage('Kampanya kaydedilirken hata oluştu!');
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
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
        setErrorMessage(result.error || 'Bir hata oluştu');
        setShowError(true);
      }
    } catch (error) {
      setErrorMessage('Silme hatası!');
      setShowError(true);
    } finally {
      setLoading(false);
      setCampaignToDelete(null);
    }
  };

  const handleEdit = (campaign) => {
    setEditingCampaign(campaign);
    setFormData({
      productId: campaign.productId?._id || campaign.productId || '',
      title: campaign.title || '',
      description: campaign.description || '',
      discountPercentage: campaign.discountPercentage?.toString() || '',
      discountAmount: campaign.discountAmount?.toString() || '',
      startDate: campaign.startDate ? new Date(campaign.startDate).toISOString().split('T')[0] : '',
      endDate: campaign.endDate ? new Date(campaign.endDate).toISOString().split('T')[0] : '',
      isActive: campaign.isActive !== false,
    });
    setShowAddForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-50 to-purple-50 border-2 border-purple-100 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="text-4xl">🎁</div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Ürün Kampanyası</h3>
            <p className="text-sm text-gray-600">
              Kataloğunuzdaki ürünler için indirim kampanyaları oluşturun. Bu kampanyalar Keşfet sayfasında öne çıkarılır.
            </p>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-md font-medium text-gray-900">Aktif Kampanyalar ({campaigns.length})</h4>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-purple-600 text-white text-sm font-semibold rounded-lg hover:bg-purple-700 transition-all shadow-md"
          >
            + Kampanya Oluştur
          </button>
        </div>

        {campaigns.length === 0 ? (
          <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <p>Henüz ürün kampanyası oluşturulmamış</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {campaigns.map((campaign) => (
              <div key={campaign._id} className="bg-white border-2 border-purple-100 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-4">
                  <div className="flex items-start gap-4">
                     {campaign.productId?.image && (
                        <img src={campaign.productId.image} className="w-16 h-16 object-cover rounded shadow-sm" alt="Product" />
                     )}
                     <div className="flex-1">
                        <h5 className="font-bold text-gray-900">{campaign.title}</h5>
                        <p className="text-sm text-gray-500">{campaign.productId?.name || 'Seçili Ürün'}</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                           {campaign.discountPercentage && <span className="px-2 py-0.5 bg-red-100 text-red-800 text-xs font-bold rounded">%{campaign.discountPercentage} İndirim</span>}
                           {campaign.discountAmount && <span className="px-2 py-0.5 bg-purple-100 text-purple-800 text-xs font-bold rounded">{campaign.discountAmount} TL İndirim</span>}
                        </div>
                     </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                     <button onClick={() => handleEdit(campaign)} className="flex-1 py-1.5 bg-purple-50 text-purple-700 text-xs font-bold rounded-lg hover:bg-purple-100">Düzenle</button>
                     <button onClick={() => { setCampaignToDelete(campaign); setShowDeleteDialog(true); }} className="flex-1 py-1.5 bg-red-50 text-red-700 text-xs font-bold rounded-lg hover:bg-red-100">Sil</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAddForm && (
        <div className="bg-white p-6 rounded-xl border-2 border-purple-100">
          <div className="flex items-center justify-between mb-4">
            <h5 className="font-bold text-gray-900 text-lg">{editingCampaign ? 'Kampanyayı Düzenle' : 'Yeni Ürün Kampanyası'}</h5>
            <button onClick={resetForm} className="text-gray-500 hover:text-gray-700 text-xl">✕</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kampanya Başlığı *</label>
              <input
                type="text"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
                placeholder="Örn: Hafta Sonu Fırsatı"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ürün Seçin *</label>
              <select
                value={formData.productId}
                onChange={e => setFormData({ ...formData, productId: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Ürün seçin...</option>
                {myProducts.map(p => (
                  <option key={p._id} value={p._id}>{p.name} - {p.price} TL</option>
                ))}
              </select>
              {myProducts.length === 0 && (
                <p className="text-xs text-red-500 mt-1">Önce 'Ürünlerim' sekmesinden ürün eklemelisiniz.</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">İndirim (%)</label>
                <input
                  type="number"
                  value={formData.discountPercentage}
                  onChange={e => setFormData({ ...formData, discountPercentage: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">İndirim Tutarı (TL)</label>
                <input
                  type="number"
                  value={formData.discountAmount}
                  onChange={e => setFormData({ ...formData, discountAmount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <button
                type="submit"
                disabled={loading || !formData.productId}
                className="px-6 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 disabled:bg-gray-400"
              >
                {loading ? 'Kaydediliyor...' : editingCampaign ? 'Güncelle' : 'Kampanya Oluştur'}
              </button>
              <button type="button" onClick={resetForm} className="px-6 py-2 bg-gray-500 text-white font-semibold rounded-lg hover:bg-gray-600 transition-colors">İptal</button>
            </div>
          </form>
        </div>
      )}

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onConfirm={handleDelete}
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
