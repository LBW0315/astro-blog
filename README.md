# Astroスターターキット：ブログ

```sh
npm create astro@latest -- --template blog
```

> 🧑‍🚀 **Astroに慣れていますか？** このファイルは削除して構いません。制作を楽しんでください！

主な機能：

- ✅ カスタマイズしやすい最小限のスタイル
- ✅ Lighthouseで高いパフォーマンス
- ✅ 正規URLとOpen Graphに対応したSEO設定
- ✅ サイトマップ対応
- ✅ RSSフィード対応
- ✅ Markdown・MDX対応

## 🚀 プロジェクト構成

Astroプロジェクトには、次のフォルダーとファイルがあります。

```text
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   ├── content/
│   ├── layouts/
│   └── pages/
├── astro.config.mjs
├── README.md
├── package.json
└── tsconfig.json
```

Astroは`src/pages/`ディレクトリ内の`.astro`ファイルや`.md`ファイルを検索し、ファイル名に基づいて各ページのURLを生成します。

`src/components/`は、Astro、React、Vue、Svelte、Preactなどのコンポーネントを置くためのディレクトリです。

`src/content/`には、関連するMarkdown・MDX文書の「コレクション」があります。`getCollection()`を使うと`src/content/blog/`から記事を取得でき、任意のスキーマでフロントマターの型を検証できます。詳しくは[Astroのコンテンツコレクション](https://docs.astro.build/ja/guides/content-collections/)をご覧ください。

画像などの静的ファイルは`public/`ディレクトリに配置できます。

## 🧞 コマンド

すべてのコマンドは、プロジェクトのルートディレクトリで実行します。

| コマンド                  | 内容                                             |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | 依存パッケージをインストール                     |
| `npm run dev`             | `localhost:4321`で開発サーバーを起動             |
| `npm run build`           | 公開用サイトを`./dist/`に生成                    |
| `npm run preview`         | 公開前のビルド結果をローカルで確認               |
| `npm run astro ...`       | `astro add`や`astro check`などのCLIを実行        |
| `npm run astro -- --help` | Astro CLIのヘルプを表示                          |

## 👀 さらに詳しく知る

[Astroの日本語ドキュメント](https://docs.astro.build/ja/)をご覧ください。質問や交流には[Discordサーバー](https://astro.build/chat)も利用できます。

## クレジット

このテーマは[Bear Blog](https://github.com/HermanMartinus/bearblog/)をもとにしています。
