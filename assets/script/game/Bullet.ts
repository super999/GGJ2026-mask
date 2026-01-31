import { _decorator, Component, Vec3, Color, Sprite, math } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Bullet')
export class Bullet extends Component {
  speed = 600;

  @property
  life = 6;

  // === 颜色配置：0% / 50% / 100% ===
  @property({ tooltip: '存活时间 0% 时的颜色' })
  startColor: Color = new Color(80, 220, 255, 255); // 青蓝

  @property({ tooltip: '存活时间 50% 时的颜色' })
  midColor: Color = new Color(255, 230, 80, 255); // 黄

  @property({ tooltip: '存活时间 100% 时的颜色' })
  endColor: Color = new Color(255, 90, 90, 255); // 红

  @property({ tooltip: '是否启用按寿命变色' })
  enableLifeColor = true;

  private _dir = new Vec3(1, 0, 0);
  private _t = 0;

  private _sprite: Sprite | null = null;
  private _tmp = new Color();

  onLoad() {
    // 子弹Sprite在同节点就能拿到；如果在子节点，你可以改成 this.getComponentInChildren(Sprite)
    this._sprite = this.node.getChildByName('Sprite')?.getComponent(Sprite) || null;
  }

  init(dir: Vec3, speed?: number) {
    this._dir.set(dir).normalize();
    if (speed != null) this.speed = speed;
    this._t = 0;

    // 初始化颜色为 startColor
    this.applyColorByLife(0);
  }

  update(dt: number) {
    this._t += dt;

    // 移动
    const p = this.node.position;
    this.node.setPosition(
      p.x + this._dir.x * this.speed * dt,
      p.y + this._dir.y * this.speed * dt,
      p.z
    );

    // 变色
    if (this.enableLifeColor) {
      const ratio = this.life > 0 ? math.clamp01(this._t / this.life) : 1;
      this.applyColorByLife(ratio);
    }

    // 到期销毁
    if (this._t >= this.life) {
      this.node.destroy();
    }
  }

  private applyColorByLife(ratio01: number) {
    if (!this._sprite) return;

    // 三段：0-0.5 用 start->mid；0.5-1 用 mid->end
    if (ratio01 <= 0.5) {
      const t = ratio01 / 0.5;
      this._tmp.set(this.startColor).lerp(this.midColor, t);
    } else {
      const t = (ratio01 - 0.5) / 0.5;
      this._tmp.set(this.midColor).lerp(this.endColor, t);
    }

    // 给 Sprite 上色（tint）
    this._sprite.color = this._tmp;
  }
}
