/*
  記事データを扱う便利関数
  ページごとに同じ処理を書かなくて済むよう、ここにまとめています。
*/
import { type CollectionEntry, getCollection } from 'astro:content';
import type { CategorySlug } from '../data/categories';

export type Post = CollectionEntry<'blog'>;

// すべての記事を新しい順に並べて返す
export async function getPosts(): Promise<Post[]> {
	const posts = await getCollection('blog');
	return posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

// 指定したジャンルの記事だけを返す
export async function getPostsByCategory(slug: CategorySlug): Promise<Post[]> {
	return (await getPosts()).filter((post) => post.data.category === slug);
}

// 読了時間の目安（分）。日本語はおよそ1分500文字として計算
export function getReadingMinutes(body: string | undefined): number {
	if (!body) return 1;
	// コードブロック・URL・記号を除いて、おおよその文字数を数える
	const text = body
		.replace(/```[\s\S]*?```/g, '')
		.replace(/https?:\/\/\S+/g, '')
		.replace(/[#>*_`\-[\]()!|]/g, '')
		.replace(/\s+/g, '');
	return Math.max(1, Math.round(text.length / 500));
}
