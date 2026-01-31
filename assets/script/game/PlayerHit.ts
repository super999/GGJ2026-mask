import { _decorator, Component } from 'cc';
import { Collider2D, Contact2DType, IPhysics2DContact } from 'cc';
import { GameManager } from './GameManager';
const { ccclass, property } = _decorator;

@ccclass('PlayerHit')
export class PlayerHit extends Component {

    // @property(GameManager)
    gm: GameManager = null!; // Inspector 拖入

    onLoad() {
        if (!this.gm) {
            this.gm = GameManager.instance;
        }
    }

    start() {
        const col = this.getComponent(Collider2D)!;
        col.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
    }

    onDestroy() {
        const col = this.getComponent(Collider2D);
        col?.off(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
    }

    private onBeginContact(self: Collider2D, other: Collider2D, contact: IPhysics2DContact | null) {
        // 这里先简单：碰到任何东西都算死；后面再用 tag / group 区分
        // 建议：不要在回调里创建新的物理对象；销毁一般OK，但稳妥起见可以延迟一帧销毁子弹
        // TODO: 调用你的 GameManager.gameOver()
        console.log('HIT!', other.node.name);
        // 不要在回调里 destroy：延迟到下一帧
        other.enabled = false; 
        this.gm.requestGameOver(other.node);
    }
}
