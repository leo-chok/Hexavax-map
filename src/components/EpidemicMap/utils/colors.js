export function bucketColor(pct) {
  const num = Number(pct);
  if (!Number.isFinite(num)) return [200, 200, 200];
  if (num < 30) return [46, 204, 113];
  if (num < 50) return [46, 150, 255];
  if (num < 70) return [199, 63, 197];
  return [255, 0, 0];
}

export const PALETTE = {
  low: [46, 204, 113],
  mid: [46, 150, 255],
  high: [199, 63, 197],
  critical: [255, 0, 0],
};
