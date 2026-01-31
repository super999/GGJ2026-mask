import { _decorator, Component, input, Input, EventKeyboard, KeyCode, Vec3, sp, error } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('PlayerMove')
export class PlayerMove extends Component {
  @property
  speed = 300;

  @property
  moveAnim = 'walk';

  @property
  idleAnim = 'idle';

  private dir = new Vec3();
  private _spine: sp.Skeleton | null = null;
  private _currentAnim: string | null = null;

  onLoad() {
    const spine_node = this.node.getChildByName('spine');
    if (!spine_node)
      return;
    this._spine = spine_node?.getComponent(sp.Skeleton);
    if (!this._spine)
      error('PlayerMove: cannot find spine component on child node "spine"');
  }

  onEnable() {
    input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
    input.on(Input.EventType.KEY_UP, this.onKeyUp, this);
  }
  onDisable() {
    input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
    input.off(Input.EventType.KEY_UP, this.onKeyUp, this);
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
    const moving = this.dir.x !== 0 || this.dir.y !== 0;
    this.node.setPosition(p.x + this.dir.x * this.speed * dt, p.y + this.dir.y * this.speed * dt, p.z);

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
