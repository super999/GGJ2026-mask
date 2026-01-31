import { _decorator, Color, Component, Node } from 'cc';
const { ccclass, property } = _decorator;
import * as fgui from "fairygui-cc";
import { GameManager } from '../GameManager';

@ccclass('BattleMain')
export class BattleMain extends Component {
    private _view: fgui.GComponent = null!;
    private _txtTime: fgui.GTextField = null!;
    private _list_hearts: fgui.GList = null!;
    
    setHeartCount(count: number) {
        if (this._list_hearts) {
            this._list_hearts.numItems = count;
        }
    }

    start() {

    }

    async onLoad(): Promise<void> {        
        // GameManager 注册 setTextTime 方法
        this.onUILoaded();
        GameManager.instance.setTextTime = this.setTextTime.bind(this);
        GameManager.instance.setHeartCount = this.setHeartCount.bind(this);
    }

    onUILoaded() {
        this._view = fgui.UIPackage.createObject("MainPackage", "Game_PlayPage").asCom;
        this._view.makeFullScreen();
        fgui.GRoot.inst.addChild(this._view);
        //
        const hub_com = this._view.getChild("hud").asCom;
        this._txtTime = hub_com.getChild("text_time") as fgui.GTextField;
        this._txtTime.text = "00:00";
        this._list_hearts = this._view.getChild("list_heart") as fgui.GList;
    }

    onDestroy() {
        if (this._view) {
            try {
                this._view.removeFromParent();
            } catch (e) {
                console.warn('BattleMain: failed to remove view from GRoot', e);
            }
            this._view = null!;
        }
        if (GameManager.instance) {
            GameManager.instance.setTextTime = null!;
        }
    }

    setTextTime(time: number) {
        if (this._txtTime) {
            const totalSeconds = Math.max(0, Math.floor(time));
            const minutes = Math.floor(totalSeconds / 60);
            const secs = totalSeconds % 60;
            const mm = minutes < 10 ? '0' + minutes : String(minutes);
            const ss = secs < 10 ? '0' + secs : String(secs);
            this._txtTime.text = `${mm}:${ss}`;
        }
    }
    
    update(deltaTime: number) {        
    }

}


