import { _decorator, Component, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Bullet')
export class Bullet extends Component {
  speed = 600;         // 像素/秒（你可调）

  @property
  life = 6;            // 最大存活秒数（防止永远飞）
  
  private _dir = new Vec3(1, 0, 0);
  private _t = 0;

  /** 由 Spawner 调用，初始化方向/速度 */
  init(dir: Vec3, speed?: number) {
    this._dir.set(dir).normalize();
    if (speed != null) this.speed = speed;
    this._t = 0;
  }

  update(dt: number) {
    this._t += dt;
    const p = this.node.position;
    this.node.setPosition(
      p.x + this._dir.x * this.speed * dt,
      p.y + this._dir.y * this.speed * dt,
      p.z
    );

    if (this._t >= this.life) {
      this.node.destroy(); // MVP 先 destroy，后面再换对象池
    }
  }
}
