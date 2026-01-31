import { _decorator, Component, log, Node } from 'cc';
import * as fgui from "fairygui-cc";
import EventManager, { GameEvents } from '../core/EventManager';
import { GameManager, GameStateCode } from '../GameManager';
const { ccclass, property } = _decorator;

@ccclass('GameEndPage')
export class GameEndPage extends Component {
    private _view: fgui.GComponent = null!;
    private _button_restart: fgui.GButton = null!;
    private _text_state: fgui.GTextField = null!;
    private _text_notice_time: fgui.GTextField = null!;
    onLoad() {
        this.onUILoaded();
    }

    onUILoaded() {
        this._view = fgui.UIPackage.createObject("MainPackage", "Page_GameOver").asCom;
        this._view.makeFullScreen();
        fgui.GRoot.inst.addChild(this._view);
        this._button_restart = this._view.getChild("button_restart") as fgui.GButton;
        this._button_restart.onClick(this.onClickRestart, this);
        this._text_state = this._view.getChild("text_state") as fgui.GTextField;
        this._text_notice_time = this._view.getChild("text_notice_time") as fgui.GTextField;

    }

    start() {
        // 根据游戏结果显示不同文字
        const elapsed = GameManager.instance.elapsed;
        if (GameManager.instance.GameState == GameStateCode.Win) {
            this._text_state.text = "恭喜通关！";
        }
        else if (GameManager.instance.GameState == GameStateCode.GameOver) {
            this._text_state.text = "游戏失败！";
            this._text_notice_time.text = `你坚持了：${elapsed.toFixed(2)} 秒，请再接再厉！`;
        }
    }

    update(deltaTime: number) {
    }

    onClickRestart() {
        // 发出重启事件
        log("点击重新开始按钮，发送 RESTART 事件");
        EventManager.instance.emit(GameEvents.RESTART);
    }
}


