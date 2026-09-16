// サイト全体で使う設定値
// どこからでも import して使えます。

// サイト名（仮の名前です。決まったらここを書き換えてください）
export const SITE_TITLE = 'こつこつノート';
export const SITE_TAGLINE = '継続は力なり';
export const SITE_DESCRIPTION =
	'元数学教諭のQAエンジニアが、技術・数学・文房具・コーヒーなど、好きなことをこつこつ書き続けるブログです。';

// ヘッダーのナビゲーション
export const NAV_LINKS = [
	{ href: '/blog/', label: '記事一覧', icon: 'list' },
	{ href: '/categories/', label: 'ジャンル', icon: 'grid' },
	{ href: '/about/', label: 'プロフィール', icon: 'user' },
] as const;
