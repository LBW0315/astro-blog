// サイト全体で使う設定値
// どこからでも import して使えます。

// ===== サイト名とサブタイトル（変えるときはここだけ書き換える）=====
export const SITE_TITLE = 'BUNBOU';
export const SITE_SUBTITLE_EN = 'a digital study'; // 英語のサブタイトル
export const SITE_SUBTITLE_JA = 'ブンのデジタル書斎'; // 日本語のサブタイトル
export const SITE_TAGLINE = '継続は力なり'; // 合言葉（プロフィールページで使用）
export const SITE_MOTTO = 'One line at a time.'; // フッターに小さく添える一言

// ===== 書き手 =====
export const AUTHOR_NAME = 'ブン'; // 名前
export const AUTHOR_ROLE = '元数学教諭のQAエンジニア'; // 名前に添える肩書き
// 自己紹介文（プロフィールカードとプロフィールページで共通）。1要素が1行
export const AUTHOR_INTRO = [
	`はじめまして、${AUTHOR_NAME}です。元数学教諭で、今はIT企業でQAエンジニアをしています。`,
	'技術のことを中心に、好きな考え方や道具のこと、家族との日々のことを書いています。',
];

export const SITE_DESCRIPTION =
	'元数学教諭のQAエンジニアが、技術・道具・家づくり・考え方・子育てのことを、こつこつ書き続けるブログです。';

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

// フッターに小さく並べる、サイトの決まりごとのページ
// （ヘッダーのナビには出さず、フッターだけに置く）
export const FOOTER_LINKS = [
	{ href: '/privacy/', label: 'プライバシーポリシー' },
	{ href: '/contact/', label: 'お問い合わせ' },
] as const;

// ===== お問い合わせ（お問い合わせページで使用）=====
// Googleフォームの「送信」→リンクで出る公開用URL（forms.gle/... か .../viewform）。
// 編集画面のURL（.../edit）は入れないこと
export const CONTACT_FORM_URL = 'https://forms.gle/Y2A5zo9de6eGpT1R7';
