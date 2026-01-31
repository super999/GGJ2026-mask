import { _decorator, Color, Component, log, Node } from 'cc';
import * as fgui from "fairygui-cc";
import EventManager, { GameEvents } from '../core/EventManager';
const { ccclass, property } = _decorator;

@ccclass('GameStartPage')
export class GameStartPage extends Component {
    _view: fgui.GComponent = null!;
    _button_start: fgui.GButton = null!;
    _button_quit: fgui.GButton = null!;

    async loadFGUIResources() {
        fgui.UIConfig.modalLayerColor = new Color(0, 0, 0, 0.6 * 255);
        fgui.UIPackage.loadPackage("art/ui/MainPackage", this.onUILoaded.bind(this));
    }

    onUILoaded() {
        this._view = fgui.UIPackage.createObject("MainPackage", "Page_MainStart").asCom;
        this._view.makeFullScreen();
        fgui.GRoot.inst.addChild(this._view);
        this._button_start = this._view.getChild("button_start") as fgui.GButton;
        this._button_start.onClick(this.onClickStart, this);
        this._button_quit = this._view.getChild("button_quit") as fgui.GButton;
        this._button_quit.onClick(this.onClickQuit, this);
        this._button_quit.visible = false; // 禁用退出按钮
    }
    onClickStart() {
        log(`点击开始游戏按钮，发送 ENTER_STAGE 事件`);
        EventManager.instance.emit(GameEvents.ENTER_STAGE);
    }

    onClickQuit() {
        log(`点击退出游戏按钮，发送 QUIT_GAME 事件`);
        EventManager.instance.emit(GameEvents.QUIT_GAME);
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


    protected async onLoad(): Promise<void> {
        await this.loadFGUIResources();
    }

    start() {
    }

    update(deltaTime: number) {
    }
}


