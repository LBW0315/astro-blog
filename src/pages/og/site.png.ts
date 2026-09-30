/*
  サイト共通の OGP 画像（/og/site.png）
  記事以外のページ（トップ・一覧・ジャンル・プロフィールなど）で使う
*/
import type { APIRoute } from 'astro';
import illustration from '../../assets/og/illustration.svg?raw';
import { SITE_SUBTITLE_JA } from '../../consts';
import { renderOgImage } from '../../lib/og';

export const GET: APIRoute = async () => {
	const png = await renderOgImage({
		title: '技術・道具・考え方・子育てのことを、こつこつ書いています。',
		categoryLabel: SITE_SUBTITLE_JA,
		illustration,
	});
	return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
