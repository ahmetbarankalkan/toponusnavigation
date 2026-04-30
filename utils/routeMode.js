export function normalizeRouteMode(mode) {
  const raw = String(mode || '').toLowerCase();
  const latinized = raw
    .replace(/ÅŸ/g, 's')
    .replace(/ş/g, 's')
    .replace(/Ä±/g, 'i')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ü/g, 'u')
    .replace(/ç/g, 'c')
    .replace(/ğ/g, 'g')
    .replace(/[^a-z]/g, '');

  if (latinized === 'spor') return 'spor';
  if (latinized === 'kesfet' || latinized === 'kefet') return 'kesfet';
  return 'basit';
}

export function toAdvancedRouteMode(mode) {
  const key = normalizeRouteMode(mode);
  if (key === 'kesfet') return 'ke\u015ffet';
  return key;
}

export function isExploreRouteMode(mode) {
  return normalizeRouteMode(mode) === 'kesfet';
}
