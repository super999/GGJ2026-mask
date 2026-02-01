import { _decorator, Component, input, Input, EventKeyboard, KeyCode, Vec3, sp, error } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('PlayerMove')
export class PlayerMove extends Component {
  @property
  speed = 300;

  @property({ tooltip: '起步速度（按下方向键的初始速度）' })
  startSpeed = 120;

  @property({ tooltip: '最大速度' })
  maxSpeed = 500;

  @property({ tooltip: '加速度（也用于减速）' })
  acceleration = 1600;

  @property
  moveAnim = 'walk';

  @property
  idleAnim = 'idle';

  private dir = new Vec3();
  private _currentSpeed = 0;
  private _spine: sp.Skeleton | null = null;
  private _currentAnim: string | null = null;

  private resetInputState() {
    this.dir.set(0, 0, 0);
    this._currentSpeed = 0;
  }

  onLoad() {
    const spine_node = this.node.getChildByName('spine');
    if (!spine_node)
      return;
    this._spine = spine_node?.getComponent(sp.Skeleton);
    if (!this._spine)
      error('PlayerMove: cannot find spine component on child node "spine"');
  }

  onEnable() {
    // 避免上一局按键“卡住”（比如结算 UI 按钮保持按下态导致没收到 KEY_UP）
    this.resetInputState();
    input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
    input.on(Input.EventType.KEY_UP, this.onKeyUp, this);
  }
  onDisable() {
    input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
    input.off(Input.EventType.KEY_UP, this.onKeyUp, this);
    // 组件关闭时清空方向，防止下一次启用后自动移动
    this.resetInputState();
  }

  onKeyDown(e: EventKeyboard) { this.setKey(e.keyCode, true); }
  onKeyUp(e: EventKeyboard) { this.setKey(e.keyCode, false); }

  setKey(code: KeyCode, down: boolean) {
    const v = down ? 1 : 0;
    if (code === KeyCode.KEY_W || code === KeyCode.ARROW_UP) this.dir.y = v;
    if (code === KeyCode.KEY_S || code === KeyCode.ARROW_DOWN) this.dir.y = -v;
    if (code === KeyCode.KEY_A || code === KeyCode.ARROW_LEFT) this.dir.x = -v;
    if (code === KeyCode.KEY_D || code === KeyCode.ARROW_RIGHT) this.dir.x = v;
  }

  update(dt: number) {
    const p = this.node.position;

    const inputDir = new Vec3(this.dir.x, this.dir.y, 0);
    const hasInput = inputDir.x !== 0 || inputDir.y !== 0;
    if (hasInput) inputDir.normalize(); // 防止斜向更快

    if (hasInput) {
      if (this._currentSpeed <= 0) this._currentSpeed = this.startSpeed;
      this._currentSpeed = Math.min(this.maxSpeed, this._currentSpeed + this.acceleration * dt);
    } else {
      this._currentSpeed = Math.max(0, this._currentSpeed - this.acceleration * dt);
    }

    const moving = hasInput && this._currentSpeed > 0;
    if (moving) {
      const dx = inputDir.x * this._currentSpeed * dt;
      const dy = inputDir.y * this._currentSpeed * dt;
      this.node.setPosition(p.x + dx, p.y + dy, p.z);
    }

    if (this._spine) {
      const want = moving ? this.moveAnim : this.idleAnim;
      if (want && this._currentAnim !== want) {
        try {
          this._spine.setAnimation(0, want, true);
          this._currentAnim = want;
        } catch (e) {
          // ignore if animation name not found
        }
      }
    }
  }
}
