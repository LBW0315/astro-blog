/*
  アイコンの形データ（すべて自作のシンプルな線画）
  24×24 のマス目に、線（stroke）で描いています。
  [タグ名, 属性] の配列を Icon.astro が <svg> に組み立てます。
  新しいアイコンを足すときは、ここに1項目追加してください。
*/

type Shape = [tag: 'path' | 'circle' | 'rect', attrs: Record<string, string | number>];

export const icons = {
	/* ----- ジャンル用 ----- */
	code: [
		['path', { d: 'M8 7l-5 5 5 5' }],
		['path', { d: 'M16 7l5 5-5 5' }],
		['path', { d: 'M13.5 5l-3 14' }],
	],
	sigma: [['path', { d: 'M17.5 5H6.5l5.5 7-5.5 7h11' }]],
	pen: [
		['path', { d: 'M12 21l-5-8.5L9 4h6l2 8.5z' }],
		['path', { d: 'M12 21v-7.5' }],
		['circle', { cx: 12, cy: 11.5, r: 1.3 }],
	],
	keyboard: [
		['rect', { x: 2.5, y: 6, width: 19, height: 12, rx: 2.5 }],
		['path', { d: 'M6.5 10h.01M10 10h.01M14 10h.01M17.5 10h.01M8 14h8' }],
	],
	cup: [
		['path', { d: 'M4 10h12v4a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z' }],
		['path', { d: 'M16 11.5h1.5a2.5 2.5 0 0 1 0 5H16' }],
		['path', { d: 'M8 3.5c-.8.9-.8 2.2 0 3.2M12 3.5c-.8.9-.8 2.2 0 3.2' }],
	],
	glasses: [
		['circle', { cx: 6.5, cy: 14, r: 3.5 }],
		['circle', { cx: 17.5, cy: 14, r: 3.5 }],
		['path', { d: 'M10 13.5c1.2-.9 2.8-.9 4 0' }],
		['path', { d: 'M3 13.5l1.8-6.5M21 13.5l-1.8-6.5' }],
	],
	paw: [
		['circle', { cx: 6.5, cy: 10.5, r: 1.8 }],
		['circle', { cx: 10, cy: 6.5, r: 1.8 }],
		['circle', { cx: 14, cy: 6.5, r: 1.8 }],
		['circle', { cx: 17.5, cy: 10.5, r: 1.8 }],
		[
			'path',
			{
				d: 'M12 12c-2.8 0-5 2.8-5 5 0 1.6 1.2 2.5 2.6 2.5 1 0 1.6-.5 2.4-.5s1.4.5 2.4.5c1.4 0 2.6-.9 2.6-2.5 0-2.2-2.2-5-5-5z',
			},
		],
	],
	sprout: [
		['path', { d: 'M12 21v-9' }],
		['path', { d: 'M12 12C12 8 9.5 5.5 5 5.5c0 4 2.5 6.5 7 6.5z' }],
		['path', { d: 'M12 14.5c0-3.5 2.4-5.8 7-5.8 0 3.5-2.4 5.8-7 5.8z' }],
	],
	notebook: [
		['rect', { x: 5, y: 3, width: 14, height: 18, rx: 2 }],
		['path', { d: 'M9 8h6M9 12h6M9 16h3.5' }],
	],

	/* ----- 画面の操作用 ----- */
	sun: [
		['circle', { cx: 12, cy: 12, r: 4 }],
		[
			'path',
			{
				d: 'M12 2.5v2M12 19.5v2M4.6 4.6L6 6M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4L6 18M18 6l1.4-1.4',
			},
		],
	],
	moon: [['path', { d: 'M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z' }]],
	copy: [
		['rect', { x: 9, y: 9, width: 11, height: 11, rx: 2 }],
		['path', { d: 'M5 15h-.5A1.5 1.5 0 0 1 3 13.5v-9A1.5 1.5 0 0 1 4.5 3h9A1.5 1.5 0 0 1 15 4.5V5' }],
	],
	check: [['path', { d: 'M5 12.5l4.5 4.5L19 7.5' }]],
	'arrow-up': [['path', { d: 'M12 19V5M6 11l6-6 6 6' }]],
	'arrow-right': [['path', { d: 'M5 12h14M13 6l6 6-6 6' }]],
	'arrow-left': [['path', { d: 'M19 12H5M11 6l-6 6 6 6' }]],
	'chevron-down': [['path', { d: 'M6 9l6 6 6-6' }]],
	calendar: [
		['rect', { x: 3.5, y: 5, width: 17, height: 15.5, rx: 2 }],
		['path', { d: 'M3.5 10h17M8 3v4M16 3v4' }],
	],
	refresh: [
		['path', { d: 'M19.5 10A8 8 0 0 0 5 7.5' }],
		['path', { d: 'M4.5 3.5v4h4' }],
		['path', { d: 'M4.5 14A8 8 0 0 0 19 16.5' }],
		['path', { d: 'M19.5 20.5v-4h-4' }],
	],
	clock: [
		['circle', { cx: 12, cy: 12, r: 8.5 }],
		['path', { d: 'M12 7.5V12l3 2' }],
	],
	info: [
		['circle', { cx: 12, cy: 12, r: 9 }],
		['path', { d: 'M12 11v5.5M12 7.8h.01' }],
	],
	lightbulb: [
		['path', { d: 'M9.5 18h5M10.5 21h3' }],
		[
			'path',
			{
				d: 'M12 3a6 6 0 0 0-3.6 10.8c.7.5 1.1 1.2 1.1 2V16h5v-.2c0-.8.4-1.5 1.1-2A6 6 0 0 0 12 3z',
			},
		],
	],
	alert: [
		['path', { d: 'M10.3 4.4L2.6 18a2 2 0 0 0 1.7 3h15.4a2 2 0 0 0 1.7-3L13.7 4.4a2 2 0 0 0-3.4 0z' }],
		['path', { d: 'M12 9.5V14M12 17.3h.01' }],
	],
	list: [['path', { d: 'M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01' }]],
	grid: [
		['rect', { x: 3.5, y: 3.5, width: 7, height: 7, rx: 2 }],
		['rect', { x: 13.5, y: 3.5, width: 7, height: 7, rx: 2 }],
		['rect', { x: 3.5, y: 13.5, width: 7, height: 7, rx: 2 }],
		['rect', { x: 13.5, y: 13.5, width: 7, height: 7, rx: 2 }],
	],
	user: [
		['circle', { cx: 12, cy: 8.5, r: 4 }],
		['path', { d: 'M4.5 20.5c1.2-3.8 4-5.5 7.5-5.5s6.3 1.7 7.5 5.5' }],
	],
	rss: [
		['path', { d: 'M5 11a8 8 0 0 1 8 8M5 5a14 14 0 0 1 14 14' }],
		['circle', { cx: 6, cy: 18, r: 1.2 }],
	],
	ear: [
		['path', { d: 'M7 9a5 5 0 0 1 10 0c0 3-3 4-3 7a3 3 0 0 1-6 .5' }],
		['path', { d: 'M10 9.5a2 2 0 0 1 4 0c0 1.2-1.5 1.8-1.5 3' }],
	],
} satisfies Record<string, Shape[]>;

export type IconName = keyof typeof icons;
