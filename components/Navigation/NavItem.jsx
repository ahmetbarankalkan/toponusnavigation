'use client';

import Link from 'next/link';
import { NavIcons } from './NavIcons';

export default function NavItem({ href, icon, label, isActive, onClick }) {
  const IconComponent = NavIcons[icon];
  const baseClasses =
    'flex flex-col items-center justify-center py-3 px-2 transition-all duration-300 rounded-xl hover:bg-gray-50 hover:scale-105 active:scale-95 min-h-[60px]';
  const iconColor = isActive ? 'text-[#1B3349]' : 'text-gray-400';
  const labelColor = isActive ? 'text-[#1B3349]' : 'text-gray-400';

  const content = (
    <>
      <div className="w-7 h-7 flex items-center justify-center mb-1.5">
        <IconComponent className={iconColor} />
      </div>
      <span
        className={`text-xs font-semibold transition-colors duration-200 text-center ${labelColor}`}
      >
        {label}
      </span>
    </>
  );

  if (onClick) {
    return (
      <button onClick={onClick} className={baseClasses}>
        {content}
      </button>
    );
  }

  return (
    <Link href={href} className={baseClasses}>
      {content}
    </Link>
  );
}
