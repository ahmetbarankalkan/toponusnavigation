// Custom ok icon'u oluştur
const arrowIcon = `data:image/svg+xml;base64,${btoa(`
      <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <polygon points="12,2 22,12 17,12 17,22 7,22 7,12 2,12" fill="#FFFFFF" stroke="#FFFFFF" stroke-width="2"/>
      </svg>
    `)}`;
// Custom escalator icon'u oluştur (Eski elevatorIcon)
const escalatorIcon = `data:image/svg+xml;base64,${btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 72 72">
      <rect x="2.962" y="0.744" width="66.601" height="64.815" style="fill: rgb(232, 232, 232); stroke: rgb(0, 0, 0);" rx="26.077" ry="26.077"></rect>
      <ellipse style="fill: rgb(0, 0, 0);" cx="36.48" cy="19.899" rx="4.064" ry="4.168"></ellipse>
      <polygon style="fill: rgb(0, 0, 0); stroke: rgb(0, 0, 0);" points="18.224 51.205 28.779 51.205 48.334 32.565 55.166 32.735 55.166 24.821 44.611 24.821 26.138 43.287 18.224 43.287"></polygon>
      <polygon style="fill: rgb(0, 0, 0);" points="31.42 33.223 31.417 24.821 41.973 24.821 31.417 35.373"></polygon>
      <polyline style="fill: rgb(0, 0, 0); stroke: rgb(0, 0, 0);" points="29.058 65.532 36.003 71.485 43.468 65.549"></polyline>
    </svg>
  `)}`;

// Custom elevator icon'u oluştur (Yeni)
const elevatorIcon = `data:image/svg+xml;base64,${btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 72 72">
      <rect x="2.962" y="0.744" width="66.601" height="64.815" style="fill: rgb(232, 232, 232); stroke: rgb(0, 0, 0);" rx="26.077" ry="26.077"></rect>
      <polyline style="fill: rgb(0, 0, 0); stroke: rgb(0, 0, 0);" points="29.058 65.532 36.003 71.485 43.468 65.549"></polyline>
      
      <!-- Person -->
      <circle cx="24" cy="26" r="5" fill="black"/>
      <path d="M18 34 Q18 32 24 32 Q30 32 30 34 V 50 H 18 Z" fill="black"/>
      
      <!-- Arrows -->
      <path d="M40 30 L50 16 L60 30 H40Z" fill="black"/>
      <path d="M40 36 L50 50 L60 36 H40Z" fill="black"/>
    </svg>
  `)}`;

// Custom person icon'u oluştur
const personIcon = `data:image/svg+xml;base64,${btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#4299E1">
      <circle cx="12" cy="6" r="3" />
      <path d="M12,10c-2.21,0-4,1.79-4,4v6h2v-6c0-1.1,0.9-2,2-2s2,0.9,2,2v6h2v-6C16,11.79,14.21,10,12,10z" />
    </svg>
  `)}`;

export { arrowIcon, elevatorIcon, escalatorIcon, personIcon };