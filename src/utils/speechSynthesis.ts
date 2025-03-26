
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
  private voicesLoaded: boolean = false;

  private constructor() {
    this.synth = window.speechSynthesis;
    this.initializeVoices();
    
    // Listen for voices changed event (important for Chrome)
    if (typeof window !== 'undefined') {
      window.speechSynthesis.addEventListener('voiceschanged', () => {
        this.initializeVoices();
      });
    }
  }

  private initializeVoices(): void {
    // Try to select a better voice by default
    const voices = this.getVoices();
    
    if (voices.length > 0) {
      // Try to find Google UK voice, Microsoft voices, or any voice that seems high quality
      const preferredVoice = voices.find(voice => 
        voice.name.includes('Google UK English') || 
        voice.name.includes('Microsoft') ||
        voice.name.includes('Premium')
      );
      this.defaultVoice = preferredVoice || voices[0];
      this.voicesLoaded = true;
      console.log("Voices loaded, default voice:", this.defaultVoice?.name);
    } else {
      // If voices aren't available yet, try again after a delay
      setTimeout(() => {
        if (!this.voicesLoaded) {
          this.initializeVoices();
        }
      }, 200);
    }
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

      this.isSpeaking = true;
      this.utterance = utterance;

      // Fix for Chrome issue where onend doesn't fire
      let timer: number | null = null;
      const checkSpeaking = () => {
        if (!this.synth.speaking) {
          if (timer) {
            clearInterval(timer);
            timer = null;
          }
          this.isSpeaking = false;
          this.utterance = null;
          
          // Notify all callbacks that speech has ended
          this.speechEndCallbacks.forEach(callback => callback());
          this.speechEndCallbacks = [];
          
          resolve();
        }
      };

      utterance.onend = () => {
        if (timer) {
          clearInterval(timer);
          timer = null;
        }
        this.isSpeaking = false;
        this.utterance = null;
        
        // Notify all callbacks that speech has ended
        this.speechEndCallbacks.forEach(callback => callback());
        this.speechEndCallbacks = [];
        
        resolve();
      };

      utterance.onerror = (event) => {
        if (timer) {
          clearInterval(timer);
          timer = null;
        }
        this.isSpeaking = false;
        this.utterance = null;
        
        // Notify all callbacks even on error
        this.speechEndCallbacks.forEach(callback => callback());
        this.speechEndCallbacks = [];
        
        reject(new Error(`Speech synthesis error: ${event.error}`));
      };

      // Speak the utterance
      try {
        this.synth.speak(utterance);
        
        // Chrome fix: start a timer to check if speech has ended
        timer = window.setInterval(checkSpeaking, 100);
      } catch (error) {
        console.error("Error speaking:", error);
        this.isSpeaking = false;
        this.utterance = null;
        reject(error);
      }
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
