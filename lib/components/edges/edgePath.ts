import { EDGE_BEZIER_OFFSET, EDGE_BEZIER_TENSION } from '@/lib/constants';

// ─────────────────────────────────────────────────────────────────────────────
// Edge path helpers — all geometry for drawing edges lives here.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns an SVG cubic bezier path string between two points.
 * Control points are horizontal, giving the classic node-editor S-curve.
 */
export function bezierPath(
	x1: number,
	y1: number,
	x2: number,
	y2: number
): string {
	const dx = Math.abs(x2 - x1) * EDGE_BEZIER_TENSION + EDGE_BEZIER_OFFSET;
	return `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
}

/**
 * Returns the midpoint along the bezier — useful for placing edge labels.
 * Uses De Casteljau's algorithm at t=0.5.
 */
export function bezierMidpoint(
	x1: number,
	y1: number,
	x2: number,
	y2: number
): { x: number; y: number } {
	const dx = Math.abs(x2 - x1) * EDGE_BEZIER_TENSION;
	const cx1 = x1 + dx;
	const cy1 = y1;
	const cx2 = x2 - dx;
	const cy2 = y2;

	// t = 0.5
	const t = 0.5;
	const mt = 1 - t;
	const x =
		mt * mt * mt * x1 +
		3 * mt * mt * t * cx1 +
		3 * mt * t * t * cx2 +
		t * t * t * x2;
	const y =
		mt * mt * mt * y1 +
		3 * mt * mt * t * cy1 +
		3 * mt * t * t * cy2 +
		t * t * t * y2;

	return { x, y };
}
