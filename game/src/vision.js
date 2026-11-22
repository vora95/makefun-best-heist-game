// Geometry helpers shared by guards and cameras: point-in-rect (with a
// margin, for collision) and segment-vs-rect (for line of sight).
export function pointInRect(x, y, rects, margin) {
  const m = margin || 0;
  for (const r of rects) {
    if (x > r.x - m && x < r.x + r.w + m && y > r.y - m && y < r.y + r.h + m) return true;
  }
  return false;
}

export function rectContains(r, x, y) {
  return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
}

// Slab test: does the segment (x1,y1)-(x2,y2) cross the rectangle?
export function segmentHitsRect(x1, y1, x2, y2, r) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  let tmin = 0;
  let tmax = 1;
  if (Math.abs(dx) < 1e-9) {
    if (x1 < r.x || x1 > r.x + r.w) return false;
  } else {
    let t1 = (r.x - x1) / dx;
    let t2 = (r.x + r.w - x1) / dx;
    if (t1 > t2) [t1, t2] = [t2, t1];
    tmin = Math.max(tmin, t1);
    tmax = Math.min(tmax, t2);
    if (tmin > tmax) return false;
  }
  if (Math.abs(dy) < 1e-9) {
    if (y1 < r.y || y1 > r.y + r.h) return false;
  } else {
    let t1 = (r.y - y1) / dy;
    let t2 = (r.y + r.h - y1) / dy;
    if (t1 > t2) [t1, t2] = [t2, t1];
    tmin = Math.max(tmin, t1);
    tmax = Math.min(tmax, t2);
    if (tmin > tmax) return false;
  }
  return true;
}

// Circle (thief) vs rect: push the circle out along the smallest axis.
export function resolveCircleRect(px, py, radius, r) {
  const cx = Math.max(r.x, Math.min(px, r.x + r.w));
  const cy = Math.max(r.y, Math.min(py, r.y + r.h));
  const dx = px - cx;
  const dy = py - cy;
  const d2 = dx * dx + dy * dy;
  if (d2 >= radius * radius) return { x: px, y: py };
  if (d2 < 1e-9) return { x: px, y: py - radius };
  const d = Math.sqrt(d2);
  const push = (radius - d) / d;
  return { x: px + dx * push, y: py + dy * push };
}
