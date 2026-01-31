export const GameEvents = {
    FGUI_READY: 'fgui-ready',
} as const;

type EventCallback = (...args: any[]) => void;

export class EventManager {
    private static _inst: EventManager | null = null;
    static get instance() {
        if (!this._inst) this._inst = new EventManager();
        return this._inst;
    }

    private listeners: Map<string, Set<EventCallback>> = new Map();

    on(event: string, cb: EventCallback) {
        let set = this.listeners.get(event);
        if (!set) {
            set = new Set();
            this.listeners.set(event, set);
        }
        set.add(cb);
    }

    off(event: string, cb?: EventCallback) {
        if (!cb) {
            this.listeners.delete(event);
            return;
        }
        const set = this.listeners.get(event);
        if (!set) return;
        set.delete(cb);
        if (set.size === 0) this.listeners.delete(event);
    }

    emit(event: string, ...args: any[]) {
        const set = this.listeners.get(event);
        if (!set) return;
        // copy to avoid mutation during iteration
        const arr = Array.from(set);
        for (const cb of arr) cb(...args);
    }
}

export default EventManager;
