/*
  ジャンル（カテゴリ）の一覧
  ここに1項目足すだけで、次のものが自動でそろいます。
  - 記事のフロントマター `category:` で使える値
  - ジャンル一覧ページ（/categories/）とジャンル別ページ（/categories/◯◯/）
  - カードや記事ページのジャンル表示

  色ではなく「アイコン＋文字ラベル」で見分けるので、色の指定はありません。
  icon には src/data/icons.ts にある名前を指定します。
*/
import type { IconName } from './icons';

export interface Category {
	slug: string; // URL に使う英小文字の名前
	label: string; // 画面に表示する名前
	icon: IconName;
	description: string; // ジャンルページの説明文
}

export const categories = [
	{
		slug: 'tech',
		label: '技術',
		icon: 'code',
		description: 'AWS・React・Flutter・Linux など、学んだ技術の記録。',
	},
	{ slug: 'math', label: '数学', icon: 'sigma', description: '元数学教諭として、数学のおもしろさを。' },
	{
		slug: 'stationery',
		label: '文房具',
		icon: 'pen',
		description: '万年筆・ボールペン・ノートのこと。',
	},
	{ slug: 'keyboard', label: 'キーボード', icon: 'keyboard', description: '打ち心地を求めて。' },
	{ slug: 'coffee', label: 'コーヒー', icon: 'cup', description: '毎日の一杯と、道具の話。' },
	{ slug: 'glasses', label: 'メガネ', icon: 'glasses', description: 'フレーム選びとお手入れ。' },
	{ slug: 'dog', label: '愛犬', icon: 'paw', description: '白いペキニーズとの暮らし。' },
	{ slug: 'parenting', label: '子育て', icon: 'sprout', description: '父親として、日々学んでいること。' },
	{ slug: 'diary', label: '日々のこと', icon: 'notebook', description: 'ジャンルにおさまらない、日々の記録。' },
] as const satisfies readonly Category[];

export type CategorySlug = (typeof categories)[number]['slug'];

// フロントマターの検証（content.config.ts）で使う slug の配列
export const categorySlugs = categories.map((c) => c.slug) as [CategorySlug, ...CategorySlug[]];

// slug からジャンル情報を取り出す
export function getCategory(slug: CategorySlug): Category {
	return categories.find((c) => c.slug === slug)!;
}
