import { NextRequest, NextResponse } from 'next/server';
import { createBackup, deleteBackup, getBackups, restoreBackup, getBackupFilePath, validateBackupFile } from './backupUtils';
import { scheduleBackup, stopScheduledBackup, getScheduleStatus } from './scheduledBackup';
import { promises as fs } from 'fs';
import path from "path";

export const config = {
    api: {
        bodyParser: false,
    },
};

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action');

    if (action === 'download') {
        return handleDownload(request);
    }

    if (action === 'schedule-status') {
        return NextResponse.json(getScheduleStatus());
    }

    try {
        const backups = await getBackups();
        return NextResponse.json(backups);
    } catch (error) {
        console.error('Failed to fetch backups:', error);
        return NextResponse.json({ error: 'Failed to fetch backups' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const { schedule } = await request.json();

        if (schedule) {
            scheduleBackup(schedule);
            return NextResponse.json({ message: 'Backup scheduled successfully', schedule });
        } else {
            const backup = await createBackup();
            console.log('Backup created:', backup); // Log the created backup
            return NextResponse.json({ message: 'Backup created successfully', backup });
        }
    } catch (error) {
        console.error('Error in POST /api/backups:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (id === 'schedule') {
        stopScheduledBackup();
        return NextResponse.json({ message: 'Scheduled backup stopped' });
    }

    if (!id) {
        return NextResponse.json({ error: 'Backup ID is required' }, { status: 400 });
    }

    try {
        await deleteBackup(id);
        return NextResponse.json({ message: 'Backup deleted successfully' });
    } catch (error) {
        console.error('Failed to delete backup:', error);
        return NextResponse.json({ error: 'Failed to delete backup' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        console.log('Backup restore process started');
        const formData = await request.formData();
        const file = formData.get('backup') as File | null;

        if (!file) {
            console.error('No backup file provided');
            return NextResponse.json({ error: 'No backup file provided' }, { status: 400 });
        }

        console.log('Received file:', file.name, 'Size:', file.size);

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const tempPath = path.join(process.cwd(), 'temp_restore.zip');
        console.log('Temporary file path:', tempPath);

        await fs.writeFile(tempPath, buffer);
        console.log('Backup file saved to temporary location');

        if (await validateBackupFile(tempPath)) {
            console.log('Backup file validated successfully');
            await restoreBackup(tempPath);
            console.log('Backup restored successfully');
            await fs.unlink(tempPath);
            console.log('Temporary file deleted');
            return NextResponse.json({ message: 'Backup restored successfully' });
        } else {
            console.error('Invalid backup file');
            await fs.unlink(tempPath);
            return NextResponse.json({ error: 'Invalid backup file' }, { status: 400 });
        }
    } catch (error) {
        console.error('Failed to restore backup:', error);
        return NextResponse.json({ error: 'Failed to restore backup', details: (error as Error).message }, { status: 500 });
    }
}

async function handleDownload(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const fileName = searchParams.get('fileName');

    if (!fileName) {
        return NextResponse.json({ error: 'File name is required' }, { status: 400 });
    }

    try {
        const filePath = await getBackupFilePath(fileName);
        const fileBuffer = await fs.readFile(filePath);

        return new NextResponse(fileBuffer, {
            status: 200,
            headers: {
                'Content-Disposition': `attachment; filename=${fileName}`,
                'Content-Type': 'application/zip',
            },
        });
    } catch (error) {
        console.error('Failed to download backup:', error);
        return NextResponse.json({ error: 'Failed to download backup' }, { status: 500 });
    }
}