export interface GpsPoint {
  lat: number;
  lng: number;
  timestamp: number;
}

export function haversineDistance(a: GpsPoint, b: GpsPoint): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const chord =
    sinLat * sinLat +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      sinLng *
      sinLng;
  return R * 2 * Math.atan2(Math.sqrt(chord), Math.sqrt(1 - chord));
}

export function speedKmh(a: GpsPoint, b: GpsPoint): number {
  const distKm = haversineDistance(a, b);
  const timeSec = (b.timestamp - a.timestamp) / 1000;
  if (timeSec <= 0) return 0;
  return (distKm / timeSec) * 3600;
}

export function calcCalories(distanceKm: number, weightKg: number): number {
  return Math.round(weightKg * distanceKm * 1.04);
}

export function formatPace(secondsPerKm: number): string {
  if (!secondsPerKm || secondsPerKm <= 0) return "--'--\"";
  const m = Math.floor(secondsPerKm / 60);
  const s = Math.floor(secondsPerKm % 60);
  return `${m}'${String(s).padStart(2, "0")}"`;
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
