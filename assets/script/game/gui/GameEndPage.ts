import { _decorator, Component, log, Node, input, Input, EventKeyboard, KeyCode, Enum } from 'cc';
import * as fgui from "fairygui-cc";
import EventManager, { GameEvents } from '../core/EventManager';
import { GameManager, GameStateCode } from '../GameManager';
import AudioManager from '../core/AudioManager';
const { ccclass, property } = _decorator;

@ccclass('GameEndPage')
export class GameEndPage extends Component {
    private _view: fgui.GComponent = null!;
    private _button_restart: fgui.GButton = null!;
    private _text_state: fgui.GTextField = null!;
    private _text_notice_time: fgui.GTextField = null!;
    // 控制器 state
    private _stateCtrl: fgui.Controller = null!;

    @property({ type: Enum(KeyCode), tooltip: '按下该键等同点击“下一关/重新开始”（默认 Enter）' })
    nextKey: KeyCode = KeyCode.ENTER;

    private _onKeyDown: ((e: EventKeyboard) => void) | null = null;
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
        this._stateCtrl = this._view.getController("state");
    }

    start() {
        // 根据游戏结果显示不同文字
        const elapsed = GameManager.instance.elapsed;
        if (GameManager.instance.GameState == GameStateCode.Win) {
            this._text_state.text = "恭喜通关！";
            this._text_notice_time.text = `坚持了：${elapsed.toFixed(2)} 秒。`;
            AudioManager.instance.playEffect('audio/sound/mission_succ', 1);
            this._button_restart.title = "下一关";
            this._stateCtrl.setSelectedIndex(0);
        }
        else if (GameManager.instance.GameState == GameStateCode.GameOver) {
            this._text_state.text = "游戏失败！";
            this._text_notice_time.text = `你坚持了：${elapsed.toFixed(2)} 秒，请再接再厉！`;
            AudioManager.instance.playEffect('audio/sound/mission_fail', 1);
            this._button_restart.title = "重新开始";
            this._stateCtrl.setSelectedIndex(1);
        }
    }

    update(deltaTime: number) {
    }

    onClickRestart() {
        AudioManager.instance.playEffect('audio/sound/btnClick', 0.9);
        // 发出重启事件
        if (GameManager.instance.GameState == GameStateCode.Win) {
            log("点击下一关按钮，发送 NEXT_STAGE 事件");
            EventManager.instance.emit(GameEvents.NEXT_STAGE);
        }
        else if (GameManager.instance.GameState == GameStateCode.GameOver) {
            log("点击重新开始按钮，发送 RESTART 事件");
            EventManager.instance.emit(GameEvents.RESTART);
        }        
    }

    onEnable() {
        this._onKeyDown = (e: EventKeyboard) => {
            if (e.keyCode === this.nextKey) this.onClickRestart();
        };
        input.on(Input.EventType.KEY_DOWN, this._onKeyDown, this);
    }

    onDisable() {
        if (this._onKeyDown) {
            input.off(Input.EventType.KEY_DOWN, this._onKeyDown, this);
            this._onKeyDown = null;
        }
    }

    protected onDestroy(): void {
        if (this._view) {
            try {
                this._view.removeFromParent();
            } catch (e) {
                console.warn('GameStartPage: failed to remove view from GRoot', e);
            }
        }
    }
}


