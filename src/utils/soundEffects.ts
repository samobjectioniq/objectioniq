// Sound effects for premium user experience
class SoundEffects {
  private audioContext: AudioContext | null = null;
  private sounds: Map<string, AudioBuffer> = new Map();
  private enabled: boolean = true;

  constructor() {
    if (typeof window !== 'undefined') {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  // Enable/disable sound effects
  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  // Generate a simple beep sound
  private generateBeep(frequency: number, duration: number, type: OscillatorType = 'sine'): AudioBuffer {
    if (!this.audioContext) return null as any;

    const sampleRate = this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const output = buffer.getChannelData(0);

    for (let i = 0; i < buffer.length; i++) {
      output[i] = Math.sin(2 * Math.PI * frequency * i / sampleRate);
    }

    return buffer;
  }

  // Play a sound
  private async playSound(buffer: AudioBuffer, volume: number = 0.3) {
    if (!this.enabled || !this.audioContext) return;

    const source = this.audioContext.createBufferSource();
    const gainNode = this.audioContext.createGain();
    
    source.buffer = buffer;
    gainNode.gain.value = volume;
    
    source.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    source.start();
  }

  // Success sound
  async playSuccess() {
    const buffer = this.generateBeep(800, 0.1);
    await this.playSound(buffer, 0.2);
  }

  // Error sound
  async playError() {
    const buffer = this.generateBeep(400, 0.2);
    await this.playSound(buffer, 0.2);
  }

  // Notification sound
  async playNotification() {
    const buffer = this.generateBeep(600, 0.15);
    await this.playSound(buffer, 0.15);
  }

  // Call start sound
  async playCallStart() {
    const buffer = this.generateBeep(1000, 0.3);
    await this.playSound(buffer, 0.25);
  }

  // Call end sound
  async playCallEnd() {
    const buffer = this.generateBeep(500, 0.4);
    await this.playSound(buffer, 0.25);
  }

  // Mute toggle sound
  async playMuteToggle() {
    const buffer = this.generateBeep(700, 0.1);
    await this.playSound(buffer, 0.15);
  }

  // Session complete sound
  async playSessionComplete() {
    // Play a sequence of beeps
    await this.playSound(this.generateBeep(600, 0.1), 0.2);
    setTimeout(() => this.playSound(this.generateBeep(800, 0.1), 0.2), 100);
    setTimeout(() => this.playSound(this.generateBeep(1000, 0.2), 0.2), 200);
  }
}

// Create a singleton instance
export const soundEffects = new SoundEffects();

// Export individual functions for convenience
export const playSuccess = () => soundEffects.playSuccess();
export const playError = () => soundEffects.playError();
export const playNotification = () => soundEffects.playNotification();
export const playCallStart = () => soundEffects.playCallStart();
export const playCallEnd = () => soundEffects.playCallEnd();
export const playMuteToggle = () => soundEffects.playMuteToggle();
export const playSessionComplete = () => soundEffects.playSessionComplete();
export const setSoundEnabled = (enabled: boolean) => soundEffects.setEnabled(enabled); 