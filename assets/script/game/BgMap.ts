import { _decorator, Component, Node, Sprite, SpriteFrame } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('BgMap')
export class BgMap extends Component {
    _sprite: Sprite | null = null;

    @property({ type: [SpriteFrame], tooltip: '可选的背景图片数组，直接在编辑器中拖入 SpriteFrame' })
    backgrounds: SpriteFrame[] = [];

    public pickAndSetRandom() {
        if (!this._sprite) return;
        if (!this.backgrounds || this.backgrounds.length === 0) return;
        const idx = Math.floor(Math.random() * this.backgrounds.length);
        const sf = this.backgrounds[idx];
        if (sf) this._sprite.spriteFrame = sf;
    }

    onLoad() {
        this._sprite = this.node.getComponent(Sprite);
        if (!this._sprite) console.warn('BgMap: Sprite component not found on node');
    }

    start() {
    }

    update(deltaTime: number) {        
    }
}


