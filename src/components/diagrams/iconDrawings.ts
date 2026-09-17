/*
  記事「ホーム画面のアイコンが「ブ」だったので、マグのアイコンを作った話」の図で使う絵
  SVG の中身を文字列で返します（set:html で埋め込む）。

  - 色はデザイントークン（CSS変数）を style で指定する（SVG の fill 属性には var() が使えないため）
  - clipPath の id はページ内で重ならないよう、呼び出し側から受け取る
  - アイコン自体は「実際のアイコンの見た目」を表すので、手描き風のゆらぎはかけない
*/

const MUG_BODY = 'M7 13h14v9a5 5 0 0 1-5 5h-4a5 5 0 0 1-5-5z';
const MUG_HANDLE = 'M21 15.5h2a3 3 0 0 1 0 6h-2';
const steam = (x: number) => `M${x} 10.5q-2.2 -1.75 0 -3.5q2.2 -1.75 0 -3.5`;

const line = (width: number, color = 'var(--c-text)') =>
	`fill:none;stroke:${color};stroke-width:${width};stroke-linecap:round;stroke-linejoin:round`;

/** マグの本体（32 のマス目）。湯気の有無と線の太さを変えられる */
function mug(id: string, { sw = 2.4, withSteam = true } = {}) {
	return `
	${withSteam ? `<g style="${line(sw * 0.85)}"><path d="${steam(12)}"/><path d="${steam(16.5)}"/></g>` : ''}
	<path d="${MUG_BODY}" style="fill:var(--c-surface-raised)"/>
	<clipPath id="${id}"><path d="${MUG_BODY}"/></clipPath>
	<rect x="7" y="17" width="14" height="4" style="fill:var(--c-accent)" clip-path="url(#${id})"/>
	<g style="${line(sw)}"><path d="${MUG_BODY}"/><path d="${MUG_HANDLE}"/></g>`;
}

/** タブ用ファビコン（32 のマス目・グレージュの角丸背景） */
export function faviconMug(id: string) {
	return `<rect width="32" height="32" rx="7" style="fill:var(--c-line)"/>${mug(id)}`;
}

/** 万年筆（ペン先が上、原点がお尻、長さ 126） */
function pen() {
	return `
	<rect x="-9" y="-78" width="18" height="78" rx="6" style="fill:var(--c-accent2);stroke:var(--c-text);stroke-width:5"/>
	<path d="M-9 -62h18" style="${line(5)}"/>
	<rect x="-6.5" y="-92" width="13" height="14" rx="2" style="fill:var(--c-text);stroke:var(--c-text);stroke-width:5;stroke-linejoin:round"/>
	<path d="M-10 -92L0 -126L10 -92Z" style="fill:var(--c-surface-raised);stroke:var(--c-text);stroke-width:3.5;stroke-linejoin:round"/>
	<path d="M0 -114V-100" style="${line(3)}"/>`;
}

/** ホーム画面用アイコン（180 のマス目・iPhone のように角を丸めて表示） */
export function appIcon(id: string) {
	return `
	<clipPath id="${id}-round"><rect width="180" height="180" rx="40"/></clipPath>
	<g clip-path="url(#${id}-round)">
		<rect width="180" height="180" style="fill:var(--c-line)"/>
		<g transform="translate(26 8) scale(4.3)">${mug(`${id}-band`, { sw: 1.55 })}</g>
		<path d="M24 136h132" style="${line(3, 'var(--c-line-strong)')};stroke-dasharray:0.1 9"/>
		<g transform="translate(28 156) rotate(90) scale(0.95)">${pen()}</g>
	</g>`;
}

/** 初期設定のアイコン（Astro のロゴを思わせる簡単な形。公式ロゴそのものではない） */
export function defaultLogo() {
	return `
	<path d="M12 4h8l6.5 18c-3.2-1.6-6.8-2.4-10.5-2.4S8.7 20.4 5.5 22z" style="fill:var(--c-text-sub)"/>
	<path d="M12.5 24.5c.3 2.8 3.5 4.5 3.5 4.5s3.2-1.7 3.5-4.5c-2.3.7-4.7.7-7 0z" style="fill:var(--c-text-sub)"/>`;
}

/** iPhone が頭文字で作ったアイコン（52px 相当） */
export function letterIcon() {
	return `
	<rect width="52" height="52" rx="12" style="fill:var(--c-text)"/>
	<text x="26" y="27" text-anchor="middle" dominant-baseline="central" style="fill:var(--c-bg);font-size:28px;font-weight:700">ブ</text>`;
}

/** 凝ったデザインの例：ノートPC＋コーヒー（32 のマス目・細い線） */
export function laptopCoffee() {
	return `
	<rect width="32" height="32" rx="7" style="fill:var(--c-line)"/>
	<g style="${line(1.1)}">
		<rect x="3" y="7" width="17" height="11" rx="1"/>
		<path d="M6 10.5h5M6 13h8M6 15.5h4"/>
		<path d="M1.5 20.5h20l-1.5 2h-17z"/>
		<path d="M23 16h6v5a2.5 2.5 0 0 1-2.5 2.5h-1A2.5 2.5 0 0 1 23 21z"/>
		<path d="M29 17.5h.8a1.5 1.5 0 0 1 0 3H29"/>
		<path d="M25 14q-.8-.8 0-1.6q.8-.8 0-1.6M27.5 14q-.8-.8 0-1.6q.8-.8 0-1.6"/>
		<path d="M3 26h8M3 28.5h5"/>
	</g>
	<rect x="23.4" y="18" width="5.2" height="1.6" style="fill:var(--c-accent)"/>`;
}

/** 候補として描いたアイコン（32 のマス目・グレージュの角丸背景） */
const candidateShapes: Record<string, string> = {
	b: 'M10 5h7a5.5 5.5 0 0 1 0 11h-7z M10 16h8a5.5 5.5 0 0 1 0 11h-8z',
	bun: 'M16 4v4 M6 9h20 M10 12c3 8 9 13 16 15 M22 12c-3 8-9 13-16 15',
	glasses: 'M5 18a5 5 0 1 0 10 0a5 5 0 1 0-10 0z M17 18a5 5 0 1 0 10 0a5 5 0 1 0-10 0z M15 17q1-1.5 2 0 M5 16l-2-2.5 M27 16l2-2.5',
	nib: 'M16 3L25 15L16 29L7 15Z M16 29V17 M16 13a2 2 0 1 0 0 4a2 2 0 1 0 0-4z',
	keyhole: 'M16 6a5 5 0 1 0 0 10a5 5 0 1 0 0-10z M13.5 15.5L11 26h10l-2.5-10.5',
	keyboard: 'M3 9h26v15H3z M7.5 14h1 M12.5 14h1 M17.5 14h1 M22.5 14h1 M10 19h12',
	laptop: 'M7 7h18v13H7z M3 24h26l-2 3H5z',
};

export function candidateIcon(key: string, id: string) {
	if (key === 'mug') return faviconMug(id);
	return `<rect width="32" height="32" rx="7" style="fill:var(--c-line)"/><path d="${candidateShapes[key]}" style="${line(2.4)}"/>`;
}
