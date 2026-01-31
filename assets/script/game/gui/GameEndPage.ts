import { _decorator, Component, log, Node } from 'cc';
import * as fgui from "fairygui-cc";
import EventManager, { GameEvents } from '../core/EventManager';
const { ccclass, property } = _decorator;

@ccclass('GameEndPage')
export class GameEndPage extends Component {
    private _view: fgui.GComponent = null!;
    private _button_restart: fgui.GButton = null!;
    onLoad() {
        this.onUILoaded();
    }

    onUILoaded() {
        this._view = fgui.UIPackage.createObject("MainPackage", "Page_GameOver").asCom;
        this._view.makeFullScreen();
        fgui.GRoot.inst.addChild(this._view);
        this._button_restart = this._view.getChild("button_restart") as fgui.GButton;
        this._button_restart.onClick(this.onClickRestart, this);
    }

    start() {
    }

    update(deltaTime: number) {
    }

    onClickRestart() {
        // 发出重启事件
        log("点击重新开始按钮，发送 RESTART 事件");
        EventManager.instance.emit(GameEvents.RESTART);
    }
}


