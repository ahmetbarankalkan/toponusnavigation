// components/kiosk/KioskLayout.jsx
'use client';

/**
 * Kiosk arayüzünün dikey ekranlar için tasarlanmış ana yerleşimini sağlar.
 * Bu yapı, haritanın tam ekranı kaplamasına ve kontrol elemanlarının
 * header ve footer olarak üzerine yerleştirilmesine olanak tanır.
 *
 * @param {object} props - Komponent propları
 * @param {React.ReactNode} props.header - Ekranın üst kısmında görünecek başlık bileşeni.
 * @param {React.ReactNode} props.children - Ana içerik alanı, genellikle harita bileşeni.
 * @param {React.ReactNode} props.footer - Ekranın alt kısmında görünecek alt bilgi/kontrol bileşeni.
 */
export default function KioskLayout({ header, children, footer }) {
  return (
    <div className="h-screen w-screen relative flex flex-col bg-gray-100">
      {/* Ana İçerik (Harita Alanı) */}
      <main className="flex-1 h-full w-full">{children}</main>

      {/* Header Alanı (Haritanın Üzerinde) */}
      {header && (
        <header className="absolute top-0 left-0 right-0 z-10 p-4">
          {header}
        </header>
      )}

      {/* Footer Alanı (Haritanın Üzerinde) */}
      {footer && (
        <footer className="absolute bottom-0 left-0 right-0 z-10 p-4">
          {footer}
        </footer>
      )}
    </div>
  );
}
