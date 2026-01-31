import { _decorator, Color, Component, Node } from 'cc';
const { ccclass, property } = _decorator;
import * as fgui from "fairygui-cc";
import { GameManager } from '../GameManager';

@ccclass('BattleMain')
export class BattleMain extends Component {
    private _view: fgui.GComponent = null!;
    private _txtTime: fgui.GTextField = null!;

    start() {

    }

    async onLoad(): Promise<void> {
        await this.loadFGUIResources();
        // GameManager 注册 setTextTime 方法
        GameManager.instance.setTextTime = this.setTextTime.bind(this);
    }

    update(deltaTime: number) {
        
    }

    async loadFGUIResources() {
        fgui.UIConfig.modalLayerColor = new Color(0, 0, 0, 0.6 * 255);
        fgui.UIPackage.loadPackage("art/ui/MainPackage", this.onUILoaded.bind(this));
    }

    onUILoaded() {
        this._view = fgui.UIPackage.createObject("MainPackage", "Game_PlayPage").asCom;
        this._view.makeFullScreen();
        fgui.GRoot.inst.addChild(this._view);
        //
        const hub_com = this._view.getChild("hud").asCom;
        this._txtTime = hub_com.getChild("text_time") as fgui.GTextField;
        this._txtTime.text = "00:00";
    }

    setTextTime(time: number) {
        if (this._txtTime) {
            this._txtTime.text = time.toFixed(2);
        }
    }
}


