export interface UserStreakDTO {
  key: string;
  name: string;
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  current: number;
  longest: number;
  status: 'ACTIVE' | 'AT_RISK' | 'BROKEN' | 'NONE';
  freezesAvailable: number;
  lastActivePeriod: string | null;
  currentPeriod: string;
  /** Satisfied/frozen flags for the last 7 periods, oldest first. */
  recent: { period: string; state: 'done' | 'frozen' | 'missed' | 'pending' }[];
  nextMilestone: number | null;
}
