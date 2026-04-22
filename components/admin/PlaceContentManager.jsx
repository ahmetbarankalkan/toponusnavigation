"use client";
import { useState, useEffect } from "react";
import ConfirmDialog from "./ConfirmDialog";
import SuccessNotification from "./SuccessNotification";
import ErrorNotification from "./ErrorNotification";

export default function PlaceContentManager({ placeId, user }) {
  const [content, setContent] = useState({
    description: "",
    header_image: "",
    logo: "",
    gallery: [],
    working_hours: {
      monday: { open: "10:00", close: "22:00", closed: false },
      tuesday: { open: "10:00", close: "22:00", closed: false },
      wednesday: { open: "10:00", close: "22:00", closed: false },
      thursday: { open: "10:00", close: "22:00", closed: false },
      friday: { open: "10:00", close: "22:00", closed: false },
      saturday: { open: "10:00", close: "22:00", closed: false },
      sunday: { open: "10:00", close: "22:00", closed: false },
    },
    contact: {
      phone: "",
      email: "",
      website: "",
      address: "",
    },
    amenities: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showError, setShowError] = useState(false);

  const days = [
    { key: "monday", label: "Pazartesi" },
    { key: "tuesday", label: "Salı" },
    { key: "wednesday", label: "Çarşamba" },
    { key: "thursday", label: "Perşembe" },
    { key: "friday", label: "Cuma" },
    { key: "saturday", label: "Cumartesi" },
    { key: "sunday", label: "Pazar" },
  ];

  // Content'i yükle
  const loadContent = async () => {
    try {
      const token = localStorage.getItem("admin_token");
      const response = await fetch(`/api/admin/places/content?placeId=${placeId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.success) {
        setContent(data.content);
      }
    } catch (error) {
      console.error("Content yüklenemedi:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (placeId) {
      loadContent();
    }
  }, [placeId]);

  // Header image seçimi (sadece preview için)
  const handleHeaderUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Dosyayı base64'e çevir (preview için)
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64Image = e.target.result;
      setContent((prev) => ({
        ...prev,
        header_image: base64Image, // Geçici preview için base64
      }));
    };
    reader.readAsDataURL(file);
  };

  // Logo seçimi (sadece preview için)
  const handleLogoUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Dosyayı base64'e çevir (preview için)
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64Image = e.target.result;
      setContent((prev) => ({
        ...prev,
        logo: base64Image, // Geçici preview için base64
      }));
    };
    reader.readAsDataURL(file);
  };

  // Gallery image seçimi ve yükleme (sadece preview için)
  const handleGalleryUpload = (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64Image = e.target.result;
        setContent((prev) => ({
          ...prev,
          gallery: [...prev.gallery, base64Image], // Preview için base64 ekle
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  // Gallery image silme
  const removeGalleryImage = (index) => {
    setContent((prev) => ({
      ...prev,
      gallery: prev.gallery.filter((_, i) => i !== index),
    }));
  };
  const handleSaveClick = () => {
    setShowConfirmDialog(true);
  };

  // Gerçek kaydetme işlemi
  const saveContent = async () => {
    setShowConfirmDialog(false);
    setSaving(true);

    try {
      const token = localStorage.getItem("admin_token");

      // Header image base64 ise önce dosya olarak yükle
      let finalContent = { ...content };

      if (content.header_image && content.header_image.startsWith("data:image/")) {
        console.log("📸 Header image yükleniyor...");

        // Base64'ü blob'a çevir
        const response = await fetch(content.header_image);
        const blob = await response.blob();

        // FormData oluştur
        const formData = new FormData();
        formData.append("file", blob, "header-image.png");
        formData.append("placeId", placeId);

        // Header image'ı yükle
        const uploadResponse = await fetch("/api/admin/places/upload-header", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        const uploadData = await uploadResponse.json();

        if (uploadData.success) {
          console.log("✅ Header image yüklendi");
          finalContent.header_image = uploadData.filePath;
        } else {
          console.log("❌ Header image yüklenemedi:", uploadData.error);
          setErrorMessage(`Header image yüklenemedi: ${uploadData.error}`);
          setShowError(true);
          return;
        }
      }

      // Logo base64 ise önce dosya olarak yükle
      if (content.logo && content.logo.startsWith("data:image/")) {
        console.log("🏢 Logo yükleniyor...");

        // Base64'ü blob'a çevir
        const response = await fetch(content.logo);
        const blob = await response.blob();

        // FormData oluştur
        const formData = new FormData();
        formData.append("file", blob, "logo.png");
        formData.append("placeId", placeId);

        // Logo'yu yükle
        const uploadResponse = await fetch("/api/admin/places/upload-logo", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        const uploadData = await uploadResponse.json();

        if (uploadData.success) {
          console.log("✅ Logo yüklendi");
          finalContent.logo = uploadData.filePath;
        } else {
          console.log("❌ Logo yüklenemedi:", uploadData.error);
          setErrorMessage(`Logo yüklenemedi: ${uploadData.error}`);
          setShowError(true);
          return;
        }
      }

      // Gallery images işlemleri
      const updatedGallery = [];
      for (const item of content.gallery) {
        if (item.startsWith("data:image/")) {
          console.log("🖼️ Gallery image yükleniyor...");
          
          const response = await fetch(item);
          const blob = await response.blob();
          
          const formData = new FormData();
          formData.append("file", blob, `gallery-${Date.now()}.png`);
          formData.append("placeId", placeId);
          
          const uploadResponse = await fetch("/api/admin/places/upload-gallery", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          });
          
          const uploadData = await uploadResponse.json();
          if (uploadData.success) {
            updatedGallery.push(uploadData.filePath);
          }
        } else {
          updatedGallery.push(item);
        }
      }
      finalContent.gallery = updatedGallery;
      const response = await fetch("/api/admin/places/content", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          placeId,
          content: finalContent,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccessMessage("İçerik başarıyla kaydedildi!");
        setShowSuccess(true);
        setTimeout(async () => {
          // Content'i yeniden yükle
          await loadContent();
        }, 2000);
      } else {
        setErrorMessage("İçerik kaydedilmedi");
        setShowError(true);
      }
    } catch (error) {
      console.error("❌ Content kaydedilemedi:", error);
      setErrorMessage("İçerik kaydedilmedi");
      setShowError(true);
    } finally {
      setSaving(false);
    }
  };

  // Working hours güncelle
  const updateWorkingHours = (day, field, value) => {
    setContent((prev) => ({
      ...prev,
      working_hours: {
        ...prev.working_hours,
        [day]: {
          ...prev.working_hours[day],
          [field]: value,
        },
      },
    }));
  };

  // Contact bilgilerini güncelle
  const updateContact = (field, value) => {
    setContent((prev) => ({
      ...prev,
      contact: {
        ...prev.contact,
        [field]: value,
      },
    }));
  };

  // Amenity ekle/çıkar
  const toggleAmenity = (amenity) => {
    setContent((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
        <span className="ml-2">İçerik yükleniyor...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Image */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Header Image</h3>

        {/* Mevcut Header Image */}
        {content.header_image && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Mevcut Header Image</label>
            <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={content.header_image}
                alt="Header"
                className="w-full h-full object-cover"
                onLoad={() => console.log("✅ Header image yüklendi")}
                onError={(e) => {
                  console.log("❌ Header image yüklenemedi");
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "flex";
                }}
              />
              <div className="absolute inset-0 items-center justify-center text-gray-500 hidden">
                <span>Resim yüklenemedi</span>
              </div>
            </div>
          </div>
        )}

        {/* Header Image Önizleme */}
        {content.header_image && content.header_image.startsWith("data:image/") && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Yeni Header Image Önizleme</label>
            <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden border-2 border-blue-300">
              <img src={content.header_image} alt="Header Preview" className="w-full h-full object-cover" />
            </div>
          </div>
        )}

        {/* Header Image Yükleme */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {content.header_image ? "Header Image Değiştir" : "Header Image Yükle"}
          </label>
          <input
            type="file"
            accept=".png,.jpg,.jpeg,.gif,.webp"
            onChange={handleHeaderUpload}
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-light file:text-brand-darkest hover:file:bg-brand-light"
          />
          <p className="text-xs text-gray-500 mt-1">Desteklenen formatlar: PNG, JPG, JPEG, GIF, WEBP</p>
        </div>

        {/* Yükleme Durumu - Artık gerekli değil */}
      </div>

      {/* Logo */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Logo</h3>

        {/* Mevcut Logo */}
        {content.logo && !content.logo.startsWith("data:image/") && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Mevcut Logo</label>
            <div className="relative w-32 h-32 bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={content.logo}
                alt="Logo"
                className="w-full h-full object-contain"
                onLoad={() => console.log("✅ Logo yüklendi")}
                onError={(e) => {
                  console.log("❌ Logo yüklenemedi");
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "flex";
                }}
              />
              <div className="absolute inset-0 items-center justify-center text-gray-500 hidden">
                <span>Logo yüklenemedi</span>
              </div>
            </div>
          </div>
        )}

        {/* Logo Önizleme */}
        {content.logo && content.logo.startsWith("data:image/") && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Yeni Logo Önizleme</label>
            <div className="relative w-32 h-32 bg-gray-100 rounded-lg overflow-hidden border-2 border-blue-300">
              <img src={content.logo} alt="Logo Preview" className="w-full h-full object-contain" />
            </div>
          </div>
        )}

        {/* Logo Yükleme */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {content.logo ? "Logo Değiştir" : "Logo Yükle"}
          </label>
          <input
            type="file"
            accept=".png,.jpg,.jpeg,.gif,.webp,.svg"
            onChange={handleLogoUpload}
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-light file:text-brand-darkest hover:file:bg-brand-light"
          />
          <p className="text-xs text-gray-500 mt-1">Desteklenen formatlar: PNG, JPG, JPEG, GIF, WEBP, SVG</p>
        </div>
      </div>

      {/* Açıklama */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Açıklama</h3>
        <textarea
          value={content.description}
          onChange={(e) => setContent((prev) => ({ ...prev, description: e.target.value }))}
          placeholder="AVM açıklamasını buraya yazın..."
          className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-light0"
        />
      </div>

      {/* Çalışma Saatleri */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Çalışma Saatleri</h3>
        <div className="space-y-3">
          {days.map((day) => (
            <div key={day.key} className="flex items-center space-x-4">
              <div className="w-24 text-sm font-medium">{day.label}</div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={!content.working_hours[day.key].closed}
                  onChange={(e) => updateWorkingHours(day.key, "closed", !e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm">Açık</span>
              </label>
              {!content.working_hours[day.key].closed && (
                <>
                  <input
                    type="time"
                    value={content.working_hours[day.key].open}
                    onChange={(e) => updateWorkingHours(day.key, "open", e.target.value)}
                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                  <span className="text-sm">-</span>
                  <input
                    type="time"
                    value={content.working_hours[day.key].close}
                    onChange={(e) => updateWorkingHours(day.key, "close", e.target.value)}
                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* İletişim Bilgileri */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">İletişim Bilgileri</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
            <input
              type="tel"
              value={content.contact.phone}
              onChange={(e) => updateContact("phone", e.target.value)}
              placeholder="+90 312 123 45 67"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-light0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-posta</label>
            <input
              type="email"
              value={content.contact.email}
              onChange={(e) => updateContact("email", e.target.value)}
              placeholder="info@example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-light0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
            <input
              type="url"
              value={content.contact.website}
              onChange={(e) => updateContact("website", e.target.value)}
              placeholder="https://www.example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-light0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Adres</label>
            <input
              type="text"
              value={content.contact.address}
              onChange={(e) => updateContact("address", e.target.value)}
              placeholder="Tam adres"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-light0"
            />
          </div>
        </div>
      </div>

      {/* Olanaklar */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Olanaklar</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            "Ücretsiz WiFi",
            "Otopark",
            "ATM",
            "Çocuk Oyun Alanı",
            "Restoranlar",
            "Sinema",
            "Eczane",
            "Kuaför",
            "Spor Salonu",
            "Kütüphane",
          ].map((amenity) => (
            <label key={amenity} className="flex items-center">
              <input
                type="checkbox"
                checked={content.amenities.includes(amenity)}
                onChange={() => toggleAmenity(amenity)}
                className="mr-2"
              />
              <span className="text-sm">{amenity}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Galeri */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Galeri</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {content.gallery && content.gallery.map((image, index) => (
            <div key={index} className="relative group aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
              <img src={image} alt={`Gallery ${index}`} className="w-full h-full object-cover" />
              <button
                onClick={() => removeGalleryImage(index)}
                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                title="Sil"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              {image.startsWith("data:image/") && (
                <div className="absolute bottom-0 left-0 right-0 bg-blue-500 text-white text-[10px] text-center py-0.5">
                  Yeni
                </div>
              )}
            </div>
          ))}
          
          {/* Yeni Ekleme Kutusu */}
          <label className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-gray-300 rounded-lg hover:border-brand hover:bg-brand-light cursor-pointer transition-colors">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            <span className="mt-2 text-sm text-gray-500">Resim Ekle</span>
            <input
              type="file"
              accept=".png,.jpg,.jpeg,.gif,.webp"
              multiple
              onChange={handleGalleryUpload}
              className="hidden"
            />
          </label>
        </div>
        <p className="text-xs text-gray-500">Mekana ait iç ve dış fotoğraflar ekleyin. Desteklenen formatlar: PNG, JPG, WEBP</p>
      </div>

      {/* Kaydet Butonu */}
      <div className="flex justify-end">
        <button
          onClick={handleSaveClick}
          disabled={saving}
          className="px-6 py-3 text-white rounded-lg font-medium disabled:opacity-50 transition-all duration-300 bg-brand-dark hover:bg-brand-darkest"
        >
          {saving ? "Kaydediliyor..." : "İçeriği Kaydet"}
        </button>
      </div>

      {/* Onay Dialog'u */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        onConfirm={saveContent}
        onCancel={() => setShowConfirmDialog(false)}
        title="İçeriği Kaydet"
        message="Yaptığınız değişiklikleri kaydetmek istediğinizden emin misiniz?"
        confirmText="Kaydet"
        cancelText="İptal"
        type="success"
      />

      {/* Başarı Notification */}
      <SuccessNotification
        message={successMessage}
        isVisible={showSuccess}
        onClose={() => setShowSuccess(false)}
      />

      {/* Hata Notification */}
      <ErrorNotification
        message={errorMessage}
        isVisible={showError}
        onClose={() => setShowError(false)}
      />
    </div>
  );
}
