import { _decorator, Component, Node, director, KeyCode, input, Input, EventKeyboard, Prefab, instantiate, Camera, error } from 'cc';
import { BulletSpawner } from './BulletSpawner';
import { PlayerMove } from './PlayerMove';
import { BattleMain } from './gui/BattleMain';
import { GameEndPage } from './gui/GameEndPage';
import EventManager, { GameEvents } from './core/EventManager';
import UIManager from './core/UIManager';
import { GameStartPage } from './gui/GameStartPage';
import { SceneManager } from './SceneManager';
import { game } from 'cc';
import { GameStagePage } from './gui/GameStagePage';
import { FogSpotlight } from './FogOverlay';

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

    @property({ type: Prefab })
    fightLayerPrefab: Prefab = null!;

    @property
    winTime = 30;

    private state: GameStateCode = GameStateCode.Ready;
    public  elapsed = 0;

    public curHeartCount = 3;
    public defaultHeartCount = 3;

    public StageIndex = 1;

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
        this._onStart = this._onStartCallback.bind(this);
        EventManager.instance.on(GameEvents.START_GAME, this._onStart);
        this._onQuit = this._onQuitCallback.bind(this);
        EventManager.instance.on(GameEvents.QUIT_GAME, this._onQuit);
        this._onStageEnter = this._onStageEnterCallback.bind(this);
        EventManager.instance.on(GameEvents.ENTER_STAGE, this._onStageEnter);
        this._onNextStage = this._onNextStageCallback.bind(this);
        EventManager.instance.on(GameEvents.NEXT_STAGE, this._onNextStage);
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
        if (this._onStart) {
            EventManager.instance.off(GameEvents.START_GAME, this._onStart);
            this._onStart = null;
        }
        if (this._onQuit) {
            EventManager.instance.off(GameEvents.QUIT_GAME, this._onQuit);
            this._onQuit = null;
        }
        if (this._onStageEnter) {
            EventManager.instance.off(GameEvents.ENTER_STAGE, this._onStageEnter);
            this._onStageEnter = null;
        }
        if (this._onNextStage) {
            EventManager.instance.off(GameEvents.NEXT_STAGE, this._onNextStage);
            this._onNextStage = null;
        }
    }

    setHeartCount: (count: number) => void = null!;

    private resetFogSpotlight() {
        if (!this._fightLayerInstance) return;
        try {
            const fogs = this._fightLayerInstance.getComponentsInChildren(FogSpotlight);
            for (const fog of fogs) fog.resetDifficultyClock();
        } catch (e) {
            // ignore if fog not present
        }
    }

    startGame() {
        this.state = GameStateCode.Playing;
        this.elapsed = 0;
        // 重置血量
        this.curHeartCount = this.defaultHeartCount;
        this.setHeartCount?.(this.curHeartCount);

        // 下一关/重开：重置雾的难度计时
        this.resetFogSpotlight();

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
        // 当玩家被击中时，先扣除一颗心；只有血量为 0 时才真正结束游戏
        if (this.state !== GameStateCode.Playing) return;

        // 扣血
        this.curHeartCount = Math.max(0, this.curHeartCount - 1);
        // 更新 UI（如果有绑定的回调）
        this.setHeartCount?.(this.curHeartCount);

        if (this.curHeartCount <= 0) {
            this.state = GameStateCode.GameOver;
            this.handleGameEnd();
        } else {
            // 非致命被击中：可在此播放受击反馈、短暂无敌或复活逻辑
            console.log('Player hit, remaining hearts:', this.curHeartCount);
        }
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

    private _fightLayerInstance: Node | null = null;
    private _WorldRoot: Node | null = null;
    private _onStart: ((...args: any[]) => void) | null = null;
    private _onQuit: ((...args: any[]) => void) | null = null;
    private _onStageEnter: ((...args: any[]) => void) | null = null;
    private _onNextStage: ((...args: any[]) => void) | null = null;


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

    private _onStartCallback() {
        const parent = SceneManager.instance?.WorldCanvas;
        if (!parent) {
            error('GameManager: cannot find WorldCanvas from SceneManager');
            return;
        }

        // 下一关/重新开始时，会重复触发 START_GAME：不要因为已有实例就直接 return
        if (!this._fightLayerInstance) {
            if (!this.fightLayerPrefab) {
                console.warn('GameManager: fightLayerPrefab is not assigned');
                return;
            }
            const StartPage = parent.getChildByName('Start') as Node;
            if (StartPage) StartPage.destroy();

            // 实例化战斗预制体并挂到场景
            const inst = instantiate(this.fightLayerPrefab);
            parent.addChild(inst);

            this._fightLayerInstance = inst;
            this._WorldRoot = inst.getChildByName('WorldRoot');
        } else {
            // 尝试补齐引用（防止中途节点引用丢失）
            if (!this._WorldRoot) this._WorldRoot = this._fightLayerInstance.getChildByName('WorldRoot');
        }

        if (!this._WorldRoot) {
            error('GameManager: WorldRoot not found in fightLayerPrefab instance');
            return;
        }

        // 绑定 player, bulletLayer, spawner, playerMove（尽可能通过常见名字或组件查找）
        const playerNode = this._WorldRoot.getChildByName('Player');
        if (playerNode) this.player = playerNode;

        const bulletLayerNode = this._WorldRoot.getChildByName('BulletLayer');
        if (bulletLayerNode) this.bulletLayer = bulletLayerNode;

        // 查找 BulletSpawner 组件
        const spawnerComp: BulletSpawner = this._WorldRoot.getComponentInChildren(BulletSpawner);
        if (spawnerComp) this.spawner = spawnerComp;

        // 查找 PlayerMove 组件
        const playerMoveComp: PlayerMove | null = (this.player ? this.player.getComponent(PlayerMove) : null);
        if (playerMoveComp) this.playerMove = playerMoveComp;

        // 切换 UI 到 BattleMain，并启动游戏
        UIManager.instance.replace(GameStagePage, BattleMain);
        this.startGame();
    }

    private _onQuitCallback() {
        game.end();
        console.log('QUIT_GAME requested, but environment does not allow programmatic exit.');
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

    _onStageEnterCallback() {
         UIManager.instance.replace(GameStartPage, GameStagePage);
    }

    _onNextStageCallback() {
        // 进入下一关：自增 StageIndex 并显示分关页面
        this.StageIndex += 1;
        UIManager.instance.replace(GameEndPage, GameStagePage);
    }

}
