import {
  Application,
  Assets,
  Container,
  Graphics,
  Rectangle,
  Sprite,
  Text,
} from "pixi.js";
import bunnyUrl from "./assets/bunny.png";
import type { OverlayStore } from "../overlay/overlayStore";

const maxResolution = 2;
const getResolution = () =>
  Math.min(window.devicePixelRatio || 1, maxResolution);

export function init(container: HTMLElement, store: OverlayStore) {
  const app = new Application();
  let cancelled = false;
  let initialized = false;
  let destroyed = false;
  let resizeObserver: ResizeObserver | undefined;
  let unsubscribe: (() => void) | undefined;
  let resolutionQuery: MediaQueryList | undefined;

  const watchResolution = () => {
    resolutionQuery?.removeEventListener("change", watchResolution);
    if (cancelled || destroyed) return;
    // 上限適用前の DPR を監視し、変更のたびに監視条件を登録し直す。
    resolutionQuery = window.matchMedia(
      `(resolution: ${window.devicePixelRatio || 1}dppx)`,
    );
    resolutionQuery.addEventListener("change", watchResolution);
    const resolution = getResolution();
    if (app.renderer.resolution !== resolution) {
      app.renderer.resize(
        container.clientWidth,
        container.clientHeight,
        resolution,
      );
    }
  };

  const destroy = () => {
    resolutionQuery?.removeEventListener("change", watchResolution);
    resolutionQuery = undefined;
    resizeObserver?.disconnect();
    resizeObserver = undefined;
    unsubscribe?.();
    unsubscribe = undefined;
    if (initialized && !destroyed) {
      destroyed = true;
      // Assets の共有テクスチャは再マウント時にも使用する。
      app.destroy({ removeView: true }, { children: true });
    }
  };

  const start = async () => {
    await app.init({
      background: "#1099bb",
      resizeTo: container,
      resolution: getResolution(),
      autoDensity: true,
    });
    initialized = true;
    // 初期化が完了する前に終了された場合は、ここで後片付けする。
    if (cancelled) {
      destroy();
      return;
    }
    container.appendChild(app.canvas);
    watchResolution();
    resizeObserver = new ResizeObserver(() => app.queueResize());
    resizeObserver.observe(container);

    const texture = await Assets.load(bunnyUrl);
    if (cancelled) return;
    const bunny = new Sprite(texture);
    bunny.anchor.set(0.5);
    const greeting = new Text({
      text: "こんにちは、あなたの名前は？",
      style: {
        fontFamily: "system-ui, sans-serif",
        fontSize: 24,
        fill: 0xffffff,
        align: "center",
        wordWrap: true,
        breakWords: true,
      },
    });
    greeting.anchor.set(0.5);

    const button = new Container();
    button.eventMode = "static";
    button.cursor = "pointer";
    button.interactiveChildren = false;
    button.hitArea = new Rectangle(-110, -26, 220, 52);
    const background = new Graphics()
      .roundRect(-110, -26, 220, 52, 12)
      .fill(0x163a63);
    const label = new Text({
      text: "名前を教える",
      style: {
        fontFamily: "system-ui, sans-serif",
        fontSize: 20,
        fill: 0xffffff,
      },
    });
    label.anchor.set(0.5);
    button.addChild(background, label);
    button.on("pointertap", () => {
      if (store.getState().activeDialog === null) store.getState().openName();
    });
    button.on("pointerover", () => {
      button.alpha = 0.85;
    });
    button.on("pointerout", () => {
      button.alpha = 1;
    });
    app.stage.addChild(bunny, greeting, button);

    const layout = () => {
      const { width, height } = app.screen;
      bunny.position.set(width / 2, height * 0.25);
      greeting.position.set(width / 2, height * 0.48);
      greeting.style.wordWrapWidth = Math.max(1, width - 32);
      button.position.set(width / 2, height * 0.75);
      button.scale.set(Math.min(1, Math.max(0.1, (width - 32) / 220)));
    };
    layout();
    app.renderer.on("resize", layout);

    let uiInputBlocked = false;
    const syncOverlay = () => {
      uiInputBlocked = store.getState().activeDialog !== null;
      button.eventMode = uiInputBlocked ? "none" : "static";
      button.alpha = uiInputBlocked ? 0.5 : 1;
      if (!uiInputBlocked) {
        const name = store.getState().name.getState().name;
        greeting.text = name
          ? `こんにちは、${name}さん！`
          : "こんにちは、あなたの名前は？";
      }
    };
    syncOverlay();
    unsubscribe = store.subscribe(syncOverlay);
    app.ticker.add((time) => {
      if (uiInputBlocked) return;
      bunny.rotation += 0.1 * time.deltaTime;
    });
  };

  const ready = start().catch((cause: unknown) => {
    destroy();
    throw cause;
  });

  return {
    ready,
    destroy: () => {
      cancelled = true;
      destroy();
    },
  };
}
