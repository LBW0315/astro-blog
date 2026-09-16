// サイト全体で使う設定値
// どこからでも import して使えます。

// ===== サイト名とサブタイトル（変えるときはここだけ書き換える）=====
export const SITE_TITLE = 'BUNBOU';
export const SITE_SUBTITLE_EN = 'a digital study'; // 英語のサブタイトル
export const SITE_SUBTITLE_JA = 'ブンのデジタル書斎'; // 日本語のサブタイトル
export const SITE_TAGLINE = '継続は力なり'; // トップページのヒーローに出す合言葉

// ===== 書き手 =====
export const AUTHOR_NAME = 'ブン'; // 名前
export const AUTHOR_ROLE = '元数学教諭のQAエンジニア'; // 名前に添える肩書き

export const SITE_DESCRIPTION =
	'元数学教諭のQAエンジニアが、技術・数学・文房具・コーヒーなど、好きなことをこつこつ書き続けるブログです。';

// ブラウザのタブに出すページタイトルを作る
// 例：pageTitle('記事一覧') → 「記事一覧 | BUNBOU」
// ページ名がないとき（トップページ）は「ブンのデジタル書斎 | BUNBOU」
export function pageTitle(name?: string): string {
	return `${name ?? SITE_SUBTITLE_JA} | ${SITE_TITLE}`;
}

// ヘッダーのナビゲーション
export const NAV_LINKS = [
	{ href: '/blog/', label: '記事一覧', icon: 'list' },
	{ href: '/categories/', label: 'ジャンル', icon: 'grid' },
	{ href: '/about/', label: 'プロフィール', icon: 'user' },
] as const;
