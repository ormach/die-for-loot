class SoundManager {
  constructor() {
    this.sounds = {};
    this.volume = 1;
    this.muted = false;
  }

  setVolume(v) {
    this.volume = v;
  }

  setMuted(m) {
    this.muted = m;
  }

  load(name, src, poolSize = 1, volume) {
    this.sounds[name] = Array.from({ length: poolSize }, () => {
      const a = new Audio(src);
      if (volume !== undefined){
        console.log(1);
        
        this.volume = volume
      }

      a.volume = this.volume;

      return a;
    });
  }

  play(name) {
    if (this.muted) return;

    const pool = this.sounds[name]; 
    if (!pool) return;

    const s = pool.pop();
    pool.unshift(s);

    // s.volume = this.volume;
    console.log(s.volume);
    
    
    s.currentTime = 0;
    s.play().catch(() => {});
  }
}

const sound = new SoundManager();

//Pool size controls audio overlap
sound.load("drop-1", "./audio/item-drop-1.wav", 2, 0.5);
sound.load("drop-2", "./audio/item-drop-2.wav", 2, 0.1);
sound.load("drop-3", "./audio/item-drop-3.wav", 2, 0.4);
sound.load("drop-4", "./audio/item-drop-4.wav", 2, 0.3);
