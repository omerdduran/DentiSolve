import cron from 'node-cron';
import { createBackup } from './backupUtils';

let scheduledJob: cron.ScheduledTask | null = null;

export function scheduleBackup(cronExpression: string) {
    if (scheduledJob) {
        scheduledJob.stop();
    }

    scheduledJob = cron.schedule(cronExpression, async () => {
        console.log('Running scheduled backup...');
        try {
            await createBackup();
            console.log('Scheduled backup completed successfully.');
        } catch (error) {
            console.error('Scheduled backup failed:', error);
        }
    });

    console.log(`Backup scheduled with cron expression: ${cronExpression}`);
}

export function stopScheduledBackup() {
    if (scheduledJob) {
        scheduledJob.stop();
        scheduledJob = null;
        console.log('Scheduled backup stopped');
    } else {
        console.log('No scheduled backup to stop');
    }
}

export function getScheduleStatus() {
    return {
        isScheduled: !!scheduledJob,
        cronExpression: scheduledJob ? (scheduledJob as any).options.scheduled : null
    };
}