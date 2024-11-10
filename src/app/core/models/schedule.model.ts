export interface Schedule {
    id?: string;
    doctorId: string;
    scheduleType: 'DAILY' | 'WEEKLY' | 'MONTHLY';
    dayOfWeek?: number | null;
    specificDate?: [number, number, number] | null;
    dayOfMonth?: number | null;
    startTime: [number, number];
    endTime: [number, number];
    isActive: boolean;
}

export enum ScheduleType {
    WEEKLY = 'WEEKLY',
    DAILY = 'DAILY',
    MONTHLY = 'MONTHLY'
}

export enum DayOfWeek {
    MONDAY = 1,
    TUESDAY = 2,
    WEDNESDAY = 3,
    THURSDAY = 4,
    FRIDAY = 5,
    SATURDAY = 6,
    SUNDAY = 7
}