import { Node, director, Component } from 'cc';

export class UIManager {
    private static _inst: UIManager | null = null;
    static get instance() {
        if (!this._inst) this._inst = new UIManager();
        return this._inst;
    }

    private root: Node | null = null;

    init(root?: Node | null) {
        if (root) {
            this.root = root;
            return;
        }
        if (!this.root) {
            const scene = director.getScene();
            if (scene) this.root = scene.getChildByName('Canvas') || scene;
        }
    }

    getRoot(): Node | null {
        if (!this.root) this.init();
        return this.root;
    }

    show(componentClass: any): Component | null {
        const root = this.getRoot();
        if (!root) return null;
        let comp = root.getComponent(componentClass) as Component | null;
        if (!comp) comp = root.addComponent(componentClass);
        return comp;
    }

    hide(componentClass: any) {
        const root = this.getRoot();
        if (!root) return;
        const comp = root.getComponent(componentClass) as Component | null;
        if (comp) comp.destroy();
    }

    replace(oldClass: any, newClass: any): Component | null {
        this.hide(oldClass);
        return this.show(newClass);
    }
}

export default UIManager;
