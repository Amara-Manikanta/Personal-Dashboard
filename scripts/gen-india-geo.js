const fs = require('fs');
const gj = JSON.parse(fs.readFileSync('ne50.geojson', 'utf8'));
const f = gj.features.find(f => (f.properties.ADMIN || f.properties.NAME) === 'India');
const polys = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates;

const W = 1000, H = 1100, PAD = 20;

// Web Mercator
const mx = lng => lng;
const my = lat => Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI / 180) / 2)) * (180 / Math.PI);

let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
polys.forEach(p => p.forEach(r => r.forEach(([lng, lat]) => {
  const x = mx(lng), y = my(lat);
  if (x < minX) minX = x; if (x > maxX) maxX = x;
  if (y < minY) minY = y; if (y > maxY) maxY = y;
})));

const scale = Math.min((W - PAD * 2) / (maxX - minX), (H - PAD * 2) / (maxY - minY));
const offX = (W - (maxX - minX) * scale) / 2;
const offY = (H - (maxY - minY) * scale) / 2;
const px = lng => (mx(lng) - minX) * scale + offX;
const py = lat => (maxY - my(lat)) * scale + offY;

// Perpendicular-distance simplification, keeps the silhouette honest.
function simplify(points, tol) {
  if (points.length < 3) return points;
  const sq = (a, b) => (a[0]-b[0])**2 + (a[1]-b[1])**2;
  const segDist = (p, a, b) => {
    let x = a[0], y = a[1], dx = b[0]-x, dy = b[1]-y;
    if (dx || dy) {
      const t = ((p[0]-x)*dx + (p[1]-y)*dy) / (dx*dx + dy*dy);
      if (t > 1) { x = b[0]; y = b[1]; } else if (t > 0) { x += dx*t; y += dy*t; }
    }
    return sq(p, [x, y]);
  };
  const step = (pts, first, last, tol, out) => {
    let maxD = tol, idx = -1;
    for (let i = first + 1; i < last; i++) {
      const d = segDist(pts[i], pts[first], pts[last]);
      if (d > maxD) { idx = i; maxD = d; }
    }
    if (idx > 0) { step(pts, first, idx, tol, out); out.push(pts[idx]); step(pts, idx, last, tol, out); }
  };
  const out = [points[0]];
  step(points, 0, points.length - 1, tol, out);
  out.push(points[points.length - 1]);
  return out;
}

const paths = [];
polys.forEach(poly => {
  poly.forEach(ring => {
    const projected = ring.map(([lng, lat]) => [px(lng), py(lat)]);
    const simplified = simplify(projected, 0.35);
    if (simplified.length < 4) return; // drop specks
    const d = simplified.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join('');
    paths.push({ d, size: simplified.length });
  });
});

paths.sort((a, b) => b.size - a.size);

const out = `/**
 * India outline + the projection used to place pins on it.
 *
 * Geometry derived from Natural Earth (ne_50m_admin_0_countries), which is
 * public domain — "no permission is needed to use Natural Earth". Simplified
 * with a perpendicular-distance filter to keep the file small.
 *
 * Outline and pins MUST share one transform, so the projection lives here
 * rather than being re-derived in the component. Web Mercator, matching the
 * projection the paths were generated with.
 *
 * Generated once by scripts/gen-india-geo.js — edit that, not this.
 */
window.INDIA_GEO = {
    viewBox: '0 0 ${W} ${H}',
    width: ${W},
    height: ${H},
    // Mercator-space bounds of the geometry, for projecting lat/lng to viewBox units
    bounds: { minX: ${minX.toFixed(6)}, maxY: ${maxY.toFixed(6)}, scale: ${scale.toFixed(6)}, offX: ${offX.toFixed(3)}, offY: ${offY.toFixed(3)} },
    paths: [
${paths.map(p => `        '${p.d}'`).join(',\n')}
    ],
    /** lat/lng -> { x, y } in viewBox units. */
    project(lat, lng) {
        const b = this.bounds;
        const myLat = Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI / 180) / 2)) * (180 / Math.PI);
        return {
            x: (lng - b.minX) * b.scale + b.offX,
            y: (b.maxY - myLat) * b.scale + b.offY
        };
    }
};
`;

fs.writeFileSync('indiaGeo.js', out);
console.log('rings kept:', paths.length, '| bytes:', out.length);
console.log('largest ring points:', paths[0].size);
