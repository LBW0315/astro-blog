/*
  SNS でシェアされたときに出る画像（OGP 画像）を、ビルド時に1記事ずつ作る

  仕組み
  1. satori … 文字と枠を並べた「絵の設計図」を SVG にする。
     文字はフォントのまま埋め込まずに図形へ変換されるので、
     GitHub Actions のように日本語フォントが入っていない環境でも文字化けしない。
  2. sharp … その SVG を PNG にする（X や Facebook は SVG を表示できないため）

  文字に使うフォントは、サイトの見出しと同じ Zen Maru Gothic（丸ゴシック）です。
*/
import { readFileSync } from 'node:fs';
import path from 'node:path';
import satori from 'satori';
import sharp from 'sharp';

// ビルド時にだけ読むので、プロジェクトの場所から直接たどる
// （このファイルはビルド後に別の場所へまとめられるため、相対指定は使えない）
const font = readFileSync(path.join(process.cwd(), 'src/assets/og/ZenMaruGothic-Bold.ttf'));

// サイトの色（src/styles/tokens.css のライトテーマと同じ値）
const COLOR = {
	bg: '#faf8f5',
	surface: '#fffdfb',
	line: '#e3dcd4',
	text: '#26221f',
	textSub: '#5e564f',
	accent: '#2a6058',
	accentWash: '#e6f0ee',
};

const WIDTH = 1200;
const HEIGHT = 630;

interface OgOptions {
	title: string;
	categoryLabel: string;
	illustration: string; // SVG の中身をそのまま渡す
}

// satori は React の要素の形（{ type, props }）を受け取るので、それを手で組み立てる
type Node = { type: string; props: Record<string, unknown> };
const el = (type: string, style: Record<string, unknown>, children?: unknown): Node => ({
	type,
	props: children === undefined ? { style } : { style, children },
});

// 長いタイトルで画像からあふれないように、文字数に応じて大きさを変える
const titleSize = (title: string) => (title.length <= 22 ? 60 : title.length <= 34 ? 52 : 44);

export async function renderOgImage({ title, categoryLabel, illustration }: OgOptions) {
	const illustrationUrl = `data:image/svg+xml;base64,${Buffer.from(illustration).toString('base64')}`;

	const card = el(
		'div',
		{
			display: 'flex',
			flexDirection: 'column',
			width: WIDTH,
			height: HEIGHT,
			backgroundColor: COLOR.bg,
			fontFamily: 'Zen Maru Gothic',
		},
		[
			// 上辺の青磁色の線
			el('div', { width: WIDTH, height: 12, backgroundColor: COLOR.accent }),
			el(
				'div',
				{ display: 'flex', flex: 1, padding: '56px 64px', alignItems: 'center' },
				[
					// 左：ジャンル・タイトル
					el(
						'div',
						{ display: 'flex', flexDirection: 'column', flex: 1, paddingRight: 48 },
						[
							el(
								'div',
								{
									display: 'flex',
									alignSelf: 'flex-start',
									padding: '10px 24px',
									borderRadius: 999,
									backgroundColor: COLOR.accentWash,
									color: COLOR.accent,
									fontSize: 28,
								},
								categoryLabel,
							),
							el(
								'div',
								{
									display: 'flex',
									marginTop: 32,
									color: COLOR.text,
									fontSize: titleSize(title),
									lineHeight: 1.45,
								},
								title,
							),
						],
					),
					// 右：記事の中身をあらわすイラスト
					{
						type: 'img',
						props: { src: illustrationUrl, width: 360, height: 360 },
					},
				],
			),
			// 下辺：サイト名
			el(
				'div',
				{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					padding: '0 64px 48px',
				},
				[
					el('div', { display: 'flex', color: COLOR.text, fontSize: 34, letterSpacing: 6 }, 'BUNBOU'),
					el('div', { display: 'flex', color: COLOR.textSub, fontSize: 26 }, 'bun-bou.com'),
				],
			),
		],
	);

	const svg = await satori(card as never, {
		width: WIDTH,
		height: HEIGHT,
		fonts: [{ name: 'Zen Maru Gothic', data: font, weight: 700, style: 'normal' }],
	});

	return sharp(Buffer.from(svg)).png().toBuffer();
}

export { COLOR as OG_COLOR };
