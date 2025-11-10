export function buildHex(lon, lat, radiusMeters) {
  const coords = [];
  const latRad = (lat * Math.PI) / 180;
  const metersPerDegLat = 111320;
  const metersPerDegLon = 111320 * Math.cos(latRad);
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 180) * (60 * i + 30); // flat-top hex
    const dx = radiusMeters * Math.cos(angle);
    const dy = radiusMeters * Math.sin(angle);
    const dLon = dx / metersPerDegLon;
    const dLat = dy / metersPerDegLat;
    coords.push([lon + dLon, lat + dLat]);
  }
  coords.push(coords[0]);
  return coords;
}
