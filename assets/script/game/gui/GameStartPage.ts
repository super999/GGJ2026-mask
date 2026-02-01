import { MusicPlayer } from './../core/MusicPlayer';
import { _decorator, Color, Component, log, Node, input, Input, EventKeyboard, KeyCode, Enum } from 'cc';
import * as fgui from "fairygui-cc";
import EventManager, { GameEvents } from '../core/EventManager';
import AudioManager from '../core/AudioManager';
const { ccclass, property } = _decorator;

@ccclass('GameStartPage')
export class GameStartPage extends Component {
    _view: fgui.GComponent = null!;
    _button_start: fgui.GButton = null!;
    _button_quit: fgui.GButton = null!;

    @property({ type: Enum(KeyCode), tooltip: '按下该键等同点击“开始”（默认 Enter）' })
    nextKey: KeyCode = KeyCode.ENTER;

    private _onKeyDown: ((e: EventKeyboard) => void) | null = null;

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
        AudioManager.instance.playEffect('audio/sound/btnClick', 0.9);
        EventManager.instance.emit(GameEvents.ENTER_STAGE);
    }

    onClickQuit() {
        log(`点击退出游戏按钮，发送 QUIT_GAME 事件`);
        EventManager.instance.emit(GameEvents.QUIT_GAME);
    }

    onEnable() {
        this._onKeyDown = (e: EventKeyboard) => {
            if (e.keyCode === this.nextKey) this.onClickStart();
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


    protected async onLoad(): Promise<void> {
        await this.loadFGUIResources();
    }

    start() {
        try {
            // 使用单例 MusicPlayer 管理播放与歌单
            const curMusicList = MusicPlayer.instance.getPlaylist();
            if (curMusicList.length === 0){
                const MusicList = ['audio/music/bg_01', 'audio/music/bg_02', 'audio/music/bg_03'];
                MusicPlayer.instance.setPlaylist(MusicList);
            }
            MusicPlayer.instance.playNextMusic(true, 0.7);
        } catch (e) {

        }
    }

    update(deltaTime: number) {
    }
}


