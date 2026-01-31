import { _decorator, Camera, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('SceneManager')
export class SceneManager extends Component {
    @property(Node)
    WorldCanvas: Node = null!;


    static instance: SceneManager = null!;

    onLoad() {
        SceneManager.instance = this;
    }

    start() {
    }

    getGameCamera(): Camera {
        const world_canvas = this.WorldCanvas;
        const gameCamera = world_canvas.getChildByName('GameCamera')!.getComponent(Camera)!;
        return gameCamera;
    }

    update(deltaTime: number) {

    }
}


