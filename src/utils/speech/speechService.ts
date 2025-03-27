
import { SpeechOptions } from './types';
import speechSynthesis from './speechSynthesis';
import audioRecorder from './audioRecorder';

/**
 * Combined service that provides both speech synthesis and audio recording
 */
class SpeechService {
  private static instance: SpeechService;
  
  private constructor() {}
  
  public static getInstance(): SpeechService {
    if (!SpeechService.instance) {
      SpeechService.instance = new SpeechService();
    }
    return SpeechService.instance;
  }
  
  // Speech synthesis methods
  public speak(text: string, options?: SpeechOptions): Promise<void> {
    return speechSynthesis.speak(text, options);
  }
  
  public stop(): void {
    speechSynthesis.stop();
  }
  
  public isPending(): boolean {
    return speechSynthesis.isPending();
  }
  
  public pause(): void {
    speechSynthesis.pause();
  }
  
  public resume(): void {
    speechSynthesis.resume();
  }
  
  public getVoices(): SpeechSynthesisVoice[] {
    return speechSynthesis.getVoices();
  }
  
  // Audio recording methods
  public startContinuousRecording(onAudioAvailable?: (audio: Blob) => void): Promise<boolean> {
    return audioRecorder.startContinuousRecording(onAudioAvailable);
  }
  
  public startRecording(onAudioAvailable?: (audio: Blob) => void): Promise<boolean> {
    return audioRecorder.startRecording(onAudioAvailable);
  }
  
  public stopRecording(): Promise<Blob | null> {
    return audioRecorder.stopRecording();
  }
  
  public stopContinuousRecording(): void {
    audioRecorder.stopContinuousRecording();
  }
  
  public pauseRecording(): Promise<void> {
    return audioRecorder.pauseRecording();
  }
  
  public resumeRecording(): Promise<void> {
    return audioRecorder.resumeRecording();
  }
  
  public getRecordingDuration(): number {
    return audioRecorder.getRecordingDuration();
  }
  
  public isCurrentlyRecording(): boolean {
    return audioRecorder.isCurrentlyRecording();
  }
  
  public getAudioLevel(): number {
    return audioRecorder.getAudioLevel();
  }
  
  public setAudioQualityCheck(enabled: boolean): void {
    audioRecorder.setAudioQualityCheck(enabled);
  }
  
  public cleanupRecording(): void {
    audioRecorder.cleanupRecording();
  }
}

export default SpeechService.getInstance();
