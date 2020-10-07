export enum AudioType {
  MUSIC_GAME,

  SFX_THUD,
  SFX_ROLL,
};

function getAudioPath(path: string) {
  return window.location.origin + window.location.pathname + path;
}

class AudioUtil {

  private lastType: AudioType;
  private music: HTMLAudioElement;

  private fxThud: HTMLAudioElement = new Audio(getAudioPath("sounds/352110__inspectorj__dropping-wood-d.mp3"));
  private fxRoll: HTMLAudioElement = new Audio(getAudioPath("sounds/506914__schoman3__dice-roll.mp3"));

  constructor() { }

  public stopMusic() {
    this.lastType = null;
    if (this.music) {
      this.music.pause();
      this.music = null;
    }
  }

  public playMusic(type: AudioType) {

    if (this.lastType === type) {
      return;
    }
    this.stopMusic();

    switch (type) {
      case AudioType.MUSIC_GAME:
        this.music = new Audio(getAudioPath("sounds/479192__nsstudios__wind-blowing-loop-1.wav"));
        break;
    }

    if (this.music) {
      this.lastType = type;
      if (typeof this.music.loop == 'boolean') {
        this.music.loop = true;
      }
      else {
        this.music.addEventListener('ended', function () {
          this.currentTime = 0;
          this.play();
        }, false);
      }
      this.music.play();
    }
  }

  public playSoundEffect(type: AudioType) {
    switch (type) {
      case AudioType.SFX_THUD:
        this.fxThud.play();
        break;

      case AudioType.SFX_ROLL:
        this.fxRoll.play();
        break;
    }
  }

}

export const audioUtil = new AudioUtil();