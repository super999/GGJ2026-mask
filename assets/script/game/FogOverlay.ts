import { _decorator, Component, Node, Camera, Vec2, Vec3, view, Sprite, renderer } from 'cc';
import { SceneManager } from './SceneManager';
const { ccclass, property } = _decorator;

@ccclass('FogSpotlight')
export class FogSpotlight extends Component {
  // @property(Camera) 
  gameCamera: Camera = null!;
  @property(Node) player: Node = null!;
  @property(Node) SpriteNode: Node = null!;

  // ===== 基础雾参数（作为“初始值”）=====
  @property radius = 0.18;
  @property soft = 0.03;
  @property fogAlpha = 0.75;

  // ===== 开关1：呼吸 ===== 
  @property({ tooltip: '是否启用洞半径呼吸(轻微抖动/心跳感)' })
  enableBreath = true;

  @property({ tooltip: '呼吸幅度（建议 0.005~0.02）' })
  breathAmp = 0.012;

  @property({ tooltip: '呼吸频率（Hz：每秒几次）' })
  breathHz = 1.2;

  // ===== 开关2：难度曲线 =====
  @property({ tooltip: '是否启用随时间收缩半径/加深雾的难度曲线' })
  enableDifficulty = true;

  @property({ tooltip: '难度爬升时长（通常等于胜利时间，如30秒）' })
  difficultyDuration = 30;

  @property({ tooltip: '最终最小半径（建议 0.08~0.14）' })
  minRadius = 0.10;

  @property({ tooltip: '最终雾Alpha（建议 0.85~0.95）' })
  maxFogAlpha = 0.90;

  private mat!: renderer.MaterialInstance;

  private t = 0;                 // 运行时间
  private baseRadius = 0;
  private baseFogAlpha = 0;

  onLoad() {
    const sp = this.SpriteNode.getComponent(Sprite)!;
    this.mat = sp.getMaterialInstance(0)!;
    this.gameCamera = SceneManager.instance.getGameCamera();
    this.baseRadius = this.radius;
    this.baseFogAlpha = this.fogAlpha;
  }

  /** 可选：如果你想在重开/开始时手动重置难度计时，可以从 GameManager 调用它 */
  public resetDifficultyClock() {
    this.t = 0;
    this.radius = this.baseRadius;
    this.fogAlpha = this.baseFogAlpha;
  }

  update(dt: number) {
    // ===== 1) 更新中心点（洞跟随玩家）=====
    const wp = this.player.worldPosition;
    const screen = this.gameCamera.worldToScreen(wp, new Vec3());

    const vs = view.getVisibleSizeInPixel();
    let u = screen.x / vs.width;
    let v = screen.y / vs.height;

    // worldToScreen 是左上角为原点，所以这里需要翻转Y
    v = 1.0 - v; // :contentReference[oaicite:2]{index=2}

    const center = new Vec2(u, v);

    // ===== 2) 计算“当前帧”的 radius / fogAlpha（叠加开关效果）=====
    this.t += dt;

    let r = this.baseRadius;
    let a = this.baseFogAlpha;

    // 难度曲线：随时间收缩半径、加深黑雾
    if (this.enableDifficulty && this.difficultyDuration > 0) {
      let p = this.t / this.difficultyDuration;
      p = Math.max(0, Math.min(1, p));

      // 用 smoothstep 让变化更“游戏感”（前后更平滑）
      const eased = p * p * (3 - 2 * p);

      r = lerp(this.baseRadius, this.minRadius, eased);
      a = lerp(this.baseFogAlpha, this.maxFogAlpha, eased);
    }

    // 呼吸：在最终 r 上做轻微正弦波抖动
    if (this.enableBreath) {
      const w = this.breathHz * Math.PI * 2;
      r += Math.sin(this.t * w) * this.breathAmp;
    }

    // 防止半径被抖成负数（极端情况下）
    r = Math.max(0.02, r);

    // ===== 3) 写入材质参数 =====
    this.mat.setProperty('fogCenter', center);
    this.mat.setProperty('fogRadius', r);
    this.mat.setProperty('fogSoft', this.soft);
    this.mat.setProperty('fogAlpha', a);
  }
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}
