export enum Severity {
  Critical = 'Critical',
  Major = 'Major',
  Minor = 'Minor',
  Info = 'Info',
}

export interface ReviewIssue {
  line: number | string;
  severity: Severity;
  description: string;
  suggestion: string;
  done?: boolean;
}
