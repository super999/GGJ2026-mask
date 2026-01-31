import { _decorator, Component, Prefab, Node, Camera, instantiate, Vec3, view, math, log, director } from 'cc';
import { Bullet } from './Bullet';
import { SceneManager } from './SceneManager';
import AudioManager from './core/AudioManager';

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

  @property
  soundRange = 1200; // 在世界坐标下，玩家与子弹距离小于此值才播放音效

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
    const size = view.getVisibleSizeInPixel(); // {width,height}

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

    // 6 Play Sound Effect (可选) audio\sound\skill3_1.mp3
    // 仅当玩家与子弹生成位置距离在 soundRange 内才播放
    try {
      const pWorld = this.player.worldPosition;
      const dx = pWorld.x - worldPos.x;
      const dy = pWorld.y - worldPos.y;
      const dist2 = dx * dx + dy * dy;
      if (dist2 <= this.soundRange * this.soundRange) {
        AudioManager.instance.playEffect('audio/sound/skill3_1', 1);
      }
      else{
        log('BulletSpawner: sound skipped, dist=', Math.sqrt(dist2));
      }
    } catch (e) {
      // 如果查询位置出错，仍尝试播放（兼容旧逻辑）
      AudioManager.instance.playEffect('audio/sound/skill3_1', 1);
    }
  }
}
