// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig, fontProviders } from 'astro/config';
import { a11yCodeTransformer } from './src/lib/shiki-a11y.mjs';

// https://astro.build/config
export default defineConfig({
	// サイトの公開URL。サイトマップ・RSS・OGP の URL がここから作られる
	site: 'https://bun-bou.com',
	integrations: [mdx(), sitemap()],

	// ページ遷移時に、次のページへ移動しそうなリンクを先読みして表示を速くする
	prefetch: true,

	// Web フォント（Google Fonts）
	// Astro が Google Fonts からファイルを取得して自分のサイトから配信する。
	// 日本語フォントは文字ごとに小さく分割されているので、ページで使う文字の分だけ読み込まれる。
	fonts: [
		{
			// ロゴ「BUNBOU」用：細めで字間を広げても美しい英字フォント（英字だけなので軽い）
			provider: fontProviders.google(),
			name: 'Jost',
			cssVariable: '--font-jost',
			weights: [300],
			styles: ['normal'],
			subsets: ['latin'],
			display: 'swap',
			fallbacks: ['Avenir Next', 'Helvetica Neue', 'Segoe UI', 'sans-serif'],
		},
		{
			// 見出し用：柔らかい丸ゴシック
			provider: fontProviders.google(),
			name: 'Zen Maru Gothic',
			cssVariable: '--font-zen-maru',
			weights: [500, 700],
			styles: ['normal'],
			display: 'swap', // フォントが届くまでは標準フォントで先に表示する
			fallbacks: ['Hiragino Maru Gothic ProN', 'sans-serif'],
		},
		{
			// 本文用：読みやすさを重視したユニバーサルデザイン書体
			provider: fontProviders.google(),
			name: 'BIZ UDPGothic',
			cssVariable: '--font-biz-udp',
			weights: [400, 700],
			styles: ['normal'],
			display: 'swap',
			fallbacks: ['Hiragino Sans', 'Yu Gothic UI', 'Meiryo', 'sans-serif'],
		},
	],

	markdown: {
		shikiConfig: {
			// ライト／ダークの2テーマを出力し、CSS で切り替える
			themes: { light: 'github-light', dark: 'github-dark' },
			transformers: [a11yCodeTransformer()],
		},
	},
});
