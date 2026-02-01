import { _decorator, Component, Prefab, Node, Camera, instantiate, Vec3, view, math, log, director, resources, JsonAsset, warn, error } from 'cc';
import { Bullet } from './Bullet';
import { SceneManager } from './SceneManager';
import AudioManager from './core/AudioManager';
import { GameManager } from './GameManager';

const { ccclass, property } = _decorator;

@ccclass('BulletSpawner')
export class BulletSpawner extends Component {
  // @property({ type: Prefab })
  // bulletPrefab: Prefab = null!;

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
  private bulletPrefabPath = 'prefabs/fight/bullet/bullet_01';
  private _bulletPrefab: Prefab | null = null;
  private _prefabCache: Map<string, Prefab> = new Map();
  private _stages: Array<any> = [];

  getOrLoadPrefab(path: string): Promise<Prefab> {
    return new Promise<Prefab>((resolve, reject) => {
      const cached = this._prefabCache.get(path);
      if (cached) {
        this._bulletPrefab = cached;
        resolve(cached);
        return;
      }
      try {
        resources.load(path, Prefab, (err, asset) => {
          if (err) {
            reject(err);
            return;
          }
          const prefab = asset as Prefab;
          this._prefabCache.set(path, prefab);
          this._bulletPrefab = prefab;
          resolve(prefab);
        });
      } catch (e) {
        reject(e);
      }
    });
  }

  async onLoad() {
    this.gameCamera = SceneManager.instance.getGameCamera();
    log('BulletSpawner loaded, camera=', this.gameCamera);
    // Load stages config and pick a random bullet prefab path
    try {
      const stagesAsset = await new Promise<JsonAsset>((resolve, reject) => {
        resources.load('config/stages', JsonAsset, (err, asset) => {
          if (err) { reject(err); return; }
          resolve(asset as JsonAsset);
        });
      });
      const stages = stagesAsset.json as Array<any>;
      this._stages = stages;
    } catch (e) {
      log('BulletSpawner: failed to load stages config, using default bullet path', e);
    }
    // Load the bullet prefab asynchronously (from chosen path)
    this._bulletPrefab = await this.getOrLoadPrefab(this.bulletPrefabPath);
  }

  private real_interval = 0;

  setDifficultyLevel() {
    // 可选：根据游戏进度调整 spawn 频率、子弹速度等
    const stageIdx = GameManager.instance.StageIndex;
    // real_interval  为 interval 乘以 0.95 的 stageIdx 次方，最低不低于 0.3 秒
    this.real_interval = Math.max(0.3, this.interval * Math.pow(0.95, stageIdx));
  }

  protected onEnable(): void {
    setTimeout(() => {
      this.setDifficultyLevel();
    }, 0);
    this._acc = 0;
  }


  update(dt: number) {
    this._acc += dt;
    if (this._acc < this.real_interval) return;
    this._acc -= this.real_interval;

    this.spawnOne();
  }

  private async spawnOne() {
    // 先计算将要出现的世界位置

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
    // 选择随机子弹 prefab 路径（优先使用 stages 列表）
    let prefabPath = this.bulletPrefabPath;
    if (this._stages && this._stages.length > 0) {
      //const ridx = math.randomRangeInt(0, this._stages.length);
      const fidx = (GameManager.instance.StageIndex-1) % this._stages.length;
      const rchosen = this._stages[fidx];
      if (rchosen && rchosen.bullet) prefabPath = rchosen.bullet;
      // warn(`BulletSpawner: random index=${fidx} chosen prefab=${prefabPath}`);
    }

    // 异步获取 prefab（若未缓存会加载），然后实例化并设置位置
    let b: Node = null!;
    try {
      const prefab = this._prefabCache.get(prefabPath) ?? await this.getOrLoadPrefab(prefabPath);
      // warn(`BulletSpawner: spawning bullet from prefab=${prefabPath}`);
      b = instantiate(prefab);
      b.setParent(this.bulletParent);
      b.setWorldPosition(worldPos);
      try { if (this.bulletParent) this.bulletParent.addChild(b); } catch (e) { }
    } catch (e) {
      error('BulletSpawner: failed to load/instantiate prefab', prefabPath, e);
    }
    // 4) 计算朝向玩家的方向
    const p = this.player.worldPosition;
    const dir = new Vec3(p.x - worldPos.x, p.y - worldPos.y, 0);
    // 5) 使子弹朝向运动方向（计算角度并旋转节点）
    try {
      const ang = Math.atan2(dir.y, dir.x); // radians
      const deg = ang * 180 / Math.PI;
      b.eulerAngles = new Vec3(0, 0, deg);
    } catch (e) {
      // ignore rotation errors
    }

    // 6) 初始化子弹运动
    const bulletComp = b.getComponent(Bullet)!;
    bulletComp.init(dir, this.bulletSpeed);

    // 7 Play Sound Effect (可选) audio\sound\skill3_1.mp3
    // 仅当玩家与子弹生成位置距离在 soundRange 内才播放
    try {
      const pWorld = this.player.worldPosition;
      const dx = pWorld.x - worldPos.x;
      const dy = pWorld.y - worldPos.y;
      const dist2 = dx * dx + dy * dy;
      if (dist2 <= this.soundRange * this.soundRange) {
        AudioManager.instance.playEffect('audio/sound/skill3_1', 0.5);
      }
      else {
        log('BulletSpawner: sound skipped, dist=', Math.sqrt(dist2));
      }
    } catch (e) {
      // 如果查询位置出错，仍尝试播放（兼容旧逻辑）
      AudioManager.instance.playEffect('audio/sound/skill3_1', 0.5);
    }
  }
}
