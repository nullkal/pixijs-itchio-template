# PixiJS itch.io Template

itch.io 向けブラウザーゲームのテンプレートです。ゲーム描画に PixiJS、フォームなどの UI に React・MUI、共有状態に Zustand を使用します。サンプルでは、ゲーム内のボタンから名前入力ダイアログを開き、入力結果をゲーム画面に表示します。

## 開発を始める

リポジトリをコピーし、[mise](https://mise.jdx.dev/getting-started) をインストールした環境で実行してください。

```sh
mise trust
mise run setup
mise run dev
```

Node.js・pnpm と依存関係が準備され、開発サーバーが起動します。既定の URL は `http://localhost:8080` です。ポートが使用中の場合はターミナルの表示を確認してください。

mise を使わない場合は、[mise.toml](mise.toml) の Node.js と [package.json](package.json) の `packageManager` に指定された pnpm を用意して実行します。

```sh
pnpm install --frozen-lockfile
pnpm dev
```

最初に `package.json` の `name` と [src/App.tsx](src/App.tsx) の `<title>` を自分のゲームに合わせて変更してください。

## 実装の入口

| 変更するもの           | 主な場所                                                   |
| ---------------------- | ---------------------------------------------------------- |
| ゲーム本体             | [src/game/init.ts](src/game/init.ts)                       |
| ゲーム素材             | `src/game/assets/`                                         |
| UI・テーマ・タイトル   | [src/App.tsx](src/App.tsx)、`src/overlay/`                 |
| ゲームと UI の共有状態 | [src/overlay/overlayStore.ts](src/overlay/overlayStore.ts) |

ゲーム本体は React に依存せず、Zustand のストアを直接利用できます。新しいダイアログは `overlay/name/` を参考に機能別フォルダーへ追加し、`Overlay.tsx` と全体ストアに接続します。React とゲームの起動・終了の接続は `game/Game.tsx` が担当します。

高解像度ディスプレイでは最大2倍で描画します。画質と負荷を調整する場合は `game/init.ts` の `maxResolution` を変更してください。

## 素材の読み込み

`src/game/assets/` に置いた素材を import し、PixiJS に渡します。

```ts
// src/game/init.ts
import { Assets } from "pixi.js";
import bunnyUrl from "./assets/bunny.png";

const texture = await Assets.load(bunnyUrl);
```

itch.io はサブディレクトリから配信するため、`vite.config.ts` の `base: "./"` を維持してください。実行時の素材 URL に `/assets/...` のようなドメイン直下のパスを使わないでください。

## コマンド

| コマンド                 | 用途                               |
| ------------------------ | ---------------------------------- |
| `pnpm dev`               | 開発サーバー                       |
| `pnpm format`            | 整形                               |
| `pnpm check`             | 整形・lint・型チェック・単体テスト |
| `pnpm test:watch`        | 単体テストの監視実行               |
| `pnpm build`             | 検証と本番ビルド（`dist/`）        |
| `pnpm exec vite preview` | 本番ビルドのローカル確認           |

変更後は `pnpm check`、公開前は `pnpm build` を実行してください。`build` にも同じ検証が含まれます。mise 環境では `mise run check`・`mise run build`、その他のコマンドは `mise exec -- pnpm …` で実行できます。

描画を変更したらブラウザーで起動・操作・リサイズ・モバイルの縦横表示を確認してください。GitHub Actions も `pnpm build` を実行しますが、表示確認と itch.io への公開は行いません。

## itch.io への公開

1. [Butler](https://itch.io/docs/butler/installing.html) を別途インストールします（mise のセットアップには含みません）。
2. itch.io にゲームのプロジェクトページを作成します。
3. 次のコマンドで認証し、公開先を確認してアップロードします。

```sh
pnpm itch:login
pnpm deploy USER/GAME:html5
```

`USER/GAME` はゲームページの URL に対応します。例えば `https://example.itch.io/my-game` なら `example/my-game:html5` です。ビルド成功後に `dist/` をアップロードするため、ZIP の作成は不要です。

初回は itch.io の編集画面でプロジェクトを HTML ゲームに設定し、アップロードしたファイルをブラウザーでプレイする対象に指定してください。チャンネル名を `html5` にするだけでは設定されません。詳しくは [Butler の公開ガイド](https://itch.io/docs/butler/pushing.html)を参照してください。

公開後は itch.io 上でもゲームの起動と素材の読み込みを確認してください。

作業方針・コーディング規約・PR の作り方は [AGENTS.md](AGENTS.md) にまとめています。
