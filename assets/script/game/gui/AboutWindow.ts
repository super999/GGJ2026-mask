import { _decorator, log } from 'cc';
import * as fgui from "fairygui-cc";

const { ccclass, property } = _decorator;



export class AboutWindow extends fgui.Window {

    _button_close: fgui.GButton = null!;

    protected onInit(): void {
        this.contentPane = fgui.UIPackage.createObject("MainPackage", "Page_About") as fgui.GComponent;
        this._button_close = this.contentPane.getChild("button_close") as fgui.GButton;
        this._button_close.onClick(this.onClickClose, this);
        this.center();
        this.makeFullScreen();
    }

    onClickClose() {        
        this.hide();
    }
}