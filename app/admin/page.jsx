/**
 * Admin Panel Ana Sayfası
 * Basit admin paneli tasarımı
 */
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminDashboard from "../../components/admin/AdminDashboard";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Auth kontrolü
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
          // Token geçersiz, login'e yönlendir
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

  // Loading state
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

  // User yoksa (auth başarısız)
  if (!user) {
    return null; // Router zaten yönlendirdi
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        {/* Sidebar */}
        <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} user={user} />

        {/* Main Content */}
        <div className="flex-1 ml-64">
          <div className="p-6">
            {/* Header */}
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Admin Panel</h1>
                <p className="text-gray-500 mt-1 font-medium text-lg">Sistema yönetim merkezi</p>
              </div>
              
              {user.role === "store_owner" && (
                <div className="relative group animate-in fade-in slide-in-from-right duration-500">
                  <div className="bg-white border-2 border-brand-dark/20 rounded-2xl p-4 shadow-sm flex items-center gap-4 hover:border-brand-dark/40 transition-all cursor-default">
                    <div className="w-12 h-12 rounded-xl bg-brand-dark/10 flex items-center justify-center text-brand-dark">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 21H21M3 7H21M5 7V21M19 7V21M9 7V21M15 7V21M4 3H20C20.5523 3 21 3.44772 21 4V7H3V4C3 3.44772 3.44772 3 4 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                        Yönetilen Şube
                        {user.access_list?.length > 1 && (
                          <span className="bg-brand-primary/10 text-brand-primary px-1.5 py-0.5 rounded-full text-[8px] animate-pulse">Multi-Access</span>
                        )}
                      </div>
                      <div className="text-gray-900 font-bold text-lg flex items-center gap-2">
                        <span className="text-brand-dark">{user.place_name}</span>
                        <span className="text-gray-300">•</span>
                        <span className="text-brand-primary">{user.username.replace('_admin', '').toUpperCase()}</span>
                        {user.access_list?.length > 1 && (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-gray-400 group-hover:text-brand-dark transition-colors">
                            <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Multi-Branch Dropdown (Hidden if only one branch) */}
                  {user.access_list?.length > 1 && (
                    <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                      <div className="p-3 bg-gray-50 border-b border-gray-100">
                        <span className="text-xs font-bold text-gray-500 uppercase">Şube Değiştir</span>
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {user.access_list.map((branch, idx) => (
                          <button 
                            key={idx}
                            className={`w-full p-4 flex items-center gap-3 hover:bg-brand-dark/5 transition-colors border-b border-gray-50 last:border-0 ${branch.place_id === user.place_id ? 'bg-brand-dark/5' : ''}`}
                            onClick={() => {
                              // Professional branch switching logic will go here
                              alert(`${branch.place_name} şubesine geçiş yapılıyor...`);
                            }}
                          >
                            <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-brand-dark text-xs font-bold">
                              {branch.place_name.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="text-left">
                              <div className="text-sm font-bold text-gray-900">{branch.place_name}</div>
                              <div className="text-[10px] text-gray-500 uppercase">{branch.store_name}</div>
                            </div>
                            {branch.place_id === user.place_id && (
                              <div className="ml-auto w-2 h-2 rounded-full bg-green-500"></div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Content */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              {activeTab === "dashboard" && <AdminDashboard />}
              {activeTab === "users" && <div>Kullanıcı Yönetimi</div>}
              {activeTab === "locations" && <div>Lokasyon Yönetimi</div>}
              {activeTab === "analytics" && <div>Analitik</div>}
              {activeTab === "settings" && <div>Ayarlar</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
