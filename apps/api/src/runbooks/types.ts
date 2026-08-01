export interface RunbookStep {
  order: number;
  description: string;
  command?: string;
}

export interface RunbookStepResult {
  order: number;
  completed: boolean;
  note?: string;
}
