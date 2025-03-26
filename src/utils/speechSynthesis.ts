export interface SpeechOptions {
  voice?: SpeechSynthesisVoice | null;
  rate?: number;
  pitch?: number;
  volume?: number;
}

/**
 * Utility class to handle text-to-speech functionality
 */
export class SpeechSynthesisService {
  private static instance: SpeechSynthesisService;
  private synth: SpeechSynthesis;
  private isSpeaking: boolean = false;
  private utterance: SpeechSynthesisUtterance | null = null;
  private defaultVoice: SpeechSynthesisVoice | null = null;
  private speechEndCallbacks: Array<() => void> = [];

  private constructor() {
    this.synth = window.speechSynthesis;
    // Try to select a better voice by default
    setTimeout(() => {
      const voices = this.getVoices();
      // Try to find Google UK voice, Microsoft voices, or any voice that seems high quality
      const preferredVoice = voices.find(voice => 
        voice.name.includes('Google UK English') || 
        voice.name.includes('Microsoft') ||
        voice.name.includes('Premium')
      );
      this.defaultVoice = preferredVoice || null;
    }, 100);
  }

  public static getInstance(): SpeechSynthesisService {
    if (!SpeechSynthesisService.instance) {
      SpeechSynthesisService.instance = new SpeechSynthesisService();
    }
    return SpeechSynthesisService.instance;
  }

  public getVoices(): SpeechSynthesisVoice[] {
    return this.synth.getVoices();
  }

  public speak(text: string, options?: SpeechOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!text.trim()) {
        resolve();
        return;
      }

      // Cancel any ongoing speech
      this.stop();

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Set options
      if (options?.voice) {
        utterance.voice = options.voice;
      } else if (this.defaultVoice) {
        utterance.voice = this.defaultVoice;
      }
      
      utterance.rate = options?.rate ?? 1;
      utterance.pitch = options?.pitch ?? 1;
      utterance.volume = options?.volume ?? 1;

      utterance.onend = () => {
        this.isSpeaking = false;
        this.utterance = null;
        // Notify all callbacks that speech has ended
        this.speechEndCallbacks.forEach(callback => callback());
        this.speechEndCallbacks = [];
        resolve();
      };

      utterance.onerror = (event) => {
        this.isSpeaking = false;
        this.utterance = null;
        // Notify all callbacks even on error
        this.speechEndCallbacks.forEach(callback => callback());
        this.speechEndCallbacks = [];
        reject(new Error(`Speech synthesis error: ${event.error}`));
      };

      this.utterance = utterance;
      this.isSpeaking = true;
      this.synth.speak(utterance);
    });
  }

  public onSpeechEnd(callback: () => void): void {
    if (!this.isSpeaking) {
      // If not speaking, call immediately
      setTimeout(callback, 0);
    } else {
      // Otherwise add to callback queue
      this.speechEndCallbacks.push(callback);
    }
  }

  public stop(): void {
    if (this.isSpeaking) {
      this.synth.cancel();
      this.isSpeaking = false;
      this.utterance = null;
      // Notify all callbacks
      this.speechEndCallbacks.forEach(callback => callback());
      this.speechEndCallbacks = [];
    }
  }

  public isPending(): boolean {
    return this.isSpeaking;
  }

  public pause(): void {
    if (this.isSpeaking) {
      this.synth.pause();
    }
  }

  public resume(): void {
    if (this.synth.paused) {
      this.synth.resume();
    }
  }
}

export default SpeechSynthesisService.getInstance();
