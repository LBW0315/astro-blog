/*
  記事ごとの OGP 画像（/og/記事名.png）
  ビルド時に1枚ずつ PNG を作って dist に置く
  変わるのはタイトルとジャンルだけで、イラストは全記事で同じものを使う
*/
import type { APIRoute } from 'astro';
import illustration from '../../assets/og/illustration.svg?raw';
import { getCategory } from '../../data/categories';
import { getPosts, type Post } from '../../lib/posts';
import { renderOgImage } from '../../lib/og';

export async function getStaticPaths() {
	const posts = await getPosts();
	return posts.map((post) => ({ params: { slug: post.id }, props: { post } }));
}

export const GET: APIRoute = async ({ props }) => {
	const { post } = props as { post: Post };
	const png = await renderOgImage({
		title: post.data.title,
		categoryLabel: getCategory(post.data.category).label,
		illustration,
	});
	return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
