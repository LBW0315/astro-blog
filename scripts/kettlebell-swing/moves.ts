/*
  記事「ケトルベルをご存じだろうか？」の3D動画（ケトルベルスイング）の、動きの定義
  public/videos/kettlebell/ の動画はここから作る（作り直し方は export.mjs の先頭を参照）

  体の寸法・座標の決め方・関節の求め方は scripts/koho-exercise/moves.ts と同じ。
  t は 0〜1 で1周。dur（1周の秒数）は、一般的なスイングのペース（1回およそ1.7秒）に合わせた
*/
type V = [number, number, number]; // x：画面の右（正面から見たとき）／y：上／z：体の正面

/* ---------- ベクトルの小道具 ---------- */
const add = (a: V, b: V): V => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a: V, b: V): V => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const mul = (a: V, k: number): V => [a[0] * k, a[1] * k, a[2] * k];
const dot = (a: V, b: V) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const len = (a: V) => Math.hypot(a[0], a[1], a[2]);
const norm = (a: V): V => mul(a, 1 / (len(a) || 1));
const rad = (deg: number) => (deg * Math.PI) / 180;
const rotY = (p: V, a: number): V => [p[0] * Math.cos(a) + p[2] * Math.sin(a), p[1], -p[0] * Math.sin(a) + p[2] * Math.cos(a)];
const rotZ = (p: V, a: number, pivot: V): V => {
	const x = p[0] - pivot[0];
	const y = p[1] - pivot[1];
	return [pivot[0] + x * Math.cos(a) - y * Math.sin(a), pivot[1] + x * Math.sin(a) + y * Math.cos(a), p[2]];
};
const rotX = (p: V, a: number, pivot: V): V => {
	const y = p[1] - pivot[1];
	const z = p[2] - pivot[2];
	return [p[0], pivot[1] + y * Math.cos(a) - z * Math.sin(a), pivot[2] + y * Math.sin(a) + z * Math.cos(a)];
};

/* ---------- 体の寸法（単位は cm） ---------- */
const HIP_Y = 98;
const SHOULDER_Y = 165;
const HIP_W = 14;
const SHOULDER_W = 26;
const UPPER_ARM = 34;
const FOREARM = 32;
const THIGH = 49.5;
const SHIN = 49.5;
const ARM_MAX = UPPER_ARM + FOREARM - 0.5;
const LEG_MAX = THIGH + SHIN - 1.5;

function midJoint(root: V, tip: V, l1: number, l2: number, hint: V): V {
	const d = Math.min(len(sub(tip, root)), l1 + l2 - 0.01);
	const dir = norm(sub(tip, root));
	const along = (l1 * l1 - l2 * l2 + d * d) / (2 * d);
	const h = Math.sqrt(Math.max(l1 * l1 - along * along, 0));
	const side = norm(sub(hint, mul(dir, dot(hint, dir))));
	return add(root, add(mul(dir, along), mul(side, h)));
}

interface Key {
	hL: V;
	hR: V;
	hip: V;
	fL: V;
	fR: V;
	lean?: number; // 上半身を前に倒す角度（度）
}
interface Move {
	name: string;
	yaw: number;
	pitch?: number;
	dur: number;
	key: number; // 「動きを減らす」設定のときに見せるコマ（24分の何番目か）
	kneeOut?: number;
	elbow?: V;
	pose: (t: number) => Key;
}

const flip = (v: V): V => [-v[0], v[1], v[2]];
const both = (hR: V) => ({ hR, hL: flip(hR) });
const feet = { fL: [-22, 0, 0] as V, fR: [22, 0, 0] as V };

function through(keys: number[][], t: number): number[] {
	const n = keys.length;
	const pos = (((t % 1) + 1) % 1) * n;
	const i = Math.floor(pos);
	const u = pos - i;
	const k = (j: number) => keys[(((i + j) % n) + n) % n];
	const [p0, p1, p2, p3] = [k(-1), k(0), k(1), k(2)];
	return p1.map(
		(_, c) =>
			0.5 *
			(2 * p1[c] +
				(-p0[c] + p2[c]) * u +
				(2 * p0[c] - 5 * p1[c] + 4 * p2[c] - p3[c]) * u * u +
				(-p0[c] + 3 * p1[c] - 3 * p2[c] + p3[c]) * u * u * u),
	);
}
const flatten = (k: Key) => [...k.hL, ...k.hR, ...k.hip, ...k.fL, ...k.fR, k.lean ?? 0];
const seq = (keys: Key[]) => {
	const flat = keys.map(flatten);
	return (t: number): Key => {
		const v = through(flat, t);
		const at = (i: number): V => [v[i], v[i + 1], v[i + 2]];
		return { hL: at(0), hR: at(3), hip: at(6), fL: at(9), fR: at(12), lean: v[15] };
	};
};

/* ---------- スイングの姿勢 ----------
   手の位置は「まっすぐ立った上半身」から見た座標。前倒し（lean）はあとからかける。
   両手で1つのハンドルを握るので、手は体の真ん中に寄せる。 */
// いちばん下：お尻を後ろへ引き、ケトルベルが脚の間を後ろへ抜ける
const bottom: Key = { ...both([5, 110, 15]), hip: [0, 86, -16], ...feet, lean: 64 };
// 股関節を伸ばしはじめる
const drive: Key = { ...both([5, 112, 24]), hip: [0, 92, -10], ...feet, lean: 40 };
// 腰が伸びきり、ケトルベルが前へ浮いていく
const snap: Key = { ...both([5, 126, 50]), hip: [0, 98, 0], ...feet, lean: 4 };
// いちばん上：腕が床と平行（胸から肩の高さ）
const top: Key = { ...both([6, 160, 61]), hip: [0, 98, 0], ...feet, lean: 0 };
// 落ちてくるケトルベルを待つ
const fall: Key = { ...both([5, 128, 50]), hip: [0, 98, 0], ...feet, lean: 4 };
// 腕が体に近づいてから、お尻を引く
const hinge: Key = { ...both([5, 114, 22]), hip: [0, 92, -10], ...feet, lean: 38 };

const MOVES: Move[] = [
	{
		name: 'swing',
		yaw: 62,
		dur: 1.7,
		key: 12,
		kneeOut: 0.25,
		elbow: [0.2, -1, -0.3],
		pose: seq([bottom, drive, snap, top, fall, hinge]),
	},
];

const FPS = 30;

function jointsOf(m: Move) {
	const n = Math.max(1, Math.round(m.dur * FPS));
	const frames = [];
	for (let i = 0; i < n; i++) {
		const pose = m.pose(i / n);
		const lean = rad(pose.lean ?? 0);
		const pivot: V = [0, HIP_Y, 0];
		let y = pose.hip[1];
		for (const [foot, side] of [
			[pose.fL, -1],
			[pose.fR, 1],
		] as [V, number][]) {
			const root: V = [side * HIP_W + pose.hip[0], 0, pose.hip[2]];
			const flat = LEG_MAX ** 2 - (foot[0] - root[0]) ** 2 - (foot[2] - root[2]) ** 2;
			y = Math.min(y, foot[1] + Math.sqrt(Math.max(flat, 0)));
		}
		const hipAt: V = [pose.hip[0], y - HIP_Y, pose.hip[2]];
		const upper = (p: V): V => add(rotX(rotZ(rotY(p, 0), 0, pivot), lean, pivot), hipAt);
		const upperDir = (v: V): V => sub(upper(add(pivot, v)), upper(pivot));
		const lower = (p: V): V => add(p, hipAt);
		const clampArm = (root: V, tip: V): V => {
			const v = sub(tip, root);
			return len(v) > ARM_MAX ? add(root, mul(norm(v), ARM_MAX)) : tip;
		};
		const toeOf = (foot: V, side: number): V => add(foot, [side * 6, 0, 15]);
		const shoulderL = upper([-SHOULDER_W, SHOULDER_Y, 0]);
		const shoulderR = upper([SHOULDER_W, SHOULDER_Y, 0]);
		const hipL = lower([-HIP_W, HIP_Y, 0]);
		const hipR = lower([HIP_W, HIP_Y, 0]);
		const hintR: V = m.elbow ?? [1, -0.4, 0.2];
		const handL = clampArm(shoulderL, upper(pose.hL));
		const handR = clampArm(shoulderR, upper(pose.hR));
		const elbowL = midJoint(shoulderL, handL, UPPER_ARM, FOREARM, upperDir(flip(hintR)));
		const elbowR = midJoint(shoulderR, handR, UPPER_ARM, FOREARM, upperDir(hintR));
		const out = m.kneeOut ?? 0.9;
		const kneeL = midJoint(hipL, pose.fL, THIGH, SHIN, [-out, 0, 1]);
		const kneeR = midJoint(hipR, pose.fR, THIGH, SHIN, [out, 0, 1]);
		frames.push({
			shoulderL, shoulderR, elbowL, elbowR, handL, handR,
			hipL, hipR, kneeL, kneeR,
			footL: pose.fL, footR: pose.fR, toeL: toeOf(pose.fL, -1), toeR: toeOf(pose.fR, 1),
			origin: upper(pivot), right: upperDir([1, 0, 0]), up: upperDir([0, 1, 0]), fwd: upperDir([0, 0, 1]),
		});
	}
	return { name: m.name, dur: m.dur, yaw: m.yaw, pitch: m.pitch ?? 8, key: m.key, frames };
}

export const allMoves = () => MOVES.map(jointsOf);
