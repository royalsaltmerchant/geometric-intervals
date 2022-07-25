function AudioControl() {
  this.playing = false
  
  this.start = function(freq) {
    this.context = new AudioContext()
    this.oscillator = this.context.createOscillator()
    this.oscillator.type = "sine";
    this.amp = this.context.createGain();
    this.amp.gain.value = 1;
    this.oscillator.connect(this.amp);
    this.amp.connect(this.context.destination);
    this.oscillator.frequency.value = freq;

    this.oscillator.start()
    this.oscillator.stop(this.context.currentTime + 0.5)
  }
}

export var audioControl = new AudioControl