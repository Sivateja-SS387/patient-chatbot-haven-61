/**
 * Service to check audio quality and filter out noise and unintentional audio
 */
export class AudioQualityChecker {
  private static instance: AudioQualityChecker;
  private audioLevelHistory: number[] = [];
  private consistentAudioThreshold: number = 0.1; // Higher threshold for intentional speech
  private minRecordingDuration: number = 300; // Minimum duration (ms) to consider valid input
  private maxHistoryLength: number = 20; // Maximum history length to maintain
  
  private constructor() {}

  public static getInstance(): AudioQualityChecker {
    if (!AudioQualityChecker.instance) {
      AudioQualityChecker.instance = new AudioQualityChecker();
    }
    return AudioQualityChecker.instance;
  }

  public addAudioLevel(level: number): void {
    this.audioLevelHistory.push(level);
    
    // Keep only the most recent history
    if (this.audioLevelHistory.length > this.maxHistoryLength) {
      this.audioLevelHistory.shift();
    }
  }

  public clearHistory(): void {
    this.audioLevelHistory = [];
  }

  public isIntentionalSpeech(recordingDuration: number): boolean {
    // No history yet
    if (this.audioLevelHistory.length < 3) {
      return false;
    }

    // Check recording duration
    if (recordingDuration < this.minRecordingDuration) {
      console.log('Recording too short:', recordingDuration, 'ms');
      return false;
    }

    // Check if there are enough samples above the consistency threshold
    const significantSamples = this.audioLevelHistory.filter(
      level => level > this.consistentAudioThreshold
    );
    
    // At least 20% of samples should be above threshold
    const isSignificant = significantSamples.length > this.audioLevelHistory.length * 0.2;
    
    // Check for audio level consistency (not just random noise spikes)
    // Calculate standard deviation to check for consistency
    const avg = this.audioLevelHistory.reduce((sum, val) => sum + val, 0) / this.audioLevelHistory.length;
    const variance = this.audioLevelHistory.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / this.audioLevelHistory.length;
    const stdDev = Math.sqrt(variance);
    
    // Lower standard deviation means more consistent audio (not just random noise)
    const isConsistent = stdDev < 0.15;
    
    console.log('Audio quality check:', { 
      significantSamples: significantSamples.length, 
      totalSamples: this.audioLevelHistory.length,
      isSignificant,
      avgLevel: avg,
      stdDev,
      isConsistent,
      duration: recordingDuration
    });
    
    return isSignificant && isConsistent;
  }
}
