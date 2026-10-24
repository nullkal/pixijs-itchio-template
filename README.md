# PixiJS itch.io Template

PixiJS・TypeScript・Vite を使って、itch.io で公開するブラウザーゲームを開発するためのプロジェクトです。このリポジトリをコピーして、ゲームの実装を進められます。

キャンバスは表示領域いっぱいに広がり、ウィンドウのリサイズや画面回転に追従します。itch.io の埋め込みでは、埋め込み枠のサイズに合わせて表示します。

## 開発を始める

### mise を使う場合

[mise](https://mise.jdx.dev/getting-started) をインストールした環境で、リポジトリのルートから次を実行してください。

```sh
mise trust
mise run setup
mise run dev
```

`mise trust` は内容を確認したプロジェクト設定を信頼する操作です。`mise run setup` は必要な Node.js・pnpm を準備して、ロックファイルに従って依存関係をインストールします。シェルへの mise の組み込みは必須ではありません。

Node.js は `mise.toml` の 24 系、pnpm は `package.json` の `packageManager` を使用します。pnpm のバージョンは二重管理しません。この設定には、`package.json` からの pnpm バージョン検出に対応した新しい mise を使用してください（確認環境: 2026.10.18）。

```sh
mise run check # 整形・lint・型チェック・単体テスト
mise run test  # 単体テストのみ
mise run build # 検証と本番ビルド
```

その他の pnpm コマンドも `mise exec -- pnpm test:watch` のように実行できます。mise のタスクは既存の pnpm コマンドを呼び出します。個人用の上書きは Git 管理対象外の `mise.local.toml` に記述してください。Butler はこのセットアップに含めず、公開時に別途用意します。

### ツールを個別に用意する場合

次のツールを用意してください。

- Node.js（このプロジェクトでは 24 系で動作確認）
- pnpm（使用バージョンは `package.json` の `packageManager` を参照）
- Butler（itch.io へのアップロード時のみ必要。別途インストール）

```sh
pnpm install --frozen-lockfile
pnpm dev
```

開発サーバーが起動し、ブラウザーが開きます。既定の URL は `http://localhost:8080` です。ポートが使用中の場合は、ターミナルに表示される URL を確認してください。

コピーして開発を始める際は、`package.json` の `name` と `index.html` のタイトルをゲームに合わせて変更してください。`src/main.ts` のウサギが回転する処理を起点に、ゲームを実装できます。

## ディレクトリ構成

```text
src/
  main.ts          # PixiJS の初期化とゲームの起動
  assets/          # import して使用する画像などのゲーム素材
  vite-env.d.ts    # Vite の型定義
public/
  style.css        # 全画面表示用のスタイル
index.html         # ゲームの HTML
vite.config.ts     # 開発サーバーとビルドの設定
vitest.config.ts   # Node 環境の単体テスト設定
mise.toml          # 開発ツールとタスクの設定
.github/workflows/ci.yml # GitHub Actions の検証と本番ビルド
dist/              # ビルド時に生成される公開用ファイル
```

ゲームロジックは役割ごとに `src/` 内へ分割してください。`dist/` は直接編集しません。`index.html` の `#game-container` は CSS・TypeScript の参照と一致させてください。

## 素材の読み込み

素材を `src/assets/` に配置し、import で URL を取得して PixiJS に渡します。次は `src/main.ts` から画像を読み込む例です。

```ts
import { Assets } from "pixi.js";
import bunnyUrl from "./assets/bunny.png";

const texture = await Assets.load(bunnyUrl);
```

サブフォルダー内の素材も `import playerUrl from "./assets/images/player.png"` のように指定します。Vite が公開先に合わせて URL を生成するため、`import.meta.env.BASE_URL` の手動連結は不要です。

参照された素材はビルド時にハッシュ付きのファイル名で出力され、小さい素材はデータ URL として埋め込まれる場合があります。未参照の素材は出力されません。詳細は [Vite のアセット処理](https://v6.vite.dev/guide/assets)を参照してください。ファイル名を変えずに配信したい静的ファイルは `public/` に配置できます。

itch.io のサブディレクトリ配信に対応するため、Vite の `base: "./"` を維持してください。実行時の素材読み込みに `/assets/...` のようなドメイン直下を指すパスを使わないでください。

## コマンド

| コマンド                      | 内容                                         |
| ----------------------------- | -------------------------------------------- |
| `pnpm dev` / `pnpm start`     | 開発サーバーを起動                           |
| `pnpm format`                 | Prettier で整形                              |
| `pnpm format:check`           | 整形状態を確認                               |
| `pnpm lint`                   | ESLint で検証                                |
| `pnpm typecheck`              | TypeScript の型チェック                      |
| `pnpm check`                  | 整形・lint・型チェック・単体テストを順に実行 |
| `pnpm test`                   | 単体テストを1回実行                          |
| `pnpm test:watch`             | 変更を監視して単体テストを実行               |
| `pnpm build`                  | `pnpm check` の成功後に本番ビルド            |
| `pnpm exec vite preview`      | ビルド済みの `dist/` をローカルで確認        |
| `pnpm itch:login`             | Butler で itch.io にログイン                 |
| `pnpm deploy USER/GAME:html5` | ビルドして itch.io にアップロード            |

変更後は `pnpm check` でまとめて検証できます。どれかが失敗すると、その時点で停止します。

```sh
pnpm check
```

本番ビルドと表示も確認する場合は、次のコマンドを実行してください。`pnpm build` にも同じ検証が含まれるため、直前に `pnpm check` を別途実行する必要はありません。

```sh
pnpm build
pnpm exec vite preview
```

ブラウザーで素材の読み込み、ゲームの起動、リサイズ、モバイルの縦横表示、不要なスクロールの有無を確認してください。プレビューサーバーはローカル確認用です。

## 単体テスト

Vitest を Node 環境で使用します。テストファイルは対象モジュールの隣に `*.test.ts` として配置してください。例えば `src/score.ts` のテストは `src/score.test.ts` に書きます。

`describe`・`it`・`expect` などは `vitest` から明示的にインポートし、テスト名は日本語で期待する動作を記述してください。現在はテストファイルがありません。Vitest はテスト0件でも成功する設定です。ゲームロジックのテストを追加したら、`vitest.config.ts` の `passWithNoTests` を削除してください。

```sh
pnpm test                    # 全単体テストを1回実行
pnpm test:watch              # 開発中の変更を監視
# src/score.test.ts を追加した場合
pnpm test src/score.test.ts  # ファイルを指定して実行
```

スコア計算、当たり判定、状態遷移などは、描画やブラウザー API に依存しない関数・クラスへ分離するとテストしやすくなります。起動処理を含む `src/main.ts` はテストから読み込まず、対象のロジックだけをインポートしてください。

E2E テストやカバレッジ基準は未導入です。単体テストは `pnpm check` と `pnpm build` に含まれます。

## GitHub Actions

`.github/workflows/ci.yml` で、push・プルリクエストの作成や更新・手動実行時に検証と本番ビルドを実行します。

- Ubuntu 上の Node.js 24 を使用します。
- [pnpm/setup](https://github.com/pnpm/setup) で `package.json` の `packageManager` に指定した pnpm を準備し、ストアをキャッシュします。
- `pnpm install --frozen-lockfile` で依存関係を再現し、ロックファイルとの不整合を検出します。
- `pnpm build` で整形・lint・型チェック・単体テスト・本番ビルドを実行します。

GitHub にファイルを push すると、Actions タブで結果を確認できます。手動実行は、このワークフローを既定のブランチに追加した後、Actions タブの「CI」から行います。CI は検証のみで、itch.io へのアップロードは行いません。

## itch.io への公開

### 初回の準備

1. [公式手順](https://itch.io/docs/butler/installing.html)に従って Butler をインストールし、`butler version` が実行できる状態にします。
2. itch.io にゲームのプロジェクトページを作成します。
3. 次のコマンドを実行し、ブラウザーで認証します。

```sh
pnpm itch:login
```

### アップロード

公開先を確認して、次のコマンドを実行してください。

```sh
pnpm deploy USER/GAME:html5
```

`USER` はアカウント名、`GAME` はゲームページの URL スラッグです。例えば `https://example.itch.io/my-game` なら、`example/my-game:html5` を指定します。`html5` はアップロード先のチャンネル名です。

ビルドが成功すると、Butler が `dist/` の内容をアップロードします。ZIP の作成は不要です。更新時も同じ公開先とチャンネルを指定してください。

初回アップロード後は itch.io の編集画面でプロジェクトを HTML ゲームに設定し、アップロードしたファイルをブラウザーでプレイする対象に指定します。チャンネル名を `html5` にするだけでは、この設定は行われません。詳細は [Butler の公式ガイド](https://itch.io/docs/butler/pushing.html)を参照してください。

アップロード後は itch.io 上でも起動と素材の読み込みを確認してください。認証情報や API キーはリポジトリに含めないでください。

## 開発ガイド

作業方針、コーディング規約、コミット・プルリクエストの書き方は [AGENTS.md](AGENTS.md) を参照してください。
