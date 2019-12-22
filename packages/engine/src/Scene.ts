import Entity from "./Entity";
import HasChildren from "./HasChildren";
import PresentsScenes from "./PresentsScenes";

export default class Scene
  implements HasChildren<Entity | Scene>, PresentsScenes {
  entities: Set<Entity> = new Set();
  scenes: Set<Scene> = new Set();
  activeScene: Scene | null = null;
  clearColor: string;

  constructor({ clearColor = "white" }: { clearColor?: string } = {}) {
    this.clearColor = clearColor;
  }

  present(scene: Scene) {
    this.scenes.add(scene);
    this.activeScene = scene;
  }

  tick({
    isActive,
    delta,
    canvas,
    context,
  }: {
    isActive: boolean;
    delta: number;
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
  }) {
    if (!isActive) {
      return;
    }

    this.entities.forEach((entity) => {
      entity.update(delta);
    });

    if (this.clearColor) {
      context.fillStyle = this.clearColor;
      context.fillRect(0, 0, canvas.width, canvas.height);
    }

    this.entities.forEach((entity) => {
      entity.draw({
        canvas,
        context,
      });
    });

    this.scenes.forEach((scene) => {
      const childIsActive = scene === this.activeScene;
      scene.tick({
        isActive: childIsActive,
        delta,
        canvas,
        context,
      });
    });
  }

  hasChild(child: Entity | Scene): boolean {
    if (child instanceof Entity) {
      return this.entities.has(child);
    } else if (child instanceof Scene) {
      return this.scenes.has(child);
    } else {
      return false;
    }
  }
  addChild(child: Entity | Scene): void {
    if (child instanceof Entity) {
      this.entities.add(child);
    } else if (child instanceof Scene) {
      this.scenes.add(child);
    }
  }
  removeChild(child: Entity | Scene): void {
    if (child instanceof Entity) {
      this.entities.delete(child);
    } else if (child instanceof Scene) {
      this.scenes.delete(child);
    }
  }
}
