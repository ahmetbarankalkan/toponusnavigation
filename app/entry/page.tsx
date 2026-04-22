'use client';

import { useRouter } from 'next/navigation';
import './entry.css';

const platforms = [
  {
    id: 'map',
    title: 'Toponus-Map AI',
    description:
      'Interactive indoor mapping and navigation platform for venues of all sizes',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="2"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z"
        />
      </svg>
    ),
    color: 'cyan',
    gradient: 'from-cyan-500 to-blue-500',
    message: 'Welcome to Toponus-Map platform!',
  },
  {
    id: 'kiosk',
    title: 'Toponus-Kiosk',
    description:
      'Self-service wayfinding kiosks with touchscreen interface and real-time directions',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="2"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25"
        />
      </svg>
    ),
    color: 'purple',
    gradient: 'from-purple-500 to-pink-500',
    message: 'Welcome to Toponus Kiosk platform!',
  },
  {
    id: 'emergency',
    title: 'Toponus-Emergency',
    description:
      'Real-time emergency routing system with instant notifications for safe evacuation',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="2"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
        />
      </svg>
    ),
    color: 'red',
    gradient: 'from-red-500 to-orange-500',
    message: 'Welcome to Toponus-Emergency system!',
  },
  {
    id: 'ai',
    title: 'Toponus–Outdoor Mood',
    description:
      'An AI-powered outdoor companion that suggests nature walks, forest routes, and scenic paths based on your mood.',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="2"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
        />
      </svg>
    ),
    color: 'green',
    gradient: 'from-green-500 to-emerald-500',
    message: 'Welcome to Toponus-Map AI platform!',
  },
  {
    id: '3d',
    title: 'Toponus-3D',
    description:
      'Transform your buildings into immersive 3D models with advanced visualization tools',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="2"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9"
        />
      </svg>
    ),
    color: 'orange',
    gradient: 'from-orange-500 to-yellow-500',
    message: 'Welcome to Toponus-3D platform!',
  },
  {
    id: 'converter',
    title: 'Toponus-Converter',
    description:
      'Automatically convert PDF and CAD floor plans into interactive 3D maps',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="2"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
        />
      </svg>
    ),
    color: 'blue',
    gradient: 'from-blue-500 to-indigo-500',
    message: 'Welcome to Toponus-Converter platform!',
  },
];

export default function EntryPage() {
  const router = useRouter();

  const handleCardClick = (platform: typeof platforms[0]) => {
    switch (platform.id) {
      case 'map':
        router.push('/?slug=ankamall');
        break;
      case 'kiosk':
        router.push('/kiosk');
        break;
      case 'emergency':
        router.push('/emergency');
        break;
      default:
        router.push('/development');
        break;
    }
  };

  return (
    <>
      <div className="aurora-bg"></div>

      {/* Header */}
      <header>
        <div className="page-logo-container">
          <span className="page-logo-text">toponus</span>
          <svg className="page-logo-wave" viewBox="0 0 100 14">
            <path d="M 2 10 Q 15 2, 28 10 T 54 10 T 80 10 T 98 10" />
          </svg>
          <span className="page-logo-suffix">| Intelligence of place</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="entry-container">
        <h1 className="entry-title">
          Choose Your <span className="text-cyan-glow">Platform</span>
        </h1>
        <p className="entry-subtitle">
          Select the Toponus solution that best fits your needs
        </p>

        <div className="platforms-grid">
          {platforms.map(platform => (
            <div
              key={platform.id}
              className={`platform-card platform-card-${platform.color}`}
              data-platform={platform.id}
              onClick={() => handleCardClick(platform)}
            >
              <div className={`platform-icon platform-icon-${platform.color}`}>
                {platform.icon}
              </div>
              <h2 className="platform-title">{platform.title}</h2>
              <p className="platform-description">{platform.description}</p>
              <span
                className={`platform-badge platform-badge-${platform.color}`}
              >
                Explore →
              </span>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
