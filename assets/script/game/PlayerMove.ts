import { _decorator, Component, input, Input, EventKeyboard, KeyCode, Vec3 } from 'cc';
const { ccclass } = _decorator;

@ccclass('PlayerMove')
export class PlayerMove extends Component {
  speed = 300;
  private dir = new Vec3();

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
    this.node.setPosition(p.x + this.dir.x * this.speed * dt, p.y + this.dir.y * this.speed * dt, p.z);
  }
}
