/*
  Web フォントの @font-face 定義をまとめて取り出す
  Astro 標準の <Font> 部品は定義をページの HTML に直接書き込みますが、
  日本語フォントは分割ファイルが約480個あり、定義だけで約370KBになります。
  全ページに毎回入ると重いので、1つの CSS ファイル（/fonts.css）に分けて
  ブラウザにキャッシュしてもらう方式にしています。

  ※ Astro の内部モジュールを使っているため、Astro を更新したときは
    ビルドが通るか、フォントが表示されるかを確認してください。
*/
// @ts-expect-error Astro の内部モジュール（型定義が公開されていない）
import { componentDataByCssVariable } from 'virtual:astro:assets/fonts/internal';

const FONT_VARIABLES = ['--font-zen-maru', '--font-biz-udp'];

export const fontCss: string = FONT_VARIABLES.map((v) => {
	const data = componentDataByCssVariable.get(v);
	if (!data) throw new Error(`フォント ${v} が astro.config.mjs に見つかりません`);
	return data.css as string;
}).join('\n');

// 中身が変わったら URL も変わるように、簡単なハッシュ値を作る（古いキャッシュ対策）
let h = 0;
for (let i = 0; i < fontCss.length; i++) h = (Math.imul(31, h) + fontCss.charCodeAt(i)) | 0;
export const fontCssVersion = (h >>> 0).toString(36);
