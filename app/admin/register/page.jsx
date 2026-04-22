"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// --- YENİDEN KULLANILABİLİR BİLEŞENLER ---

// Form alanları için genel bir bileşen (giriş sayfası stiline uyarlandı)
const FormField = ({ id, label, type = "text", value, onChange, placeholder, required = false, rows = 3 }) => (
  <div>
    {/* Etiket görünürlüğü istenirse bu yorum satırı kaldırılabilir */}
    {/* <label htmlFor={id} className="sr-only">
      {label}
    </label> */}
    {type === "textarea" ? (
      <textarea
        id={id}
        name={id}
        required={required}
        rows={rows}
        className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-brand-light0 focus:border-brand focus:z-10 sm:text-sm"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    ) : (
      <input
        id={id}
        name={id}
        type={type}
        required={required}
        className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-brand-light0 focus:border-brand focus:z-10 sm:text-sm"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    )}
  </div>
);

// Hata ve başarı mesajları için genel bir bileşen (giriş sayfası stiline uyarlandı)
const AlertMessage = ({ type, message }) => {
  if (!message) return null;

  const isError = type === "error";
  const bgColor = isError ? "bg-red-50" : "bg-green-50";
  const iconColor = isError ? "text-red-400" : "text-green-400";
  const titleColor = isError ? "text-red-800" : "text-green-800";
  const textColor = isError ? "text-red-700" : "text-green-700";
  const title = isError ? "Kayıt Hatası" : "Başarılı";
  const icon = isError ? "⚠️" : "✓";

  return (
    <div className={`rounded-md p-4 ${bgColor}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <span className={iconColor}>{icon}</span>
        </div>
        <div className="ml-3">
          <h3 className={`text-sm font-medium ${titleColor}`}>{title}</h3>
          <div className={`mt-2 text-sm ${textColor}`}>
            <p>{message}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Kayıt ol butonu için bileşen (giriş sayfası stiline uyarlandı)
const SubmitButton = ({ loading, text = "Kayıt Ol" }) => (
  <button
    type="submit"
    disabled={loading}
    className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-brand-dark hover:bg-brand-darkest focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-light0 disabled:opacity-50 disabled:cursor-not-allowed"
  >
    {loading ? (
      <span className="flex items-center">
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Kayıt yapılıyor...
      </span>
    ) : (
      text
    )}
  </button>
);


// --- ANA SAYFA BİLEŞENİ ---

export default function AdminRegisterPage() {
  const [activeTab, setActiveTab] = useState("place_owner"); // "place_owner" or "store_owner"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const [placeOwnerData, setPlaceOwnerData] = useState({
    username: "", password: "", confirmPassword: "", email: "",
    placeName: "", placeAddress: "", phoneNumber: "",
  });

  // =================================================================
  // YENİ EKLENEN KOD: Tab tuşu ile sekmeler arası geçiş
  // =================================================================
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Eğer Tab tuşuna basıldıysa ve fokus bir input/textarea/button üzerinde değilse
      if (
        e.key === "Tab" &&
        e.target.tagName !== "INPUT" &&
        e.target.tagName !== "TEXTAREA" &&
        e.target.tagName !== "BUTTON"
      ) {
        // Shift+Tab kombinasyonunu şimdilik göz ardı ediyoruz, sadece ileri yönde geçiş
        if (!e.shiftKey) {
          e.preventDefault(); // Sayfadaki diğer elementlere geçişi engelle
          setActiveTab((prevTab) =>
            prevTab === "place_owner" ? "store_owner" : "place_owner"
          );
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    // Component unmount olduğunda event listener'ı temizle
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []); // Boş dependency array, sadece component mount olduğunda çalışmasını sağlar.
  // =================================================================

  const handlePlaceOwnerChange = (e) => {
    setPlaceOwnerData({ ...placeOwnerData, [e.target.name]: e.target.value });
  };

  const handlePlaceOwnerSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (placeOwnerData.password !== placeOwnerData.confirmPassword) {
      setError("Şifreler eşleşmiyor");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: placeOwnerData.username.trim(),
          password: placeOwnerData.password.trim(),
          confirmPassword: placeOwnerData.confirmPassword.trim(),
          email: placeOwnerData.email.trim(),
          placeName: placeOwnerData.placeName.trim(),
          placeAddress: placeOwnerData.placeAddress.trim(),
          phoneNumber: placeOwnerData.phoneNumber.trim(),
          role: "place_owner",
          status: "draft",
        }),
      });
      const data = await response.json();

      if (response.ok) {
        setSuccess("Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz...");
        setTimeout(() => router.push("/admin/login"), 2000);
      } else {
        setError(data.error || "Kayıt başarısız");
      }
    } catch (error) {
      console.error("Register error:", error);
      setError("Bağlantı hatası");
    } finally {
      setLoading(false);
    }
  };

  const formFields = [
    { id: "username", label: "Kullanıcı Adı", placeholder: "Kullanıcı Adı", required: true },
    { id: "email", label: "E-posta", type: "email", placeholder: "E-posta Adresi", required: true },
    { id: "placeName", label: "Mekan Adı", placeholder: "Mekan Adı (Örn: AnkaMall)", required: true },
    { id: "placeAddress", label: "Mekan Adresi", type: "textarea", placeholder: "Mekan Adresi", required: true },
    { id: "phoneNumber", label: "Telefon Numarası", type: "tel", placeholder: "Telefon Numarası", required: true },
    { id: "password", label: "Şifre", type: "password", placeholder: "Şifre", required: true },
    { id: "confirmPassword", label: "Şifre Tekrar", type: "password", placeholder: "Şifre Tekrar", required: true },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-brand-light">
            <span className="text-2xl">📝</span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Yeni Hesap Oluştur</h2>
          <p className="mt-2 text-center text-sm text-gray-600">Signolog Assist Admin Paneli</p>
        </div>

        {/* Tab Buttons */}
        <div className="flex rounded-md shadow-sm">
          <button
            type="button"
            onClick={() => setActiveTab("place_owner")}
            className={`flex-1 py-2 px-4 text-sm font-medium border border-gray-300 rounded-l-md transition-colors duration-150 ${
              activeTab === "place_owner"
                ? "bg-brand-dark text-white z-10 focus:ring-brand-light0 focus:border-brand"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            🏢 Mekan Sahibi
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("store_owner")}
            className={`-ml-px flex-1 py-2 px-4 text-sm font-medium border border-gray-300 rounded-r-md transition-colors duration-150 ${
                activeTab === "store_owner"
                ? "bg-brand-dark text-white z-10 focus:ring-brand-light0 focus:border-brand"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            🏪 Birim Sahibi
          </button>
        </div>

        <AlertMessage type="error" message={error} />
        <AlertMessage type="success" message={success} />

        {/* Formlar */}
        {activeTab === "place_owner" ? (
          <form className="mt-8 space-y-6" onSubmit={handlePlaceOwnerSubmit}>
            <div className="space-y-4">
              {formFields.map(field => (
                <FormField key={field.id} {...field} value={placeOwnerData[field.id]} onChange={handlePlaceOwnerChange} />
              ))}
            </div>
            <div>
                <SubmitButton loading={loading} text="Kayıt Ol"/>
            </div>
          </form>
        ) : (
          <div className="text-center bg-white p-8 rounded-md shadow-sm border border-gray-200">
             <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-gray-100 mb-4">
               <span className="text-4xl">🚧</span>
             </div>
             <h3 className="text-xl font-bold text-gray-800 mb-2">Birim Sahibi Kaydı</h3>
             <p className="text-gray-600 text-sm">
               Bu özellik şu anda geliştirme aşamasındadır. Şimdilik sadece mekan sahibi olarak kayıt olabilirsiniz.
             </p>
          </div>
        )}

         <div className="text-center">
            <button type="button" onClick={() => router.push("/admin/login")} className="inline-flex items-center text-sm font-medium text-brand-dark hover:text-brand-darkest transition-colors">
                Zaten bir hesabın var mı? Giriş Yap
            </button>
        </div>
      </div>
    </div>
  );
}