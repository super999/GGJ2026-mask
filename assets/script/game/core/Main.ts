import { _decorator, assetManager, AssetManager, Color, Component, director, loadWasmModuleBox2D, log, Node } from 'cc';
import * as fgui from "fairygui-cc";
import EventManager, { GameEvents } from './EventManager';
const { ccclass, property } = _decorator;

@ccclass('Main')
export class Main extends Component {

    start() {
        log("Main start");        
        this.initFGUI();
    }

    onLoad() {
        
    }

    update(deltaTime: number) {        
    }

    async initFGUI() {        
        // 创建 FGUI 根节点并通知 GameManager 去加载 UI
        fgui.GRoot.create();
        EventManager.instance.emit(GameEvents.FGUI_READY);
    }

}


