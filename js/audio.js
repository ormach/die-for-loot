class SoundManager {
    constructor() {
        this.sounds = {};
        this.music = {};

        this.volume = 1;
        this.muted = false;
        
    }


    setMuted(m) {

        this.muted = m;

        for (const pool of Object.values(this.sounds)) {
            for (const audio of pool) {
                audio.muted = m;
            }
        }

        for (const music of Object.values(this.music)) {
            music.muted = m;
        }
    }
    toggleMute() {
        this.setMuted(!this.muted);
    }


    //SFX
    load(name, src, poolSize = 1, volume = 1, loop) {
        this.sounds[name] = Array.from({ length: poolSize }, () => {
            const a = new Audio(src);

            if(loop !== undefined){
                a.loop = true
            }

            if (volume !== undefined){
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
        
        const s = pool.pop(); //takes the last elem in pool
        pool.unshift(s); //moves item to the start of an arr

        s.currentTime = 0;
        s.play().catch(() => {});
        console.log(s);      
    }


    //Long audio track
    loadMusic(name, src, volume = 1) {
        const a = new Audio(src);
        a.loop = true;
        this.music[name] = a;
    }
    playMusic(name) {
        if (this.muted) return;

        const m = this.music[name];
        if (!m) return;

        m.volume = 0.2
        m.play().catch(() => {});
    }
    
}

const sound = new SoundManager();

//Pool size controls audio overlap
sound.load("drop-1", "./audio/item-drop-1.wav", 1, 0.3);
sound.load("drop-2", "./audio/item-drop-2.wav", 1, 0.1);
sound.load("drop-3", "./audio/item-drop-3.wav", 1, 0.4);
sound.load("drop-4", "./audio/item-drop-4.wav", 1, 0.3);

sound.load("btn-1", "./audio/btn-1.wav", 1, 0.05);
sound.load("btn-2", "./audio/btn-2.wav", 1, 0.1);
sound.load("btn-3", "./audio/btn-3.wav", 1, 0.1);
sound.load("btn-4", "./audio/btn-4.wav", 1, 0.05);

sound.load("pay-1", "./audio/pay-1.wav", 1, 0.1);
sound.load("pay-2", "./audio/pay-2.wav", 1, 0.2);
sound.load("pay-3", "./audio/pay-3.wav", 1, 0.2);
sound.load("pay-4", "./audio/pay-4.wav", 1, 0.1);

sound.load("turn-1", "./audio/turn-1.wav", 1, 0.1);
sound.load("turn-2", "./audio/turn-2.wav", 1, 0.1);
sound.load("turn-3", "./audio/turn-3.wav", 1, 0.3);
sound.load("turn-4", "./audio/turn-4.wav", 1, 0.2);

sound.load("die-1", "./audio/die-1.wav", 1, 0.5);
sound.load("die-2", "./audio/die-2.wav", 1, 0.2);
sound.load("die-3", "./audio/die-3.wav", 1, 0.1);
sound.load("die-4", "./audio/die-3.wav", 1, 0.2);



sound.load("cantPay", "./audio/cantpay.wav", 1, 0.5);

sound.load("item-fx", "./audio/item-fx.wav", 1, 0.3);

// sound.loadMusic("bg-audio", "./audio/bg-audio.mp3");
// sound.playMusic(`bg-audio`);

el('mute').addEventListener("click", () => {
    sound.toggleMute();
    el('mute').classList.toggle("audioOff")
    el('mute').blur();
    playSFX('btn')
});

function playSFX(type, mode){
    
    if(mode === "single"){
        sound.play(`${type}`); 
    }
    else {
        sound.play(`${type}-${rngNoRepeat(4)}`); 
    }
}