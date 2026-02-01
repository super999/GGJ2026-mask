import { resources, AudioClip, AudioSource, Node, director, log } from 'cc';

export class AudioManager {
    private static _inst: AudioManager | null = null;
    static get instance() {
        if (!this._inst) this._inst = new AudioManager();
        return this._inst;
    }

    private _musicNode: Node | null = null;
    private _musicSource: AudioSource | null = null;
    private _musicClip: AudioClip | null = null;
    private _musicPath: string | null = null;

    private ensureMusicSource() {
        if (this._musicSource && this._musicNode) return;
        const node = new Node('AudioManager_Music');
        const src = node.addComponent(AudioSource);
        // 把节点挂到当前场景并做持久化，确保 AudioSource 能正常工作
        try {
            const scene = director.getScene();
            if (scene) scene.addChild(node);
        } catch (e) {}
        try {
            director.addPersistRootNode(node);
        } catch (e) {
            // ignore if not allowed
        }
        this._musicNode = node;
        this._musicSource = src;
    }

    async playMusic(path: string, loop = true, volume = 1) {
        try {
            const clip = await new Promise<AudioClip>((resolve, reject) => {
                resources.load(path, AudioClip, (err, asset) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(asset as AudioClip);
                });
            });
            this._musicClip = clip;
            this._musicPath = path;
            this.ensureMusicSource();
            if (!this._musicSource) return -1;
            this._musicSource.clip = clip;
            this._musicSource.loop = loop;
            this._musicSource.volume = volume;
            this._musicSource.play();
            return 0;
        } catch (e) {
            log('AudioManager: failed to load/play music', path, e);
            return -1;
        }
    }

    stopMusic() {
        try {
            if (this._musicSource) this._musicSource.stop();
        } catch (e) {}
    }

    async playEffect(path: string, volume = 1) {
        try {
            const clip = await new Promise<AudioClip>((resolve, reject) => {
                resources.load(path, AudioClip, (err, asset) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(asset as AudioClip);
                });
            });
            const node = new Node('AudioManager_Effect');
            const src = node.addComponent(AudioSource);

            // 把节点挂到当前场景，确保能发声
            try {
                const scene = director.getScene();
                if (scene) scene.addChild(node);
            } catch (e) {}
            src.playOneShot(clip, volume);
            return 0;
        } catch (e) {
            log('AudioManager: failed to load/play effect', path, e);
            return -1;
        }
    }

    stopEffect(node: Node) {
        try {
            const src = node.getComponent(AudioSource);
            if (src) src.stop();
            try { director.removePersistRootNode(node); } catch (e) {}
            node.destroy();
        } catch (e) {}
    }
}

export default AudioManager;
