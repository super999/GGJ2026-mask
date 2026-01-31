import { _decorator, Component, log, Node } from 'cc';
import * as fgui from "fairygui-cc";
import UIManager from '../core/UIManager';
import { GameStartPage } from './GameStartPage';
import EventManager, { GameEvents } from '../core/EventManager';
import { GameManager } from '../GameManager';
const { ccclass, property } = _decorator;

@ccclass('GameStagePage')
export class GameStagePage extends Component {
    _view: fgui.GComponent = null!;
    _button_ready: fgui.GButton = null!;
    _text_stage: fgui.GTextField = null!;

    start() {
        this.onUILoaded();
    }

    onUILoaded() {
        this._view = fgui.UIPackage.createObject("MainPackage", "Page_StageX").asCom;
        this._view.makeFullScreen();
        fgui.GRoot.inst.addChild(this._view);
        this._button_ready = this._view.getChild("button_ready") as fgui.GButton;
        this._button_ready.onClick(this.onClickReady, this);
        this._text_stage = this._view.getChild("text_stage") as fgui.GTextField;
        const stage = GameManager.instance.StageIndex;
        this._text_stage.text = `第 ${stage} 关`;
    }

    update(deltaTime: number) {

    }

    onClickReady() {
        // UIManager.instance.replace(GameStartPage, GameStagePage);
        log(`点击开始游戏按钮，发送 START_GAME 事件`);
        EventManager.instance.emit(GameEvents.START_GAME);
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


