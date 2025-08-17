export interface ProgressStage {
  id: string;
  name: string;
  startProgress: number;
  endProgress: number;
  duration: number; // in milliseconds
}

export interface ProgressManagerCallbacks {
  onProgressUpdate: (progress: number, stage: string) => void;
  onStageComplete: (stageId: string) => void;
  onAllComplete: () => void;
}

export class ProgressManager {
  private stages: ProgressStage[] = [
    {
      id: 'analyzing',
      name: 'Analyzing food...',
      startProgress: 0,
      endProgress: 30,
      duration: 3000, // 3 seconds
    },
    {
      id: 'separating',
      name: 'Separating ingredients...',
      startProgress: 30,
      endProgress: 60,
      duration: 4000, // 4 seconds
    },
    {
      id: 'breaking_down',
      name: 'Breaking down macros...',
      startProgress: 60,
      endProgress: 90,
      duration: 3000, // 3 seconds
    },
    {
      id: 'finalizing',
      name: 'Finalizing results...',
      startProgress: 90,
      endProgress: 99,
      duration: 2000, // 2 seconds
    },
  ];

  private currentProgress: number = 0;
  private currentStageIndex: number = 0;
  private isRunning: boolean = false;
  private intervalId: NodeJS.Timeout | null = null;
  private callbacks: ProgressManagerCallbacks;
  private timeouts: NodeJS.Timeout[] = [];

  constructor(callbacks: ProgressManagerCallbacks) {
    this.callbacks = callbacks;
  }

  getCurrentProgress(): number {
    return this.currentProgress;
  }

  start(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.currentStageIndex = 0;
    this.runStage(this.currentStageIndex);
  }

  stop(): void {
    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  reset(): void {
    this.stop();
    this.currentStageIndex = 0;
  }

  // Allow external completion (e.g., when AI analysis finishes early)
  completeEarly(): void {
    if (!this.isRunning) return;
    
    this.stop();
    this.callbacks.onProgressUpdate(100, 'Complete!');
    this.callbacks.onAllComplete();
  }

  // Stick at 99% until external completion
  stickAt99(): void {
    if (!this.isRunning) return;
    
    this.stop();
    this.callbacks.onProgressUpdate(99, 'Finalizing results...');
  }

  private runStage(stageIndex: number): void {
    if (stageIndex >= this.stages.length || !this.isRunning) {
      return;
    }

    const stage = this.stages[stageIndex];
    const startTime = Date.now();
    const progressRange = stage.endProgress - stage.startProgress;

    const updateProgress = () => {
      if (!this.isRunning) return;

      const elapsed = Date.now() - startTime;
      const stageProgress = Math.min(elapsed / stage.duration, 1);
      const currentProgress = stage.startProgress + (progressRange * stageProgress);
      
      this.currentProgress = currentProgress;
      this.callbacks.onProgressUpdate(currentProgress, stage.name);

      if (stageProgress >= 1) {
        this.callbacks.onStageComplete(stage.id);
        this.currentStageIndex++;
        
        if (this.currentStageIndex >= this.stages.length) {
          this.currentProgress = 100;
          this.callbacks.onAllComplete();
          this.isRunning = false;
        } else {
          this.runStage(this.currentStageIndex);
        }
      } else {
        this.intervalId = setTimeout(updateProgress, 50);
      }
    };

    updateProgress();
  }

  // Get current stage info
  getCurrentStage(): ProgressStage | null {
    if (this.currentStageIndex >= this.stages.length) return null;
    return this.stages[this.currentStageIndex];
  }

  // Get all stages (for external reference)
  getAllStages(): ProgressStage[] {
    return [...this.stages];
  }
} 