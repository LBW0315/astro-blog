/*
  記事「古法運動（古法健身、古法養生操）〜古くから伝わるには理由がある！」の3D動画の、動きの定義
  public/videos/koho/ の動画はここから作る（作り直し方は export.mjs の先頭を参照）

  t は 0〜1 で1周。dur（1周の秒数）は、もとにした動画から測った実際の速さ
*/
type V = [number, number, number]; // x：画面の右（正面から見たとき）／y：上／z：体の正面
type MoveName =
	| 'mabuSway'
	| 'windmill'
	| 'sideStretch'
	| 'rotate'
	| 'upDown'
	| 'mabuTwist'
	| 'crossKick'
	| 'eagle'
	| 'sunJump'
	| 'wildArms'
	| 'mabuSide'
	| 'moonHold'
	| 'kongoSquat'
	| 'dragonSwim'
	| 'tortoise'
	| 'waistPelvis'
	| 'dragonSpine';

/* ---------- ベクトルの小道具 ---------- */
const add = (a: V, b: V): V => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a: V, b: V): V => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const mul = (a: V, k: number): V => [a[0] * k, a[1] * k, a[2] * k];
const dot = (a: V, b: V) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const len = (a: V) => Math.hypot(a[0], a[1], a[2]);
const norm = (a: V): V => mul(a, 1 / (len(a) || 1));
const lerp = (a: V, b: V, k: number): V => add(a, mul(sub(b, a), k));
const rad = (deg: number) => (deg * Math.PI) / 180;
// 縦軸まわりに回す（プラスで、顔が x のプラス側を向く）
const rotY = (p: V, a: number): V => [p[0] * Math.cos(a) + p[2] * Math.sin(a), p[1], -p[0] * Math.sin(a) + p[2] * Math.cos(a)];
// 横に倒す（プラスで x のマイナス側へ）
const rotZ = (p: V, a: number, pivot: V): V => {
	const x = p[0] - pivot[0];
	const y = p[1] - pivot[1];
	return [pivot[0] + x * Math.cos(a) - y * Math.sin(a), pivot[1] + x * Math.sin(a) + y * Math.cos(a), p[2]];
};
// 前に倒す
const rotX = (p: V, a: number, pivot: V): V => {
	const y = p[1] - pivot[1];
	const z = p[2] - pivot[2];
	return [p[0], pivot[1] + y * Math.cos(a) - z * Math.sin(a), pivot[2] + y * Math.sin(a) + z * Math.cos(a)];
};
const ease = (k: number) => k * k * (3 - 2 * k);
const wave = (t: number) => Math.sin(2 * Math.PI * t); // -1〜1 を行き来
const swing = (t: number) => (1 - Math.cos(2 * Math.PI * t)) / 2; // 0〜1 を行き来
// 端で少し止まる -1〜1 の行き来
const holdWave = (t: number) => {
	const s = wave(t);
	return Math.sign(s) * ease(Math.abs(s));
};

/* ---------- 体の寸法（単位は SVG の px） ---------- */
const HIP_Y = 98;
const SHOULDER_Y = 165;
const HIP_W = 14;
const SHOULDER_W = 26;
const UPPER_ARM = 34;
const FOREARM = 32;
const THIGH = 49.5;
const SHIN = 49.5;
const HEAD_R = 12.5;
const ARM_MAX = UPPER_ARM + FOREARM - 0.5;
const LEG_MAX = THIGH + SHIN - 1.5;

// 関節が2つある腕・脚で、付け根と先端から「間の関節」の位置を求める
function midJoint(root: V, tip: V, l1: number, l2: number, hint: V): V {
	const d = Math.min(len(sub(tip, root)), l1 + l2 - 0.01);
	const dir = norm(sub(tip, root));
	const along = (l1 * l1 - l2 * l2 + d * d) / (2 * d);
	const h = Math.sqrt(Math.max(l1 * l1 - along * along, 0));
	const side = norm(sub(hint, mul(dir, dot(hint, dir))));
	return add(root, add(mul(dir, along), mul(side, h)));
}

/* ---------- 動きの定義 ----------
   t は 0〜1 で1周。手の位置は「まっすぐ立った上半身」から見た座標で決め、
   あとから ひねり（tw）・横倒し（bend）・前倒し（lean）・腰の移動をまとめてかける。 */
interface Key {
	hL: V; // x がマイナス側の手
	hR: V; // x がプラス側の手
	hip: V; // 腰の位置（x：左右、y：高さ、z：前後）
	fL: V; // x がマイナス側の足
	fR: V; // x がプラス側の足
	tw?: number; // 上半身を縦軸まわりに回す角度（度）
	bend?: number; // 上半身を横に倒す角度（度）
	lean?: number; // 上半身を前に倒す角度（度）
	htw?: number; // 腰を縦軸まわりに回す角度（度）
}
interface Move {
	yaw: number; // 見る向き（0＝正面、180＝真後ろ）
	pitch?: number; // 少し上から見下ろす角度
	dur: number; // 1周の秒数（動画から測った実際の速さ）
	key: number; // 「動きを減らす」設定のときに見せるコマ
	kneeOut?: number; // ひざを外へ開く度合い（0でまっすぐ前）
	elbow?: V; // x のプラス側のひじを向けたい方向（反対側は左右を裏返す）
	pose: (t: number) => Key;
}

const flip = (v: V): V => [-v[0], v[1], v[2]];
// 左右を入れ替えた姿勢
const mir = (k: Key): Key => ({
	hL: flip(k.hR),
	hR: flip(k.hL),
	hip: flip(k.hip),
	fL: flip(k.fR),
	fR: flip(k.fL),
	tw: -(k.tw ?? 0),
	bend: -(k.bend ?? 0),
	lean: k.lean ?? 0,
	htw: -(k.htw ?? 0),
});
// 肩から腕を伸ばした先の位置。az：0で真横、90で正面／el：0で水平、90で真上
const arm = (sign: 1 | -1, az: number, el: number, reach = ARM_MAX): V => {
	const a = rad(az);
	const e = rad(el);
	return [sign * (SHOULDER_W + reach * Math.cos(e) * Math.cos(a)), SHOULDER_Y + reach * Math.sin(e), reach * Math.cos(e) * Math.sin(a)];
};
// 左右対称の手の位置
const both = (hR: V) => ({ hR, hL: flip(hR) });
// 足を左右に開いた位置
const wide = (half: number) => ({ fL: [-half, 0, 0] as V, fR: [half, 0, 0] as V });

// 決めた姿勢を順番になめらかにつなぐ（最後は最初に戻る）
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
const flatten = (k: Key) => [...k.hL, ...k.hR, ...k.hip, ...k.fL, ...k.fR, k.tw ?? 0, k.bend ?? 0, k.lean ?? 0, k.htw ?? 0];
const seq = (keys: Key[]) => {
	const flat = keys.map(flatten);
	return (t: number): Key => {
		const v = through(flat, t);
		const at = (i: number): V => [v[i], v[i + 1], v[i + 2]];
		return { hL: at(0), hR: at(3), hip: at(6), fL: at(9), fR: at(12), tw: v[15], bend: v[16], lean: v[17], htw: v[18] };
	};
};

// 腕を前後に回すときの手の位置（真横から見て、肩を中心にした円）
const wheel = (sign: 1 | -1, a: number): V => [sign * (SHOULDER_W + 8), SHOULDER_Y + 64 * Math.sin(a), 64 * Math.cos(a)];

// 蹴り上げの片側ぶん。k：0で足が床、1でいちばん高い。蹴るのは x のマイナス側の足
const kick = (k: number): Key => {
	const a = rad(128 * k);
	return {
		fR: [14, 0, 0],
		fL: [lerp([-14, 0, 0], [6, 0, 0], k)[0], Math.max(0, 97 - 98 * Math.cos(a)), 98 * Math.sin(a)],
		hip: [0, 97, 0],
		hR: lerp(arm(1, 20, -60), [10, 172, 60], k),
		hL: lerp(arm(-1, 20, -60), arm(-1, -30, -40), k),
		lean: 14 * k,
	};
};

// 背骨を動かす動き（開龍脊）の足
const staggered = { fL: [-10, 0, 8] as V, fR: [10, 0, -8] as V };

/* 動きごとの姿勢（左右対称のものは mir で作る） */
const eagleV = { ...both([74, 205, 0]), hip: [0, 72, 0] as V, ...wide(60) };
const jumpUp: Key = { ...both([5, 232, 4]), hip: [0, 104, 0], fL: [-14, 8, 0], fR: [14, 30, -8], bend: 12 };
const jumpDown: Key = { ...both([5, 232, 4]), hip: [0, 94, 0], ...wide(14) };
const wildSwing: Key = { hR: arm(1, 30, 10, 55), hL: arm(-1, -40, -55, 55), hip: [0, 92, 0], ...wide(22), tw: 30, htw: 8 };
const wildDown: Key = { ...both(arm(1, 0, -40, 55)), hip: [0, 96, 0], ...wide(22) };
const sideOver: Key = { hR: [-34, 226, 2], hL: [-40, 98, 26], hip: [20, 54, 0], ...wide(72), bend: 46 };
const sideUp: Key = { hR: arm(1, 0, 55), hL: arm(-1, 10, -55), hip: [0, 58, 0], ...wide(72) };
const swimLow: Key = { hR: arm(1, 10, 14), hL: arm(-1, 10, 25), hip: [30, 42, 0], ...wide(74), tw: 34, bend: -6 };
const swimUp: Key = { hR: [44, 220, 10], hL: [-56, 196, 10], hip: [0, 46, 0], ...wide(74) };

const MOVES: Record<MoveName, Move> = {
	mabuSway: {
		yaw: 0,
		dur: 1.7,
		key: 6,
		kneeOut: 1.2,
		elbow: [1, -0.5, 0.3],
		pose: (t) => {
			const s = wave(t);
			return { hR: [-14, 146, 24], hL: [14, 150, 20], hip: [22 * s, 54, 0], ...wide(74), tw: -12 * s };
		},
	},
	windmill: {
		yaw: 65,
		dur: 1.8,
		key: 3,
		kneeOut: 0,
		pose: (t) => {
			const a = 2 * Math.PI * t;
			return { hR: wheel(1, a), hL: wheel(-1, a + Math.PI), hip: [0, 60, 6], fL: [-10, 0, 58], fR: [10, 0, -66], lean: 6, tw: 10 * Math.sin(a) };
		},
	},
	sideStretch: {
		yaw: 0,
		dur: 4.8,
		key: 6,
		kneeOut: 1.2,
		pose: (t) => {
			const s = holdWave(t);
			return { ...both(arm(1, 0, 58)), hip: [24 * s, 58, 0], ...wide(72), bend: 44 * s };
		},
	},
	rotate: {
		yaw: 0,
		dur: 2,
		key: 6,
		kneeOut: 0.7,
		pose: (t) => {
			const s = wave(t);
			return { ...both(arm(1, 0, -12)), hip: [0, 88, 0], ...wide(44), tw: 62 * s, htw: 14 * s };
		},
	},
	upDown: {
		yaw: 88,
		dur: 0.95,
		key: 6,
		kneeOut: 0,
		pose: (t) => {
			const s = wave(t);
			return { hR: wheel(1, rad(30 + 60 * s)), hL: wheel(-1, rad(30 - 60 * s)), hip: [0, 96 + 1.5 * s, 0], fL: [-7, 0, 0], fR: [7, 0, 0] };
		},
	},
	mabuTwist: {
		yaw: 0,
		dur: 0.95,
		key: 6,
		kneeOut: 1.2,
		elbow: [1, 0, -0.3],
		pose: (t) => {
			const s = wave(t);
			return { ...both([34, 108, 10]), hip: [0, 60, 0], ...wide(62), tw: 34 * s, htw: 14 * s };
		},
	},
	crossKick: {
		yaw: 72,
		dur: 1.7,
		key: 6,
		kneeOut: 0,
		pose: (t) => {
			const u = (t * 2) % 1;
			const k = kick(ease(swing(u)));
			return t < 0.5 ? k : mir(k);
		},
	},
	eagle: {
		yaw: 0,
		dur: 1.65,
		key: 12,
		kneeOut: 1.2,
		pose: seq([
			{ ...both([86, 128, 10]), hip: [0, 50, 0], ...wide(60) },
			eagleV,
			{ ...both([5, 230, 8]), hip: [0, 86, 0], ...wide(60) },
			eagleV,
		]),
	},
	sunJump: {
		yaw: 165,
		dur: 0.85,
		key: 6,
		kneeOut: 0.1,
		pose: seq([jumpDown, jumpUp, jumpDown, mir(jumpUp)]),
	},
	wildArms: {
		yaw: 0,
		dur: 0.9,
		key: 6,
		kneeOut: 0.3,
		elbow: [1, -0.6, -0.2],
		pose: seq([wildSwing, wildDown, mir(wildSwing), wildDown]),
	},
	mabuSide: {
		yaw: 0,
		dur: 4.8,
		key: 0,
		kneeOut: 1.2,
		pose: seq([sideOver, sideUp, mir(sideOver), mir(sideUp)]),
	},
	moonHold: {
		yaw: 0,
		dur: 3.9,
		key: 12,
		kneeOut: 1.2,
		pose: seq([
			{ ...both([68, 92, 20]), hip: [0, 50, 0], ...wide(60) },
			{ ...both([3, 160, 26]), hip: [0, 56, 0], ...wide(60) },
			{ ...both([5, 230, 6]), hip: [0, 86, 0], ...wide(60) },
			{ ...both([76, 205, 4]), hip: [0, 68, 0], ...wide(60) },
		]),
	},
	kongoSquat: {
		yaw: 0,
		dur: 2.05,
		key: 6,
		kneeOut: 1.4,
		elbow: [1, -0.4, 0.2],
		pose: (t) => {
			const s = holdWave(t);
			return { ...both([30, 150, 34]), hip: [30 * s, 42, 0], ...wide(74), tw: -10 * s, lean: 6 };
		},
	},
	dragonSwim: {
		yaw: 0,
		dur: 3.6,
		key: 0,
		kneeOut: 1.4,
		pose: seq([swimLow, swimUp, mir(swimLow), mir(swimUp)]),
	},
	tortoise: {
		yaw: -14,
		pitch: 16,
		dur: 1.1,
		key: 6,
		kneeOut: 0.8,
		pose: (t) => {
			const s = holdWave(t);
			return { ...both(arm(1, 0, 0)), hip: [0, 84, -12], ...wide(60), lean: 76, tw: 62 * s };
		},
	},
	waistPelvis: {
		yaw: 180,
		dur: 0.85,
		key: 6,
		kneeOut: 0.5,
		pose: (t) => {
			const s = wave(t);
			const u = (s + 1) / 2;
			return {
				hR: lerp(arm(1, 0, -35), arm(1, 0, 58), u),
				hL: lerp(arm(-1, 0, 58), arm(-1, 0, -35), u),
				hip: [-12 * s, 88, 0],
				...wide(48),
				tw: 26 * s,
				htw: -10 * s,
				bend: -10 * s,
			};
		},
	},
	dragonSpine: {
		yaw: 72,
		dur: 1.85,
		key: 12,
		kneeOut: 0,
		pose: seq([
			{ ...both([30, 112, -26]), hip: [0, 90, 8], ...staggered, lean: -20 },
			{ ...both(arm(1, 80, -20)), hip: [0, 82, -4], ...staggered, lean: 14 },
			{ ...both(arm(1, 80, 20)), hip: [0, 60, -24], ...staggered, lean: 52 },
			{ ...both(arm(1, 70, -50)), hip: [0, 76, -8], ...staggered, lean: 22 },
		]),
	},
};

const FPS = 30;

// 動きの全コマについて、3D で描くのに必要な関節の位置を求める
function jointsOf(name: MoveName) {
	const m = MOVES[name];
	const n = Math.max(1, Math.round(m.dur * FPS));
	const frames = [];
	for (let i = 0; i < n; i++) {
		const pose = m.pose(i / n);
		const twist = rad(pose.tw ?? 0);
		const bend = rad(pose.bend ?? 0);
		const lean = rad(pose.lean ?? 0);
		const htw = rad(pose.htw ?? 0);
		const pivot: V = [0, HIP_Y, 0];
		// 足が届く高さまで腰を下げる
		let y = pose.hip[1];
		for (const [foot, side] of [
			[pose.fL, -1],
			[pose.fR, 1],
		] as [V, number][]) {
			const root = add(rotY([side * HIP_W, 0, 0], htw), [pose.hip[0], 0, pose.hip[2]]);
			const flat = LEG_MAX ** 2 - (foot[0] - root[0]) ** 2 - (foot[2] - root[2]) ** 2;
			y = Math.min(y, foot[1] + Math.sqrt(Math.max(flat, 0)));
		}
		const hipAt: V = [pose.hip[0], y - HIP_Y, pose.hip[2]];
		const upper = (p: V): V => add(rotX(rotZ(rotY(p, twist), bend, pivot), lean, pivot), hipAt);
		const upperDir = (v: V): V => sub(upper(add(pivot, v)), upper(pivot));
		const lower = (p: V): V => add(rotY(p, htw), hipAt);
		const clampArm = (root: V, tip: V): V => {
			const v = sub(tip, root);
			return len(v) > ARM_MAX ? add(root, mul(norm(v), ARM_MAX)) : tip;
		};
		const toeOf = (foot: V, side: number): V => {
			const up = Math.min(foot[1] / 30, 1);
			return add(foot, [side * (8 - 5 * up), 12 * up, 15 - 4 * up]);
		};
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
	return { name, dur: m.dur, yaw: m.yaw, pitch: m.pitch ?? 8, key: m.key, frames };
}

export const allMoves = () => (Object.keys(MOVES) as MoveName[]).map(jointsOf);
