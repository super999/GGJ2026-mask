import { _decorator, Component, Prefab, Node, Camera, instantiate, Vec3, view, math, log } from 'cc';
import { Bullet } from './Bullet';
import { SceneManager } from './SceneManager';

const { ccclass, property } = _decorator;

@ccclass('BulletSpawner')
export class BulletSpawner extends Component {
  @property({ type: Prefab })
  bulletPrefab: Prefab = null!;

  @property({ type: Node })
  bulletParent: Node = null!;

  @property({ type: Node })
  player: Node = null!;

  gameCamera: Camera = null!; 

  @property
  interval = 0.6;      // 刷弹间隔（秒）

  @property
  bulletSpeed = 650;   // 子弹速度

  private _acc = 0;

  
  onLoad() {
        this.gameCamera = SceneManager.instance.getGameCamera();
        log('BulletSpawner loaded, camera=', this.gameCamera);
    }


  update(dt: number) {
    this._acc += dt;
    if (this._acc < this.interval) return;
    this._acc -= this.interval;

    this.spawnOne();
  }

  private spawnOne() {
    const b = instantiate(this.bulletPrefab);
    b.setParent(this.bulletParent);

    // 1) 取屏幕尺寸（像素）
    const size = view.getVisibleSize(); // {width,height}

    // 2) 随机选边缘点（屏幕坐标：左上角原点）
    const edge = math.randomRangeInt(0, 4);
    const sx = (edge === 0) ? 0 :
               (edge === 1) ? size.width :
               math.randomRange(0, size.width);
    const sy = (edge === 2) ? 0 :
               (edge === 3) ? size.height :
               math.randomRange(0, size.height);

    // 3) 屏幕坐标 -> 世界坐标
    const worldPos = this.gameCamera.screenToWorld(new Vec3(sx, sy, 0));
    b.setWorldPosition(worldPos);

    // 4) 计算朝向玩家的方向
    const p = this.player.worldPosition;
    const dir = new Vec3(p.x - worldPos.x, p.y - worldPos.y, 0);

    // 5) 初始化子弹运动
    const bulletComp = b.getComponent(Bullet)!;
    bulletComp.init(dir, this.bulletSpeed);
  }
}
