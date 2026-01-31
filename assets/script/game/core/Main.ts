import { _decorator, assetManager, AssetManager, resources, Color, Component, director, loadWasmModuleBox2D, log, Node, Font, TTFFont } from 'cc';
import * as fgui from "fairygui-cc";
import EventManager, { GameEvents } from './EventManager';
const { ccclass, property } = _decorator;

@ccclass('Main')
export class Main extends Component {

    start() {
        log("Main start");        
        this.initFGUI();
    }

    onLoad() {
        
    }

    update(deltaTime: number) {        
    }

    async initFGUI() {        
        // 创建 FGUI 根节点并通知 GameManager 去加载 UI
        fgui.GRoot.create();
        await this.loadFont();
        EventManager.instance.emit(GameEvents.FGUI_READY);
    }

    async loadFont(): Promise<void> {
        const fontPath = "common/font/SourceHanSansCN-Heavy"; // resources folder path (no extension)
        try {
            const font = await new Promise<TTFFont>((resolve, reject) => {
                resources.load(fontPath, TTFFont, (err, asset) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(asset as TTFFont);
                });
            });
            fgui.registerFont("SourceHanSansCN-Heavy", font);
            fgui.UIConfig.defaultFont = "SourceHanSansCN-Heavy";
            log('Font loaded and registered:', fontPath);
        } catch (e) {
            log('Failed to load font:', e);
        }
    }
}


