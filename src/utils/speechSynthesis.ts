
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
  
  // Audio recording properties
  private audioContext: AudioContext | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private audioStream: MediaStream | null = null;
  private audioChunks: Blob[] = [];
  private isRecording: boolean = false;
  private recordingStartTime: number = 0;
  private onAudioAvailable: ((audio: Blob) => void) | null = null;
  private silenceTimeout: number | null = null;
  private audioLevel: number = 0;
  private silenceThreshold: number = 0.05; // Increased from 0.01 to 0.05 for better stability
  private silenceDetectionTimer: any = null;
  private recordingTimer: any = null;
  private recordingMaxDuration: number = 30000; // 30 seconds max recording

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
        resolve();
      };

      utterance.onerror = (event) => {
        this.isSpeaking = false;
        this.utterance = null;
        reject(new Error(`Speech synthesis error: ${event.error}`));
      };

      this.utterance = utterance;
      this.isSpeaking = true;
      this.synth.speak(utterance);
    });
  }

  public stop(): void {
    if (this.isSpeaking) {
      this.synth.cancel();
      this.isSpeaking = false;
      this.utterance = null;
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

  // Recording methods
  public async startContinuousRecording(onAudioAvailable?: (audio: Blob) => void): Promise<boolean> {
    if (this.isRecording) {
      return true; // Already recording
    }

    try {
      this.onAudioAvailable = onAudioAvailable || null;
      
      if (!this.audioContext) {
        this.audioContext = new AudioContext();
      }
      
      if (!this.audioStream) {
        this.audioStream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          } 
        });
      }

      // Set up audio analyzer to detect silence
      if (this.audioContext && this.audioStream) {
        const source = this.audioContext.createMediaStreamSource(this.audioStream);
        const analyser = this.audioContext.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        
        // Monitor audio levels
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        const checkAudioLevel = () => {
          if (!this.isRecording) return;
          
          analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < bufferLength; i++) {
            sum += dataArray[i];
          }
          this.audioLevel = sum / bufferLength / 255;
          
          // If audio level is above threshold, reset silence detection
          if (this.audioLevel > this.silenceThreshold) {
            if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
              this.startNewRecording();
            }
            // Reset silence timeout
            if (this.silenceTimeout) {
              clearTimeout(this.silenceTimeout);
              this.silenceTimeout = null;
            }
            // Set a new silence timeout
            this.silenceTimeout = window.setTimeout(() => {
              console.log('Silence detected, saving recording...');
              if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
                this.mediaRecorder.stop();
              }
            }, 1500); // 1.5s of silence
          }
          
          // Continue monitoring
          if (this.isRecording) {
            requestAnimationFrame(checkAudioLevel);
          }
        };
        
        // Start monitoring audio levels
        requestAnimationFrame(checkAudioLevel);
      }
      
      this.isRecording = true;
      console.log("Continuous recording started, monitoring audio levels");
      return true;
    } catch (error) {
      console.error('Failed to start continuous recording:', error);
      this.isRecording = false;
      this.cleanupRecording();
      return false;
    }
  }
  
  private startNewRecording(): void {
    try {
      if (!this.audioStream) return;
      
      this.audioChunks = [];
      
      const mimeType = 'audio/webm';
      
      this.mediaRecorder = new MediaRecorder(this.audioStream, {
        mimeType: mimeType,
        audioBitsPerSecond: 128000 // 128kbps
      });
      
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };
      
      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: mimeType });
        
        if (this.onAudioAvailable && audioBlob.size > 0) {
          this.onAudioAvailable(audioBlob);
        }
        
        this.audioChunks = [];
        console.log('Recording saved, size:', audioBlob.size);
      };
      
      this.mediaRecorder.start(100); // Collect data every 100ms
      this.recordingStartTime = Date.now();
      
      // Set a maximum recording duration
      if (this.recordingTimer) {
        clearTimeout(this.recordingTimer);
      }
      
      this.recordingTimer = setTimeout(() => {
        if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
          console.log('Max recording duration reached, stopping...');
          this.mediaRecorder.stop();
        }
      }, this.recordingMaxDuration);
      
      console.log('New recording started');
    } catch (error) {
      console.error('Error starting new recording:', error);
    }
  }
  
  public async startRecording(onAudioAvailable?: (audio: Blob) => void): Promise<boolean> {
    if (this.isRecording) {
      return true; // Already recording
    }

    try {
      this.onAudioAvailable = onAudioAvailable || null;
      this.audioChunks = [];
      
      if (!this.audioContext) {
        this.audioContext = new AudioContext();
      }
      
      if (!this.audioStream) {
        this.audioStream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          } 
        });
      }
      
      const mimeType = 'audio/webm';
      
      this.mediaRecorder = new MediaRecorder(this.audioStream, {
        mimeType: mimeType,
        audioBitsPerSecond: 128000 // 128kbps
      });
      
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };
      
      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: mimeType });
        
        if (this.onAudioAvailable && audioBlob.size > 0) {
          this.onAudioAvailable(audioBlob);
        }
        
        this.audioChunks = [];
      };
      
      this.mediaRecorder.start(100); // Collect data every 100ms
      this.isRecording = true;
      this.recordingStartTime = Date.now();
      
      return true;
    } catch (error) {
      console.error('Failed to start recording:', error);
      this.isRecording = false;
      this.cleanupRecording();
      return false;
    }
  }
  
  public stopRecording(): Promise<Blob | null> {
    return new Promise((resolve) => {
      if (!this.isRecording || !this.mediaRecorder) {
        resolve(null);
        return;
      }
      
      const onStop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        this.isRecording = false;
        resolve(audioBlob.size > 0 ? audioBlob : null);
      };
      
      if (this.mediaRecorder.state !== 'inactive') {
        this.mediaRecorder.onstop = onStop;
        this.mediaRecorder.stop();
      } else {
        onStop();
      }
    });
  }
  
  public stopContinuousRecording(): void {
    if (this.silenceTimeout) {
      clearTimeout(this.silenceTimeout);
      this.silenceTimeout = null;
    }
    
    if (this.recordingTimer) {
      clearTimeout(this.recordingTimer);
      this.recordingTimer = null;
    }
    
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
    
    this.isRecording = false;
    this.cleanupRecording();
  }
  
  public async pauseRecording(): Promise<void> {
    if (this.isRecording && this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.pause();
    }
  }
  
  public async resumeRecording(): Promise<void> {
    if (this.isRecording && this.mediaRecorder && this.mediaRecorder.state === 'paused') {
      this.mediaRecorder.resume();
    }
  }
  
  public getRecordingDuration(): number {
    if (!this.isRecording || this.recordingStartTime === 0) {
      return 0;
    }
    return Date.now() - this.recordingStartTime;
  }
  
  public isCurrentlyRecording(): boolean {
    return this.isRecording;
  }
  
  public getAudioLevel(): number {
    return this.audioLevel;
  }
  
  public cleanupRecording(): void {
    if (this.silenceTimeout) {
      clearTimeout(this.silenceTimeout);
      this.silenceTimeout = null;
    }
    
    if (this.recordingTimer) {
      clearTimeout(this.recordingTimer);
      this.recordingTimer = null;
    }
    
    if (this.mediaRecorder) {
      if (this.mediaRecorder.state !== 'inactive') {
        this.mediaRecorder.stop();
      }
      this.mediaRecorder = null;
    }
    
    if (this.audioStream) {
      this.audioStream.getTracks().forEach(track => track.stop());
      this.audioStream = null;
    }
    
    this.isRecording = false;
    this.audioChunks = [];
    this.recordingStartTime = 0;
    this.onAudioAvailable = null;
    this.audioLevel = 0;
  }
}

export default SpeechSynthesisService.getInstance();
