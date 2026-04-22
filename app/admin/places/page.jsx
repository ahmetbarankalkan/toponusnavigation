// master admin tum mekanlara erişiyor.
// place_owner kendi mekanina erişiyor.
// mekan yonetimi sayfası

"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "../../../components/admin/AdminSidebar";
import PlaceContentManager from "../../../components/admin/PlaceContentManager";

export default function AdminPlacesPage() {
  const [activeTab, setActiveTab] = useState("places");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [places, setPlaces] = useState({});
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [editingPlace, setEditingPlace] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [activeSection, setActiveSection] = useState("content"); // "basic" veya "content"
  const [saving, setSaving] = useState(false);
  const [updatingSlug, setUpdatingSlug] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const router = useRouter();

  // Slug otomatik güncelleme fonksiyonu
  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/ğ/g, "g")
      .replace(/ü/g, "u")
      .replace(/ş/g, "s")
      .replace(/ı/g, "i")
      .replace(/ö/g, "o")
      .replace(/ç/g, "c")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim("-");
  };

  // İsim değiştiğinde slug'ı otomatik güncelle
  const handleNameChange = (newName) => {
    const newSlug = generateSlug(newName);
    setEditingPlace({
      ...editingPlace,
      name: newName,
      slug: newSlug,
    });
  };

  // Temel Bilgileri güncelleme API çağrısı
  const updateBasicInfo = async () => {
    if (!editingPlace || !selectedPlace) return;

    setUpdatingSlug(true);
    setSaveMessage("");

    try {
      const token = localStorage.getItem("admin_token");
      const response = await fetch("/api/admin/places/update-basic", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          placeId: selectedPlace.id,
          name: editingPlace.name,
          slug: editingPlace.slug,
          center: editingPlace.center,
          zoom: editingPlace.zoom,
          status: editingPlace.status,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSaveMessage("✅ Kaydedildi!");
        window.scrollTo(0, 0);
        setTimeout(() => {
          setSaveMessage("");
          window.location.reload();
        }, 2000);
      } else {
        setSaveMessage(`❌ ${data.error || "Hata"}`);
        setTimeout(() => setSaveMessage(""), 3000);
      }
    } catch (error) {
      console.error("Güncelleme hatası:", error);
      setSaveMessage("❌ Kaydedilmedi");
      setTimeout(() => setSaveMessage(""), 3000);
    } finally {
      setUpdatingSlug(false);
    }
  };

  // Yeni Mekan Oluşturma
  const handleCreatePlace = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const token = localStorage.getItem("admin_token");
      const response = await fetch("/api/admin/places/create", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editingPlace),
      });
      
      const data = await response.json();
      if (data.success) {
        setSaveMessage("✅ Mekan Oluşturuldu!");
        setTimeout(() => {
          setIsCreating(false);
          window.location.reload();
        }, 2000);
      } else {
        setSaveMessage(`❌ ${data.error}`);
      }
    } catch (error) {
      setSaveMessage("❌ Hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  // Mekan Silme
  const handleDeletePlace = async (placeId) => {
    if (!window.confirm("Bu mekanı ve tüm içeriğini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.")) return;
    
    try {
      const token = localStorage.getItem("admin_token");
      const response = await fetch(`/api/admin/places/delete?placeId=${placeId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      const data = await response.json();
      if (data.success) {
        setSaveMessage("✅ Mekan Silindi!");
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setSaveMessage(`❌ ${data.error}`);
      }
    } catch (error) {
      setSaveMessage("❌ Hata oluştu");
    }
  };
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("admin_token");

      if (!token) {
        router.push("/admin/login");
        return;
      }

      try {
        const response = await fetch("/api/auth/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (response.ok) {
          setUser(data.user);
        } else {
          localStorage.removeItem("admin_token");
          localStorage.removeItem("admin_user");
          router.push("/admin/login");
        }
      } catch (error) {
        console.error("Auth check error:", error);
        router.push("/admin/login");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  // Places yükle
  useEffect(() => {
    if (!user) return;

    const loadPlaces = async () => {
      try {

        const response = await fetch("/api/places");
        const data = await response.json();


        // Place owner ise sadece kendi place'ini göster
        if (user.role === "place_owner") {


          const userPlace = data[user.place_id];


          if (!userPlace) {
            console.error("❌ Bu mekan için bilgi bulunamadı! user.place_id:", user.place_id);
            console.error("❌ Mevcut place ID'leri:", Object.keys(data));
          }

          const filteredPlaces = { [user.place_id]: userPlace };

          setPlaces(filteredPlaces);
          setSelectedPlace(userPlace);
        } else {

          setPlaces(data);
        }
      } catch (error) {
        console.error("❌ Places yüklenemedi:", error);
      }
    };

    loadPlaces();
  }, [user]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mx-auto"></div>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  // User yoksa null döndür
  if (!user) {
    return null;
  }

  // Store owner ise erişim reddet
  if (user.role === "store_owner") {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="flex">
          <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} user={user} />
          <div className="flex-1 ml-64 p-6">
            <div className="bg-brand-light border border-brand-light text-brand-darkest px-6 py-8 rounded-lg">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-8 w-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-brand-darkest mb-2">Mekan Yönetimi</h3>
                  <p className="text-brand-darkest mb-4">
                    Birim sahipleri mekan yönetimi sayfasına erişemez. Bu sayfa sadece mekan sahipleri ve adminler
                    içindir.
                  </p>
                  <div className="bg-brand-light rounded-md p-4 mb-4">
                    <h4 className="font-medium text-brand-darkest mb-2">Birim sahipleri için:</h4>
                    <ul className="text-sm text-brand-darkest space-y-1">
                      <li>
                        • <strong>Birim Yönetimi</strong> sayfasından kendi birimlerini yönetebilirsiniz
                      </li>
                      <li>• Birim bilgilerini güncelleyebilirsiniz</li>
                      <li>• Logo ve header görsellerini yükleyebilirsiniz</li>
                      <li>• İletişim bilgilerini düzenleyebilirsiniz</li>
                    </ul>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => (window.location.href = "/admin/rooms")}
                      className="bg-brand-dark text-white px-4 py-2 rounded-md hover:bg-brand-darkest transition-colors"
                    >
                      Birim Yönetimine Git
                    </button>
                    <button
                      onClick={() => (window.location.href = "/admin")}
                      className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
                    >
                      Ana Sayfaya Dön
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handlePlaceSelect = (placeId) => {
    const place = places[placeId];

    setSelectedPlace(place);
    setEditingPlace(null);
    setActiveSection("basic");
  };

  const handleEditPlace = (place) => {
    setEditingPlace({ ...place });
    setActiveSection("basic");
  };

  const handleSavePlace = async () => {
    // TODO: API endpoint'i ile place güncelleme

    // Şimdilik sadece state güncelle
    setPlaces((prev) => ({
      ...prev,
      [editingPlace.id]: editingPlace,
    }));
    setEditingPlace(null);
    setSelectedPlace(editingPlace);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        {/* Sidebar */}
        <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} user={user} />

        {/* Main Content */}
        <div className="flex-1 ml-64">
          <div className="p-6">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Mekan Yönetimi</h1>
              <p className="text-gray-600">
                {user.role === "admin" ? "Tüm mekanları yönetin" : `${user.placeName} yönetimi`}
              </p>
            </div>

            {/* Content */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-1">
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-lg font-semibold text-gray-900">Mekanlar</h2>
                      <button
                        onClick={() => {
                          setIsCreating(true);
                          setEditingPlace({
                            name: "",
                            slug: "",
                            center: [32.836, 39.951], // Default Ankara
                            zoom: 18,
                            status: "draft"
                          });
                          setSelectedPlace(null);
                        }}
                        className="p-2 bg-brand text-white rounded-full hover:bg-brand-dark transition-colors"
                        title="Yeni Mekan Ekle"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </div>

                    <div className="space-y-3">
                      {Object.entries(places)
                        .filter(([, place]) => !!place)
                        .map(([id, place]) => (
                          <div
                            key={id}
                            className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                              selectedPlace?.id === id
                                ? "border-brand bg-brand-light"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                            onClick={() => {
                              handlePlaceSelect(id);
                              setIsCreating(false);
                            }}
                          >
                            <h3 className="font-medium text-gray-900">{place?.name || "(İsimsiz)"}</h3>
                            <p className="text-sm text-gray-500">ID: {place?.id || id}</p>
                            {user.role === "admin" && (
                              <p className="text-sm text-gray-500">
                                Durum:{" "}
                                <span
                                  className={`px-2 py-1 rounded text-xs ${
                                    place?.status === "published"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-yellow-100 text-yellow-800"
                                  }`}
                                >
                                  {place?.status === "published" ? "Yayında" : "Taslak"}
                                </span>
                              </p>
                            )}
                            <p className="text-sm text-gray-500">Katlar: {Object.keys(place?.floors || {}).length}</p>
                            
                            <div className="flex justify-end space-x-2 mt-2 pt-2 border-t border-gray-100">
                              <a
                                href={`/?slug=${place.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                title="Önizle"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </a>
                              {user.role === "admin" && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeletePlace(id);
                                  }}
                                  className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                                  title="Sil"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>

              {/* Place Management */}
              <div className={user.role === "admin" ? "lg:col-span-3" : "lg:col-span-4"}>
                {isCreating ? (
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Yeni Mekan Oluştur</h2>
                    <form onSubmit={handleCreatePlace} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mekan Adı</label>
                        <input
                          type="text"
                          required
                          value={editingPlace.name}
                          onChange={(e) => handleNameChange(e.target.value)}
                          placeholder="Örn: Ankamall AVM"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Slug (Otomatik)</label>
                        <input
                          type="text"
                          readOnly
                          value={editingPlace.slug}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Boylam</label>
                          <input
                            type="number"
                            step="0.000001"
                            required
                            value={editingPlace.center[0]}
                            onChange={(e) => {
                              const newCenter = [...editingPlace.center];
                              newCenter[0] = parseFloat(e.target.value);
                              setEditingPlace({ ...editingPlace, center: newCenter });
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Enlem</label>
                          <input
                            type="number"
                            step="0.000001"
                            required
                            value={editingPlace.center[1]}
                            onChange={(e) => {
                              const newCenter = [...editingPlace.center];
                              newCenter[1] = parseFloat(e.target.value);
                              setEditingPlace({ ...editingPlace, center: newCenter });
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand"
                          />
                        </div>
                      </div>
                      <div className="flex space-x-3 pt-4">
                        <button
                          type="submit"
                          disabled={saving}
                          className="px-6 py-2 bg-brand text-white rounded-md hover:bg-brand-dark disabled:opacity-50"
                        >
                          {saveMessage || (saving ? "Oluşturuluyor..." : "Mekanı Oluştur")}
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsCreating(false)}
                          className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                        >
                          İptal
                        </button>
                      </div>
                    </form>
                  </div>
                ) : selectedPlace ? (
                  <div className="bg-white rounded-lg shadow-sm">
                    {/* Tab Navigation */}
                    <div className="border-b border-gray-200">
                      <nav className="flex space-x-8 px-6">
                        {user.role === "admin" && (
                          <button
                            onClick={() => setActiveSection("basic")}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${
                              activeSection === "basic"
                                ? "border-brand text-brand-dark"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                            }`}
                          >
                            Temel Bilgiler
                          </button>
                        )}
                        <button
                          onClick={() => setActiveSection("content")}
                          className={`py-4 px-1 border-b-2 font-medium text-sm ${
                            activeSection === "content"
                              ? "border-brand text-brand-dark"
                              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                          }`}
                        >
                          İçerik Yönetimi
                        </button>
                      </nav>
                    </div>

                    {/* Tab Content */}
                    <div className="p-6">
                      {activeSection === "basic" && user.role === "admin" ? (
                        /* Basic Info Tab - Sadece Admin */
                        editingPlace ? (
                          /* Edit Form */
                          <div>
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Mekan Düzenle</h2>

                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Mekan Adı</label>
                                <input
                                  type="text"
                                  value={editingPlace.name}
                                  onChange={(e) => handleNameChange(e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-light0"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                                <input
                                  type="text"
                                  value={editingPlace.slug}
                                  readOnly
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-brand-light text-brand-darkest cursor-not-allowed"
                                  title="Slug otomatik oluşturulur - isim değiştiğinde güncellenir"
                                />
                              </div>

                              {/* Koordinatlar */}
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Boylam (Longitude)</label>
                                  <input
                                    type="number"
                                    step="0.000001"
                                    value={editingPlace.center[0]}
                                    onChange={(e) => {
                                      const newCenter = [...editingPlace.center];
                                      newCenter[0] = parseFloat(e.target.value);
                                      setEditingPlace({ ...editingPlace, center: newCenter });
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-light0"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Enlem (Latitude)</label>
                                  <input
                                    type="number"
                                    step="0.000001"
                                    value={editingPlace.center[1]}
                                    onChange={(e) => {
                                      const newCenter = [...editingPlace.center];
                                      newCenter[1] = parseFloat(e.target.value);
                                      setEditingPlace({ ...editingPlace, center: newCenter });
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-light0"
                                  />
                                </div>
                              </div>

                              {/* Zoom */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Zoom Seviyesi ({editingPlace.zoom})</label>
                                <input
                                  type="range"
                                  min="10"
                                  max="22"
                                  step="0.1"
                                  value={editingPlace.zoom}
                                  onChange={(e) => setEditingPlace({ ...editingPlace, zoom: parseFloat(e.target.value) })}
                                  className="w-full"
                                />
                              </div>

                              {/* Durum - Admin düzenleyebilir, Place Owner sadece görür */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Durum</label>
                                {user.role === "admin" ? (
                                  <select
                                    value={editingPlace.status}
                                    onChange={(e) =>
                                      setEditingPlace({
                                        ...editingPlace,
                                        status: e.target.value,
                                      })
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-light0"
                                  >
                                    <option value="draft">Taslak</option>
                                    <option value="published">Yayında</option>
                                  </select>
                                ) : (
                                  <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700">
                                    <span
                                      className={`px-2 py-1 rounded text-xs ${
                                        editingPlace.status === "published"
                                          ? "bg-green-100 text-green-800"
                                          : "bg-yellow-100 text-yellow-800"
                                      }`}
                                    >
                                      {editingPlace.status === "published" ? "Yayında" : "Taslak"}
                                    </span>
                                    <span className="ml-2 text-xs text-gray-500">(Sadece admin değiştirebilir)</span>
                                  </div>
                                )}
                              </div>

                              <div className="flex space-x-3">
                                <button
                                  onClick={updateBasicInfo}
                                  disabled={updatingSlug}
                                  className={`px-6 py-3 text-white rounded-lg font-medium disabled:opacity-50 transition-all duration-300 ${
                                    saveMessage === "✅ Kaydedildi!"
                                      ? "bg-green-600 scale-105"
                                      : saveMessage?.includes("❌")
                                      ? "bg-red-500 scale-105"
                                      : "bg-green-500 hover:bg-green-600"
                                  }`}
                                >
                                  {saveMessage || (updatingSlug ? "Güncelleniyor..." : "Kaydet")}
                                </button>
                                <button
                                  onClick={() => setEditingPlace(null)}
                                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                                >
                                  İptal
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          /* Place Details */
                          <div>
                            <div className="flex justify-between items-start mb-4">
                              <h2 className="text-lg font-semibold text-gray-900">Mekan Detayları</h2>
                              <div className="flex space-x-2">
                                <a
                                  href={`/?slug=${selectedPlace.slug}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                                >
                                  Önizle
                                </a>
                                <button
                                  onClick={() => handleEditPlace(selectedPlace)}
                                  className="px-4 py-2 bg-brand text-white rounded hover:bg-brand-dark"
                                >
                                  Düzenle
                                </button>
                              </div>
                            </div>

                            <div className="space-y-3">
                              <div>
                                <span className="font-medium text-gray-700">Adı:</span>
                                <span className="ml-2 text-gray-900">{selectedPlace.name}</span>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">ID:</span>
                                <span className="ml-2 text-gray-900">{selectedPlace.id}</span>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">Slug:</span>
                                <span className="ml-2 text-gray-900">{selectedPlace.slug}</span>
                                <span className="ml-2 text-xs bg-brand-light text-brand-darkest px-2 py-1 rounded">
                                  Otomatik
                                </span>
                              </div>
                              {user.role === "admin" && (
                                <div>
                                  <span className="font-medium text-gray-700">Durum:</span>
                                  <span
                                    className={`ml-2 px-2 py-1 rounded text-xs ${
                                      selectedPlace.status === "published"
                                        ? "bg-green-100 text-green-800"
                                        : "bg-yellow-100 text-yellow-800"
                                    }`}
                                  >
                                    {selectedPlace.status === "published" ? "Yayında" : "Taslak"}
                                  </span>
                                </div>
                              )}
                              <div>
                                <span className="font-medium text-gray-700">Koordinatlar:</span>
                                <span className="ml-2 text-gray-900">[{selectedPlace.center?.join(", ")}]</span>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">Zoom:</span>
                                <span className="ml-2 text-gray-900">{selectedPlace.zoom}</span>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">Katlar:</span>
                                <span className="ml-2 text-gray-900">
                                  {Object.keys(selectedPlace.floors || {}).length} kat
                                </span>
                              </div>
                            </div>
                          </div>
                        )
                      ) : (
                        /* Content Management Tab */
                        <div>
                          <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            {selectedPlace.name} İçerik Yönetimi
                          </h2>
                          <PlaceContentManager placeId={selectedPlace.id} user={user} />
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="text-center py-8">
                      <div className="text-gray-400 text-6xl mb-4">🏢</div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {user.role === "admin" ? "Mekan Seçin" : "Mekan Bulunamadı"}
                      </h3>
                      <p className="text-gray-500 mb-4">
                        {user.role === "admin"
                          ? "Yönetim için sol taraftan bir mekan seçin"
                          : "Bu mekan için bilgi bulunamadı"}
                      </p>
                      {user.role === "place_owner" && (
                        <div className="mt-4 max-w-md mx-auto bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-left">
                          <div className="flex items-start">
                            <svg
                              className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <div>
                              <h4 className="text-sm font-semibold text-yellow-800 mb-2">Olası Sorunlar</h4>
                              <ul className="text-xs text-yellow-700 space-y-1">
                                <li>• Kullanıcı hesabınıza henüz bir mekan atanmamış olabilir</li>
                                <li>• Mekan ID'niz veritabanında mevcut değil olabilir</li>
                                <li>• Mekan "published" durumda olmayabilir</li>
                              </ul>
                              <p className="text-xs text-yellow-700 mt-3">
                                Lütfen sistem yöneticisiyle iletişime geçin ve kullanıcı ID'niz:{" "}
                                <code className="bg-yellow-100 px-1 py-0.5 rounded">{user.place_id || "YOK"}</code>
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
