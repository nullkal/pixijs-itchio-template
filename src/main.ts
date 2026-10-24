import { Application, Assets, Sprite } from "pixi.js";
import bunnyUrl from "./assets/bunny.png";

(async () => {
  const app = new Application();
  const container = document.getElementById("game-container")!;

  // Initialize the application
  await app.init({ background: "#1099bb", resizeTo: container });

  // Keep the canvas in sync with dynamic viewport and container size changes.
  container.appendChild(app.canvas);
  const resizeObserver = new ResizeObserver(() => app.queueResize());
  resizeObserver.observe(container);

  // Load the bunny texture
  const texture = await Assets.load(bunnyUrl);

  // Create a bunny Sprite
  const bunny = new Sprite(texture);

  // Center the sprite's anchor point
  bunny.anchor.set(0.5);

  // Move the sprite to the center of the screen
  const centerBunny = () => {
    bunny.position.set(app.screen.width / 2, app.screen.height / 2);
  };
  centerBunny();
  app.renderer.on("resize", centerBunny);

  // Add the bunny to the stage
  app.stage.addChild(bunny);

  // Listen for animate update
  app.ticker.add((time) => {
    // Just for fun, let's rotate mr rabbit a little.
    // * Delta is 1 if running at 100% performance *
    // * Creates frame-independent transformation *
    bunny.rotation += 0.1 * time.deltaTime;
  });
})();
