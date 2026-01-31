import { _decorator, Component, Node, Camera, Vec2, Vec3, view, Sprite, renderer } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('FogSpotlight')
export class FogSpotlight extends Component {
  @property(Camera) gameCamera: Camera = null!;
  @property(Node) player: Node = null!;
  @property(Node) SpriteNode: Node = null!;

  @property radius = 0.18;
  @property soft = 0.03;
  @property fogAlpha = 0.75;

  private mat!: renderer.MaterialInstance;

  onLoad() {
    const sp = this.SpriteNode.getComponent(Sprite)!;
    this.mat = sp.getMaterialInstance(0)!; // 用实例
  }

  update() {
    const wp = this.player.worldPosition;
    const screen = this.gameCamera.worldToScreen(wp, new Vec3());

    const vs = view.getVisibleSize();
    let u = screen.x / vs.width;
    let v = screen.y / vs.height;
    v = 1.0 - v;
    // 如果你发现洞上下颠倒，改成：v = 1.0 - v;
    const center = new Vec2(u, v);

    this.mat.setProperty('fogCenter', center);
    this.mat.setProperty('fogRadius', this.radius);
    this.mat.setProperty('fogSoft', this.soft);
    this.mat.setProperty('fogAlpha', this.fogAlpha);
  }
}
