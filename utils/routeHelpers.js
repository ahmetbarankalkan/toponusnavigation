/**
 * Route Helper Functions
 * Rota hesaplama ve yönetimi için yardımcı fonksiyonlar
 */

/**
 * Escalator/elevator giriş adımı kontrolü
 */
export function isEscalatorEntranceStep(step) {
  return step.to.includes('escalator') || step.to.includes('elevator');
}

/**
 * Escalator/elevator çıkış adımı kontrolü
 */
export function isEscalatorExitStep(step) {
  return step.from.includes('escalator') || step.from.includes('elevator');
}

/**
 * Koridor adını çıkar
 */
export function extractCorridorName(locationName) {
  if (!locationName) return null;
  const match = locationName.match(/corridor-\d+/);
  return match ? match[0] : null;
}

/**
 * Koridor bouncing kontrolü
 */
export function shouldSkipCorridorBouncing(steps, currentIndex) {
  const currentStep = steps[currentIndex];
  const currentDistance = parseFloat(currentStep.distance) || 0;

  // 1. SIFIR MESAFE FİLTRESİ
  if (currentDistance === 0.0) {
    return true;
  }

  // 2. KORİDOR BOUNCING FİLTRESİ
  if (currentIndex > 0 && currentIndex < steps.length - 1) {
    const prevStep = steps[currentIndex - 1];
    const nextStep = steps[currentIndex + 1];

    const prevCorridor =
      extractCorridorName(prevStep.from) || extractCorridorName(prevStep.to);
    const currentCorridorFrom = extractCorridorName(currentStep.from);
    const currentCorridorTo = extractCorridorName(currentStep.to);
    const nextCorridor =
      extractCorridorName(nextStep.from) || extractCorridorName(nextStep.to);

    if (
      prevCorridor &&
      nextCorridor &&
      (currentCorridorFrom || currentCorridorTo) &&
      prevCorridor === nextCorridor &&
      currentCorridorFrom !== prevCorridor &&
      currentCorridorTo !== prevCorridor
    ) {
      if (currentDistance < 5) {
        return true;
      }
    }
  }

  // 3. UZUN KORİDOR ZİNCİRİ FİLTRESİ
  if (currentIndex >= 2 && currentIndex <= steps.length - 3) {
    const step1 = steps[currentIndex - 2];
    const step2 = steps[currentIndex - 1];
    const step3 = steps[currentIndex];
    const step4 = steps[currentIndex + 1];
    const step5 = steps[currentIndex + 2];

    const corridor1 =
      extractCorridorName(step1.from) || extractCorridorName(step1.to);
    const corridor2 =
      extractCorridorName(step2.from) || extractCorridorName(step2.to);
    const corridor3 =
      extractCorridorName(step3.from) || extractCorridorName(step3.to);
    const corridor4 =
      extractCorridorName(step4.from) || extractCorridorName(step4.to);
    const corridor5 =
      extractCorridorName(step5.from) || extractCorridorName(step5.to);

    if (
      corridor1 &&
      corridor2 &&
      corridor3 &&
      corridor4 &&
      corridor5 &&
      corridor1 === corridor2 &&
      corridor4 === corridor5 &&
      corridor1 === corridor4 &&
      corridor3 !== corridor1 &&
      currentDistance < 5
    ) {
      return true;
    }
  }

  return false;
}

/**
 * Adım atlama kontrolü
 */
export function shouldSkipStep(steps, currentIndex) {
  if (
    !steps ||
    steps.length === 0 ||
    currentIndex < 0 ||
    currentIndex >= steps.length
  ) {
    return false;
  }

  const currentStep = steps[currentIndex];

  if (!currentStep) {
    return false;
  }

  if (!currentStep.hasOwnProperty('distance')) {
    return false;
  }

  const currentDistance = parseFloat(currentStep.distance) || 0;

  // SIFIR MESAFE - her zaman skip
  if (currentDistance === 0.0) {
    return true;
  }

  return false;
}

/**
 * Bearing (yön) hesaplama
 */
export function calculateBearing(lat1, lon1, lat2, lon2) {
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const y = Math.sin(deltaLambda) * Math.cos(phi2);
  const x =
    Math.cos(phi1) * Math.sin(phi2) -
    Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);
  const theta = Math.atan2(y, x);
  const bearing = ((theta * 180) / Math.PI + 360) % 360;

  return bearing;
}

/**
 * Mevcut talimat metnini oluştur
 */
export function getCurrentInstruction(
  routeSteps,
  routeByFloor,
  currentFloor,
  selectedStartRoom,
  selectedEndRoom,
  rooms,
  preferredTransport
) {
  if (!routeSteps || !routeSteps.length) return '';
  if (!routeByFloor || !rooms) return '';

  const startRoom = rooms.find(r => r.id === selectedStartRoom);
  const endRoom = rooms.find(r => r.id === selectedEndRoom);
  const isGoingUp = endRoom?.floor > startRoom?.floor;

  const floors = Object.keys(routeByFloor)
    .map(Number)
    .sort((a, b) => (isGoingUp ? a - b : b - a));

  const currentIndex = floors.indexOf(currentFloor);
  const isLastFloor = currentIndex >= floors.length - 1;

  if (isLastFloor) {
    const endRoom = rooms.find(r => r.id === selectedEndRoom);
    return `Hedefiniz ${endRoom?.name}'e doğru yolu takip edin`;
  }

  const nextFloor = floors[currentIndex + 1];
  const isGoingUpStep = nextFloor > currentFloor;
  const action = isGoingUpStep ? 'çıkın' : 'inin';

  const transportNames = {
    escalator: 'yürüyen merdiven',
    elevator: 'asansör',
    stairs: 'merdiven',
  };

  const transportName = transportNames[preferredTransport] || 'merdiven';
  const nextFloorName = nextFloor === 0 ? 'zemin kata' : `${nextFloor}. kata`;

  return `${transportName.charAt(0).toUpperCase() +
    transportName.slice(1)} ile ${nextFloorName} ${action}`;
}
