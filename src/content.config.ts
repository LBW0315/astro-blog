import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { categorySlugs } from './data/categories';

const blog = defineCollection({
	// src/content/blog/ にある Markdown・MDX ファイルを読み込む
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	// フロントマターの型チェック（書き間違いをビルド時に教えてくれる）
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string(),
			pubDate: z.coerce.date(), // 公開日（文字列を日付に変換）
			updatedDate: z.coerce.date().optional(), // 更新日（任意）
			heroImage: z.optional(image()), // アイキャッチ画像（任意）
			// ジャンル。src/data/categories.ts にある slug のどれか
			category: z.enum(categorySlugs),
		}),
});

export const collections = { blog };
