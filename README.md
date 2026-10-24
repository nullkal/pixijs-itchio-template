# PixiJS itch.io Template

PixiJS・React・MUI・Zustand・TypeScript・Vite を使って、itch.io で公開するブラウザーゲームを開発するためのプロジェクトです。このリポジトリをコピーして、ゲームの実装を進められます。

キャンバスは表示領域いっぱいに広がり、ウィンドウのリサイズや画面回転に追従します。itch.io の埋め込みでは、埋め込み枠のサイズに合わせて表示します。高解像度ディスプレイでは DPR（devicePixelRatio）に合わせ、最大2倍の解像度で描画します。

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

コピーして開発を始める際は、`package.json` の `name` と `src/App.tsx` の `<title>`をゲームに合わせて変更してください。`src/game/init.ts` のウサギが回転する処理を起点に、ゲームを実装できます。

## ディレクトリ構成

```text
src/
  main.tsx         # React のルートを起動
  App.tsx          # Game と Overlay の配置、共有ストア・テーマ・全体スタイル
  game/
    Game.tsx       # 表示先とゲームの起動・終了を React に接続
    init.ts        # PixiJS の初期化・描画・後片付け（React 非依存）
    assets/        # import して使用する画像などのゲーム素材
  overlay/
    Overlay.tsx    # オーバーレイの配置と機能の組み合わせ
    overlayStore.ts # 全体の開閉・各機能のストアの参照
    name/
      NameDialog.tsx # 名前入力ダイアログ
      nameStore.ts # 入力途中の名前・確定名・入力検証
  vite-env.d.ts    # Vite の型定義
index.html         # メタ情報、React の root、エントリーポイント
vite.config.ts     # 開発サーバーとビルドの設定
vitest.config.ts   # Node 環境の単体テスト設定
mise.toml          # 開発ツールとタスクの設定
.github/workflows/ci.yml # GitHub Actions の検証と本番ビルド
dist/              # ビルド時に生成される公開用ファイル
```

ゲームロジックは役割ごとに `src/` 内へ分割してください。`dist/` は直接編集しません。`index.html` の `#root` は `App.tsx` の全体スタイル・`src/main.tsx` の参照と一致させてください。

## ゲームと React UI の連携

サンプルは、PixiJS と React の間で状態をやり取りする流れを示します。

1. ゲーム画面の「名前を教える」ボタンをクリック・タップします。ボタンは PixiJS の Container・Graphics・Text で描画しています。
2. React・MUI の名前入力ダイアログが開き、ウサギの回転とゲームボタンの操作が止まります。
3. 名前を入力して「決定」を押すと、PixiJS の Text に「こんにちは、○○さん！」と表示されます。
4. 再度開くと確定済みの名前が入力されています。Escape・背景クリックで閉じた場合は名前を変更しません。

名前は前後の空白を除いて1〜20文字（Unicode コードポイント数）です。空欄や長すぎる名前ではエラーを表示し、ダイアログを閉じません。日本語入力中の変換確定 Enter では送信しません。名前はメモリー内だけに保持し、ページ再読み込みで初期化します。

React の `App` が `Game` と `Overlay` を子として配置します。`Game` は表示先とゲームの起動・終了を接続し、`Overlay` は機能ごとの UI を配置します。名前入力の UI と状態は `overlay/name/` にまとめています。`NameDialog` は名前ストアと `open`・`onConfirm`・`onClose` を受け取り、全体ストアには依存しません。全体ストアとの接続は `overlay/Overlay.tsx` が担当します。

`App` が作成する全体ストア（`overlay/overlayStore.ts`）は `activeDialog` と開閉操作を持ち、`name` から名前専用ストアを参照できます。どちらも Zustand の vanilla store で、React・MUI に依存しません。

```ts
// game/init.ts から、全体ストアを直接利用する。
store.getState().openName();
const unsubscribe = store.subscribe((state) => {
  if (state.activeDialog === null) {
    const name = state.name.getState().name;
    // 確定した名前を使い、PixiJS の挨拶表示を更新する。
  }
});

// ゲーム終了時に購読を解除する。
unsubscribe();
```

全体ストア（`store.getState()`）の操作:

- `openName()` は確定名を下書きにコピーして名前入力を開きます。すでに開いている場合は何もしません。
- `confirmName()` は名前を検証し、成功した場合だけ確定して閉じます。ゲーム側は全体ストアの変更通知から確定名を取得できます。
- `close()` は下書きを破棄して閉じます。確定名は変更しません。
- `reset()` は画面を閉じ、名前も初期化します。`App` のアンマウント時に呼び出します。

名前ストア（`store.getState().name`）は、確定値 `name`、入力途中の `draft`、検証エラー `error` を持ちます。React は `useStore` でこれらを購読し、入力時に `setDraft()` を呼びます。`prepare()`・`confirm()`・`reset()` は全体ストアから呼ぶ操作です。名前の入力中は全体ストアに通知されず、ゲームの挨拶は確定して閉じたタイミングで更新されます。

設定画面などを追加する場合は `src/overlay/settings/` のように機能別フォルダーを作り、UI・ストア・テストをまとめます。全体ストアにそのストアの参照と開閉操作を追加し、`Overlay` にコンポーネントを配置します。現在は `activeDialog` で1つの画面を選ぶ構成です。

`Game` は Effect 内で `init(container, store)` を呼び、クリーンアップで返り値の `destroy()` を呼びます。`ready` は非同期の起動完了を表す Promise で、失敗時は reject されます。`Game` はこれを受けてエラーを表示します。アンマウント後のエラーは画面に反映しません。

`src/game/init.ts` は React・MUI に依存せず、PixiJS と Zustand を直接利用します。初期化、ゲームループ、ボタン、挨拶表示、Canvas・ResizeObserver・購読の後片付けをここにまとめています。`destroy()` は初期化中でも呼び出せて、複数回呼んでも安全です。素材の共有テクスチャは再利用のために保持します。開発時の Strict Mode による再起動にも、この終了処理で対応します。

座標や速度など毎フレーム変わる値はゲーム側で管理します。ダイアログ表示中は回転とボタン操作を止め、描画とリサイズは継続します。Canvas 内の配置はウィンドウの大きさに追従し、挨拶は画面幅に合わせて折り返します。

スタイルは MUI にまとめています。`App.tsx` のテーマで色とフォント、`CssBaseline` で基本スタイル、`GlobalStyles` でページ全体のサイズとスクロールを設定します。`Game` と `Overlay` の配置は `Box` の `sx` に置きます。`Overlay` の空白部分はポインター操作を Canvas に通し、ダイアログが操作を受け取ります。外部フォント配信への依存はありません。

`index.html` は言語・文字コード・viewport と React の起動だけを定義します。タイトルは `App.tsx` の `<title>` で管理し、React が `<head>` に反映します。エントリーの `/src/main.tsx` は Vite がビルド時に処理し、`base: "./"` に従う相対パスへ変換します。

## 高解像度ディスプレイ

`src/game/init.ts` の `resolution` と `autoDensity` により、ゲーム内の座標や表示サイズを変えずに Canvas の内部解像度を上げます。描画負荷を抑えるため、`maxResolution` で最大2倍に制限しています。必要に応じてこの値を変更してください。

DPR の変化はメディアクエリーで監視し、異なるモニターへの移動やブラウザーのズーム時に描画解像度を更新します。ゲーム終了時には監視を解除します。PixiJS の Text は描画解像度の変更に追従しますが、画像素材の精細さは元画像の解像度にも依存します。

## 素材の読み込み

素材を `src/game/assets/` に配置し、import で URL を取得して PixiJS に渡します。次は `src/game/init.ts` から画像を読み込む例です。

```ts
import { Assets } from "pixi.js";
import bunnyUrl from "./assets/bunny.png";

const texture = await Assets.load(bunnyUrl);
```

サブフォルダー内の素材も `import playerUrl from "./assets/images/player.png"` のように指定します。Vite が公開先に合わせて URL を生成するため、`import.meta.env.BASE_URL` の手動連結は不要です。

参照された素材はビルド時にハッシュ付きのファイル名で出力され、小さい素材はデータ URL として埋め込まれる場合があります。未参照の素材は出力されません。詳細は [Vite のアセット処理](https://vite.dev/guide/assets)を参照してください。ファイル名を変えずに配信したい静的ファイルは `public/` に配置できます。

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

ブラウザーで素材の読み込み、ゲームの起動、リサイズ、モバイルの縦横表示、不要なスクロールの有無を確認してください。高解像度ディスプレイでは、文字や図形の鮮明さと、モニター移動・ブラウザーのズーム後も表示サイズやクリック位置がずれないことを確認してください。プレビューサーバーはローカル確認用です。

## 単体テスト

Vitest を Node 環境で使用します。テストファイルは対象モジュールの隣に `*.test.ts` として配置してください。例えば `src/score.ts` のテストは `src/score.test.ts` に書きます。

`describe`・`it`・`expect` などは `vitest` から明示的にインポートし、テスト名は日本語で期待する動作を記述してください。現在はテストファイルを含まず、テスト0件でも成功する設定です。ゲームロジックのテストを追加したら、`vitest.config.ts` の `passWithNoTests` を削除してください。ゲームの描画や起動・終了はブラウザーで確認してください。

```sh
pnpm test                    # 全単体テストを1回実行
pnpm test:watch              # 開発中の変更を監視
# src/score.test.ts を追加した場合
pnpm test src/score.test.ts  # ファイルを指定して実行
```

スコア計算、当たり判定、状態遷移などは、描画やブラウザー API に依存しない関数・クラスへ分離するとテストしやすくなります。起動処理を含む `src/main.tsx` はテストから読み込まず、対象のロジックだけをインポートしてください。

E2E テストやカバレッジ基準は未導入です。単体テストは `pnpm check` と `pnpm build` に含まれます。

## GitHub Actions

`.github/workflows/ci.yml` で、push・プルリクエストの作成や更新・手動実行時に検証と本番ビルドを実行します。

- Ubuntu 上の Node.js 24 を使用します。
- [pnpm/setup](https://github.com/pnpm/setup) で `package.json` の `packageManager` に指定した pnpm を準備し、ストアをキャッシュします。
- `pnpm install --frozen-lockfile` で依存関係を再現し、ロックファイルとの不整合を検出します。
- `pnpm build` で整形・lint・型チェック・単体テスト・本番ビルドを実行します。

GitHub にファイルを push すると、Actions タブで結果を確認できます。手動実行は、このワークフローを既定のブランチに追加した後、Actions タブの「CI」から行います。CI は検証のみで、itch.io へのアップロードは行いません。

## Agent Skills

pnpm 標準の Agent Skills 機能を使用します。`pnpm-workspace.yaml` の `skills.dirs` でリンク先を `.agents/skills` に固定し、パッケージごとの `permissions` で有効化します。PixiJS の Skills は許可済みです。

```sh
pnpm install --frozen-lockfile # 許可済み Skills のリンクを生成・同期
pnpm permissions list         # 許可状態と承認待ちを確認
```

`mise run setup` でも同じ同期を行います。生成される `pnpm-*` リンクは `node_modules` を参照するため、Git 管理対象外です。自作の Skills は別名のディレクトリに置けます。

Skills を追加するには、`skills/<名前>/SKILL.md` を含むパッケージを直接の依存関係に追加してください。開発支援専用なら `pnpm add -D パッケージ名` を使います。内容を確認したうえで `pnpm approve` を実行するか、次のように `pnpm-workspace.yaml` の既存の `permissions` に Skills の許可を追加し、再度インストールしてください。

```yaml
permissions:
  パッケージ名:
    skills: true
```

`pnpm approve` はビルドスクリプトの許可も扱います。Skills だけを許可する場合は上記の設定を使ってください。許可はそのパッケージの全 Skills と今後のバージョンに適用されます。`package.json`・`pnpm-lock.yaml`・`pnpm-workspace.yaml` の変更を共有することで、他の環境でも再現できます。

この機能は npm パッケージに同梱された Skills が対象です。詳細は [pnpm の公式ドキュメント](https://github.com/pnpm/pnpm/blob/main/pnpm/docs/agent-skills.md)を参照してください。

## 依存関係の自動更新

`.github/dependabot.yml` で pnpm の依存パッケージと GitHub Actions の更新を確認します。毎週月曜日の日本時間 09:00 に確認する設定で、マイナー・パッチ更新はエコシステムごとにまとめ、メジャー更新は個別の PR として提案します。各エコシステムの通常更新 PR は最大5件です。

設定を既定のブランチに push すると有効になります。更新 PR には既存の CI が適用されます。CI の結果と変更内容を確認してからマージしてください。自動マージは設定していません。mise が参照する Node.js のバージョンなど、この設定の対象外のツールは手動で管理します。

TypeScript は typescript-eslint との互換性のため6系を使用し、Dependabot のメジャー更新対象から除外しています。6系のマイナー・パッチ更新は引き続き確認します。

### pnpm 12 のセキュリティ更新に関する制限

2026年10月25日時点では、このプロジェクトが使う2つの YAML ドキュメントからなる `pnpm-lock.yaml` を GitHub の依存関係グラフがまだ読み取れません。Dependabot の通常のバージョン更新は対応していますが、このロックファイル内の依存関係に対する脆弱性アラートとセキュリティ更新は生成されないという制限があります。GitHub 側で有効化しただけでは、この制限は解消されません。[GitHub の公式告知](https://github.blog/changelog/2026-10-20-dependabot-now-supports-npm-12-pnpm-11-and-12-and-bun-1-4/)を参照してください。

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
