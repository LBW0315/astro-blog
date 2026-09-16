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
	{
		slug: 'tools',
		label: '道具',
		icon: 'pen',
		description: '万年筆やノート、キーボード、コーヒー、メガネなど、好きな道具のこと。',
	},
	{
		slug: 'thinking',
		label: '考え方',
		icon: 'lightbulb',
		description: '日々の中で考えたことや、物事の捉え方。',
	},
	{
		slug: 'parenting',
		label: '子育て',
		icon: 'sprout',
		description: '父親として、日々学んでいること。',
	},
] as const satisfies readonly Category[];

export type CategorySlug = (typeof categories)[number]['slug'];

// フロントマターの検証（content.config.ts）で使う slug の配列
export const categorySlugs = categories.map((c) => c.slug) as [CategorySlug, ...CategorySlug[]];

// slug からジャンル情報を取り出す
export function getCategory(slug: CategorySlug): Category {
	return categories.find((c) => c.slug === slug)!;
}
