import { _decorator, Component, Node, director, KeyCode, input, Input, EventKeyboard } from 'cc';
import { BulletSpawner } from './BulletSpawner';
import { PlayerMove } from './PlayerMove';
import { BattleMain } from './gui/BattleMain';
import { GameEndPage } from './gui/GameEndPage';
import EventManager, { GameEvents } from './core/EventManager';
import UIManager from './core/UIManager';
import { GameStartPage } from './gui/GameStartPage';

const { ccclass, property } = _decorator;

export enum GameStateCode {
    Ready,
    Playing,
    GameOver,
    Win
}

@ccclass('GameManager')
export class GameManager extends Component {
    @property(Node) player: Node = null!;
    @property(Node) bulletLayer: Node = null!;
    @property(BulletSpawner) spawner: BulletSpawner = null!;   // 拖 BulletSpawner 脚本所在组件
    @property(PlayerMove) playerMove: PlayerMove = null!; // 拖 PlayerMove 组件（或你自己的移动脚本）

    @property(Node) uiRoot: Node = null!; // 在编辑器中指定 UI 挂载节点（可留空，运行时回退到 Canvas）

    @property
    winTime = 30;

    private state: GameStateCode = GameStateCode.Ready;
    private elapsed = 0;

    static instance: GameManager = null!;

    public get GameState() {
        return this.state;
    }

    start() {
        // MVP：直接开局；如果你有 Start 面板，就在点击 Start 时再调用 startGame()
        // this.startGame();
    }

    onLoad() {
        GameManager.instance = this;
    }

    protected onDestroy(): void {
        GameManager.instance = null!;
    }

    onEnable() {
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        this._onFGUIReady = this.onFGUIReady.bind(this);
        EventManager.instance.on(GameEvents.FGUI_READY, this._onFGUIReady);
        this._onRestart = this._onRestartCallback.bind(this);
        EventManager.instance.on(GameEvents.RESTART, this._onRestart);
    }
    onDisable() {
        input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        if (this._onFGUIReady) {
            EventManager.instance.off(GameEvents.FGUI_READY, this._onFGUIReady);
            this._onFGUIReady = null;
        }
        if (this._onRestart) {
            EventManager.instance.off(GameEvents.RESTART, this._onRestart);
            this._onRestart = null;
        }
    }

    startGame() {
        this.state = GameStateCode.Playing;
        this.elapsed = 0;
        this.spawner.enabled = true;
        this.playerMove.enabled = true;

        this.setTextTime?.(0);
    }

    update(dt: number) {
        if (this.state !== GameStateCode.Playing) return;

        this.elapsed += dt;
        this.setTextTime?.(this.elapsed);

        if (this.elapsed >= this.winTime) {
            this.win();
        }
    }

    private win() {
        if (this.state !== GameStateCode.Playing)
            return;
        this.state = GameStateCode.Win;
        this.requestGameWin();
        // TODO: show win panel
    }

    requestGameWin() {
        this.handleGameEnd();
    }

    handleGameEnd() {
        if (this._pendingGameEnd) return;
        this._pendingGameEnd = true;

        this.scheduleOnce(() => {
            this._pendingGameEnd = false;
            this.gameOverInternal();
        }, 0);
    }

    requestGameOver(hitBullet: Node) {
        if (this.state !== GameStateCode.Playing)
            return;
        this.state = GameStateCode.GameOver;
        this.handleGameEnd();
    }

    restart() {
        // 最稳的“重开方式”就是 reload scene：
        // Cocos 3.x 官方就是用 director.loadScene("sceneName") 来切换/重载场景。:contentReference[oaicite:0]{index=0}
        director.loadScene(director.getScene()!.name);
    }

    public setTextTime: (time: number) => void = null!

    private onKeyDown(e: EventKeyboard) {
        if (this.state !== GameStateCode.Playing && e.keyCode === KeyCode.KEY_R) {
            EventManager.instance.emit(GameEvents.RESTART);
        }
    }

    private _onRestart: ((...args: any[]) => void) | null = null;

    private _onRestartCallback() {
        this.restart();
    }

    private _pendingGameEnd = false;

    private _uiLoaded = false;

    private _onFGUIReady: ((...args: any[]) => void) | null = null;

    onFGUIReady() {
        if (this._uiLoaded) return;
        this._uiLoaded = true;

        let mountRoot: Node | null = this.uiRoot;
        if (!mountRoot) {
            const scene = director.getScene();
            if (scene) mountRoot = scene.getChildByName('Canvas') || scene;
        }

        UIManager.instance.init(mountRoot);
        const bm = UIManager.instance.show(GameStartPage);
        if (!bm) {
            console.warn('GameManager: failed to attach BattleMain via UIManager');
        }
    }

    gameOverInternal() {
        // 1) 停掉生成器与玩家移动（Component.enabled 是最省事的关停方式）
        this.spawner.enabled = false;
        this.playerMove.enabled = false;

        // 2) （可选）把现有子弹也停掉：最简单就是清掉
        this.clearBullets();
        // 3) 关闭 BattleMain，打开结算页面
        UIManager.instance.replace(BattleMain, GameEndPage);

        console.log('GAME End - Press R');
    }

    clearBullets() {
        // MVP：直接销毁 BulletLayer 下所有子弹
        for (const c of this.bulletLayer.children.slice())
            c.destroy();
    }

}
