"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [accessList, setAccessList] = useState([]);
  const [showSelector, setShowSelector] = useState(false);
  const [tempData, setTempData] = useState(null);
  const router = useRouter();

  // Eğer zaten giriş yapmışsa admin paneline yönlendir
  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (token) {
      router.push("/admin");
    }
  }, [router]);

  const handleBranchSelect = (branch) => {
    if (!tempData) return;

    // Seçilen şube bilgilerini user objesine enjekte et
    const finalUser = {
      ...tempData.user,
      place_id: branch.place_id,
      place_name: branch.place_name,
      store_id: branch.store_id,
      store_name: branch.store_name
    };

    localStorage.setItem("admin_token", tempData.token);
    localStorage.setItem("admin_user", JSON.stringify(finalUser));

    // Role'e göre yönlendir
    if (finalUser.role === "store_owner") {
      router.push("/admin/rooms");
    } else {
      router.push("/admin");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setTempData(data);
        
        // Eğer store_owner ise veya birden fazla erişimi varsa seçiciyi göster
        if (data.user.access_list && data.user.access_list.length > 0) {
          setAccessList(data.user.access_list);
          setShowSelector(true);
          setLoading(false);
        } else {
          // Normal admin ise direkt gir
          localStorage.setItem("admin_token", data.token);
          localStorage.setItem("admin_user", JSON.stringify(data.user));
          router.push("/admin");
        }
      } else {
        setError(data.error || "Giriş başarısız");
        setLoading(false);
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Bağlantı hatası");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-brand-light">
            <span className="text-2xl">🔐</span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Admin Panel Girişi</h2>
          <p className="mt-2 text-center text-sm text-gray-600">Signolog Assist Admin Paneli</p>
        </div>

        {showSelector ? (
          <div className="mt-8 space-y-6 animate-in fade-in zoom-in duration-300">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Yönetilecek Şubeyi Seçin</h3>
              <p className="text-sm text-gray-500 mt-1">Erişim yetkiniz olan şubeler aşağıda listelenmiştir.</p>
            </div>
            
            <div className="grid gap-4 max-h-96 overflow-y-auto p-2">
              {accessList.map((branch, idx) => (
                <button
                  key={idx}
                  onClick={() => handleBranchSelect(branch)}
                  className="w-full text-left p-5 bg-white border-2 border-gray-100 rounded-2xl hover:border-brand-dark hover:shadow-md transition-all group flex items-center gap-4"
                >
                  <div className="w-12 h-12 rounded-xl bg-brand-dark/10 flex items-center justify-center text-brand-dark group-hover:bg-brand-dark group-hover:text-white transition-colors">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 21H21M3 7H21M5 7V21M19 7V21M9 7V21M15 7V21M4 3H20C20.5523 3 21 3.44772 21 4V7H3V4C3 3.44772 3.44772 3 4 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-gray-900 text-lg leading-tight">{branch.place_name}</div>
                    <div className="text-xs text-brand-dark font-semibold mt-1 uppercase tracking-wider">{branch.store_name} Şubesi</div>
                  </div>
                  <div className="text-gray-300 group-hover:text-brand-dark transition-colors">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowSelector(false)}
              className="w-full py-3 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors flex items-center justify-center gap-2"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Girişe Dön
            </button>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="username" className="sr-only">
                  Kullanıcı Adı
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-brand-light0 focus:border-brand focus:z-10 sm:text-sm"
                  placeholder="Kullanıcı Adı"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">
                  Şifre
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-brand-light0 focus:border-brand focus:z-10 sm:text-sm"
                  placeholder="Şifre"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <span className="text-red-400">⚠️</span>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Giriş Hatası</h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>{error}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-brand-dark hover:bg-brand-darkest focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-light0 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Giriş yapılıyor...
                  </span>
                ) : (
                  "Giriş Yap"
                )}
              </button>
            </div>

            <div className="text-center">
              <div className="text-sm text-gray-600">
                <p>
                  <strong>Test Hesapları:</strong>
                </p>
                <p>Admin: admin / admin123</p>
                <p>Birim Sahibi: teknosayeni_admin / teknosa123</p>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
