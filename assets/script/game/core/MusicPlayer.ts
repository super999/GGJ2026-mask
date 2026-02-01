import AudioManager from './AudioManager';

export class MusicPlayer {
  // playlist: array of resource paths (e.g. 'audio/music/bg_01')
  public playlist: string[] = [];
  private _currentIndex: number = -1;

  constructor(list?: string[]) {
    if (list && list.length) this.playlist = list.slice();
  }

  private static _inst: MusicPlayer | null = null;
  static get instance() {
    if (!this._inst) this._inst = new MusicPlayer();
    return this._inst;
  }

  setPlaylist(list: string[]) {
    this.playlist = list ? list.slice() : [];
    this._currentIndex = -1;
  }

  getPlaylist(): string[] {
    return this.playlist.slice();
  }

  addToPlaylist(path: string) {
    if (!path) return;
    this.playlist.push(path);
  }

  getCurrent(): string | null {
    if (this._currentIndex >= 0 && this._currentIndex < this.playlist.length)
      return this.playlist[this._currentIndex];
    return null;
  }

  async playMusic(path: string, loop = true, volume = 1) {
    if (!path) return -1;
    // record index if this path is in playlist
    const idx = this.playlist.indexOf(path);
    if (idx >= 0) this._currentIndex = idx;
    this._currentIndex = (this._currentIndex >= 0) ? this._currentIndex : -1;
    // stop previous music before starting new one
    AudioManager.instance.stopMusic();
    return await AudioManager.instance.playMusic(path, loop, volume);
  }

  async playNextMusic(loop = true, volume = 1) {
    if (!this.playlist || this.playlist.length === 0) return -1;
    // choose random index (prefer different from current if possible)
    let next = this._currentIndex;
    if (this.playlist.length === 1) {
      next = 0;
    } else {
      // try to pick different index
      let attempts = 0;
      while (attempts < 6) {
        const ridx = Math.floor(Math.random() * this.playlist.length);
        if (ridx !== this._currentIndex) {
          next = ridx;
          break;
        }
        attempts++;
      }
      if (next === this._currentIndex) {
        // fallback: just pick next sequentially
        next = (this._currentIndex + 1) % this.playlist.length;
      }
    }
    this._currentIndex = next;
    const path = this.playlist[this._currentIndex];
    // ensure previous music is stopped to avoid overlapping loops
    AudioManager.instance.stopMusic();
    return await AudioManager.instance.playMusic(path, loop, volume);
  }

  stop() {
    AudioManager.instance.stopMusic();
  }
}

export default MusicPlayer;
