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
	'元数学教諭のQAエンジニアが、技術・道具・考え方・子育てのことを、こつこつ書き続けるブログです。';

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

// ===== SNS（お問い合わせページで使用）=====
// 3つとも同じアカウント名なので、名前だけを1か所に置いてURLを組み立てる
export const SNS_ACCOUNT = 'lbw_0797';
export const SNS_LINKS = [
	{ label: 'X', href: `https://x.com/${SNS_ACCOUNT}` },
	{ label: 'Instagram', href: `https://www.instagram.com/${SNS_ACCOUNT}/` },
	{ label: 'Threads', href: `https://www.threads.com/@${SNS_ACCOUNT}` },
] as const;
