/*
  コードブロックを整える Shiki の変換処理（transformer）
  1. テーマの色のうち、背景とのコントラスト比が 4.5:1 に届かない色を、少し濃い色に置き換える
  2. <pre> を .code-block で包み、言語名とコピーボタンを置く見出し行を付ける
     （ビルド時に作るので、ページ表示後にレイアウトがずれない）
*/

// ライトテーマ（github-light）で基準に届かない色 → 置き換え後の色（背景 #F2EEE9 との比）
const LIGHT = {
	'#6a737d': '#5b6470', // コメント 4.17 → 5.19
	'#22863a': '#1b6e2f', // 4.01 → 5.48
	'#d73a49': '#b02a38', // キーワード 3.96 → 5.62
	'#e36209': '#a04800', // 3.02 → 5.31
};
// ダークテーマ（github-dark）で基準に届かない色（背景 #2A2725 との比）
const DARK = {
	'#6a737d': '#9aa3ad', // コメント 3.08 → 5.81
};

// "color:#D73A49;--shiki-dark:#F97583" のような style 文字列の色を置き換える
function fixStyle(style) {
	return style
		.split(';')
		.map((decl) => {
			const [prop, value] = decl.split(':');
			if (!value) return decl;
			const key = value.trim().toLowerCase();
			if (prop.trim() === 'color' && LIGHT[key]) return `${prop}:${LIGHT[key]}`;
			if (prop.trim() === '--shiki-dark' && DARK[key]) return `${prop}:${DARK[key]}`;
			return decl;
		})
		.join(';');
}

// 画面に出す言語名（よく使うものだけ読みやすく）
const LANG_LABELS = {
	js: 'JavaScript',
	javascript: 'JavaScript',
	ts: 'TypeScript',
	typescript: 'TypeScript',
	jsx: 'JSX',
	tsx: 'TSX',
	sh: 'Shell',
	bash: 'Bash',
	zsh: 'zsh',
	shell: 'Shell',
	html: 'HTML',
	css: 'CSS',
	json: 'JSON',
	yaml: 'YAML',
	yml: 'YAML',
	md: 'Markdown',
	markdown: 'Markdown',
	mdx: 'MDX',
	astro: 'Astro',
	dart: 'Dart',
	py: 'Python',
	python: 'Python',
	plaintext: 'テキスト',
	text: 'テキスト',
	txt: 'テキスト',
};

const el = (tagName, properties, children = []) => ({ type: 'element', tagName, properties, children });
const text = (value) => ({ type: 'text', value });

// ボタンのアイコン（src/data/icons.ts の copy / check と同じ形）
const svg = (className, children) =>
	el(
		'svg',
		{
			className: [className],
			viewBox: '0 0 24 24',
			fill: 'none',
			stroke: 'currentColor',
			strokeWidth: '1.75',
			strokeLinecap: 'round',
			strokeLinejoin: 'round',
			ariaHidden: 'true',
			focusable: 'false',
		},
		children,
	);
const copyIcon = () =>
	svg('code-block__icon-copy', [
		el('rect', { x: '9', y: '9', width: '11', height: '11', rx: '2' }),
		el('path', { d: 'M5 15h-.5A1.5 1.5 0 0 1 3 13.5v-9A1.5 1.5 0 0 1 4.5 3h9A1.5 1.5 0 0 1 15 4.5V5' }),
	]);
const checkIcon = () => svg('code-block__icon-check', [el('path', { d: 'M5 12.5l4.5 4.5L19 7.5' })]);

export function a11yCodeTransformer() {
	return {
		name: 'blog:a11y-code',
		// 1文字ずつの色（span）を置き換え
		span(node) {
			if (typeof node.properties.style === 'string') {
				node.properties.style = fixStyle(node.properties.style);
			}
		},
		// 全体を .code-block で包む
		root(root) {
			const pre = root.children.find((n) => n.type === 'element' && n.tagName === 'pre');
			if (!pre) return;
			const lang = String(this.options.lang ?? 'plaintext');
			const label = LANG_LABELS[lang.toLowerCase()] ?? lang;
			// キーボードでも横スクロールできるよう tabindex を付ける
			pre.properties.tabindex = '0';

			const head = el('div', { className: ['code-block__head'] }, [
				el('span', { className: ['code-block__lang'] }, [text(label)]),
				// コピーボタン。JavaScript が動く環境でだけ表示する（CSS で制御）
				el('button', { type: 'button', className: ['code-block__copy'], dataCopy: '' }, [
					copyIcon(),
					checkIcon(),
					el('span', { className: ['code-block__copy-label'] }, [text('コピー')]),
				]),
			]);
			root.children = [el('div', { className: ['code-block'] }, [head, pre])];
		},
	};
}
