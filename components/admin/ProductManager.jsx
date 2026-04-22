'use client';

import { useState, useEffect } from 'react';
import ConfirmDialog from './ConfirmDialog';
import SuccessNotification from './SuccessNotification';
import ErrorNotification from './ErrorNotification';

export default function ProductManager({ room, placeId }) {
  const [products, setProducts] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showError, setShowError] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image: null,
    isActive: true,
  });

  const fetchProducts = async () => {
    if (!room?.room_id) return;
    try {
      const response = await fetch(`/api/admin/products?roomId=${room.room_id}&placeId=${placeId}`);
      const data = await response.json();
      if (data.success) {
        setProducts(data.products);
      }
    } catch (error) {
      console.error('Ürün yükleme hatası:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [room, placeId]);

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      image: null,
      isActive: true,
    });
    setShowAddForm(false);
    setEditingProduct(null);
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
              type: 'products',
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
    setLoading(true);

    try {
      const token = localStorage.getItem('admin_token');
      let imagePath = formData.imagePath;

      if (formData.image instanceof File) {
        imagePath = await handleImageUpload(formData.image);
      }

      const productData = {
        name: formData.name,
        description: formData.description,
        price: formData.price ? Number(formData.price) : undefined,
        category: formData.category,
        image: imagePath,
        isActive: formData.isActive,
        roomId: room.room_id,
        placeId: placeId,
      };

      const url = '/api/admin/products';
      const method = editingProduct ? 'PUT' : 'POST';
      
      if (editingProduct) {
        productData.id = editingProduct._id;
      }

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(productData),
      });

      const result = await response.json();

      if (result.success) {
        await fetchProducts();
        resetForm();
        setSuccessMessage(editingProduct ? 'Ürün güncellendi!' : 'Ürün eklendi!');
        setShowSuccess(true);
      } else {
        setErrorMessage(`Hata: ${result.error}`);
        setShowError(true);
      }
    } catch (error) {
      setErrorMessage('Ürün kaydedilirken hata oluştu!');
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async () => {
    setShowDeleteDialog(false);
    setLoading(true);

    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`/api/admin/products?id=${productToDelete._id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (result.success) {
        await fetchProducts();
        setSuccessMessage('Ürün silindi!');
        setShowSuccess(true);
      } else {
        setErrorMessage(`Hata: ${result.error}`);
        setShowError(true);
      }
    } catch (error) {
      setErrorMessage('Ürün silinirken hata oluştu!');
      setShowError(true);
    } finally {
      setLoading(false);
      setProductToDelete(null);
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      description: product.description || '',
      price: product.price?.toString() || '',
      category: product.category || '',
      image: null,
      imagePath: product.image,
      isActive: product.isActive !== false,
    });
    setShowAddForm(true);
  };

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-blue-50 to-blue-50 border-2 border-blue-100 rounded-xl p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="text-4xl">🛍️</div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Ürün Yönetimi</h3>
            <p className="text-sm text-gray-600">
              Mağazanızın ürün kataloğunu yönetin. Eklediğiniz ürünleri daha sonra kampanyalarda kullanabilirsiniz.
            </p>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-md font-medium text-gray-900">
            Ürünler ({products.length})
          </h4>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-all shadow-md"
          >
            + Ürün Ekle
          </button>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <div className="text-4xl mb-2">📦</div>
            <p>Henüz ürün eklenmemiş</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {products.map((product) => (
              <div
                key={product._id}
                className="bg-white border-2 border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="flex p-4 gap-4">
                  <div className="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0">
                    {product.image ? (
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="font-bold text-gray-900 truncate">{product.name}</h5>
                    <p className="text-sm text-gray-500 line-clamp-1">{product.description}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="font-bold text-blue-600">{product.price} TL</span>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${
                        product.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {product.isActive ? 'Aktif' : 'Pasif'}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleEditProduct(product)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => { setProductToDelete(product); setShowDeleteDialog(true); }}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAddForm && (
        <div className="bg-white p-6 rounded-xl border-2 border-blue-100">
          <div className="flex items-center justify-between mb-4">
            <h5 className="font-bold text-gray-900 text-lg">
              {editingProduct ? 'Ürünü Düzenle' : 'Yeni Ürün Ekle'}
            </h5>
            <button onClick={resetForm} className="text-gray-500 hover:text-gray-700 text-xl">✕</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Ürün Adı *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="Örn: Akıllı Saat"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="Ürün özellikleri..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fiyat (TL)</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={e => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="2499"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="Örn: Elektronik"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ürün Görseli</label>
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
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700 font-medium">Ürün Aktif</span>
              </label>
            </div>

            <div className="flex gap-2 pt-4">
              <button
                type="submit"
                disabled={loading || !formData.name}
                className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-all shadow-md"
              >
                {loading ? 'Kaydediliyor...' : editingProduct ? 'Güncelle' : 'Ürün Ekle'}
              </button>
              <button type="button" onClick={resetForm} className="px-6 py-2 bg-gray-500 text-white font-semibold rounded-lg hover:bg-gray-600 transition-colors">İptal</button>
            </div>
          </form>
        </div>
      )}

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onConfirm={handleDeleteProduct}
        onCancel={() => { setShowDeleteDialog(false); setProductToDelete(null); }}
        title="Ürünü Sil"
        message="Bu ürünü silmek istediğinizden emin misiniz? Bu işlem geri alınamaz."
        confirmText="Sil"
        cancelText="İptal"
        type="danger"
      />

      <SuccessNotification message={successMessage} isVisible={showSuccess} onClose={() => setShowSuccess(false)} />
      <ErrorNotification message={errorMessage} isVisible={showError} onClose={() => setShowError(false)} />
    </div>
  );
}
