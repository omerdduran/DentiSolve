import fs from 'fs';
import fsPromises from 'fs/promises';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import archiver from 'archiver';
import AdmZip from 'adm-zip';

const prisma = new PrismaClient();

const BACKUP_DIR = process.env.BACKUP_DIR || path.join(process.cwd(), 'backups');
const DB_PATH = process.env.DB_PATH || path.join(process.cwd(), 'dev.db');
const UPLOADS_PATH = process.env.UPLOADS_PATH || path.join(process.cwd(), 'public', 'uploads');

// Ensure backup directory exists
fsPromises.mkdir(BACKUP_DIR, { recursive: true }).catch(console.error);

export async function createBackup(): Promise<{ fileName: string; size: number }> {
    const fileName = `backup_${new Date().toISOString().replace(/:/g, '-')}.zip`;
    const filePath = path.join(BACKUP_DIR, fileName);

    return new Promise((resolve, reject) => {
        const output = fs.createWriteStream(filePath);
        const archive = archiver('zip', {
            zlib: { level: 9 } // Sets the compression level.
        });

        output.on('close', async () => {
            try {
                const stats = await fsPromises.stat(filePath);
                const backup = await prisma.backup.create({
                    data: {
                        fileName,
                        size: stats.size,
                    },
                });
                console.log('Backup created and saved to database:', backup); // Add this log
                resolve({ fileName: backup.fileName, size: backup.size });
            } catch (error) {
                console.error('Error saving backup to database:', error); // Add this log
                reject(error);
            }
        });

        archive.on('error', (err) => {
            console.error('Error creating zip archive:', err); // Add this log
            reject(err);
        });

        archive.pipe(output);

        // Add the database file to the archive
        archive.file(DB_PATH, { name: path.basename(DB_PATH) });

        // Add the uploads directory to the archive
        archive.directory(UPLOADS_PATH, 'uploads');

        archive.finalize();
    });
}

async function verifyPhysicalBackup(backup: { fileName: string }): Promise<boolean> {
    try {
        const filePath = path.join(BACKUP_DIR, backup.fileName);
        await fsPromises.access(filePath, fs.constants.F_OK);
        return true;
    } catch (error) {
        console.error(`Physical backup file not found for: ${backup.fileName}`);
        return false;
    }
}

export async function getBackups() {
    // Get all backups from database
    const dbBackups = await prisma.backup.findMany({
        orderBy: { createdAt: 'desc' },
    });

    // Verify each backup exists physically
    const verifiedBackups = await Promise.all(
        dbBackups.map(async (backup) => {
            const exists = await verifyPhysicalBackup(backup);
            if (!exists) {
                // If physical file doesn't exist, remove from database
                try {
                    await prisma.backup.delete({
                        where: { id: backup.id }
                    });
                    console.log(`Removed non-existent backup from database: ${backup.fileName}`);
                    return null;
                } catch (error) {
                    console.error(`Error removing backup from database: ${backup.fileName}`, error);
                    return null;
                }
            }
            return exists ? backup : null;
        })
    );

    // Filter out null values (non-existent backups)
    return verifiedBackups.filter((backup): backup is NonNullable<typeof backup> => backup !== null);
}

export async function deleteBackup(id: string): Promise<void> {
    const backup = await prisma.backup.findUnique({ where: { id } });
    if (!backup) {
        throw new Error('Backup not found');
    }

    const filePath = path.join(BACKUP_DIR, backup.fileName);
    await fsPromises.unlink(filePath);

    await prisma.backup.delete({ where: { id } });
}

export async function restoreBackup(backupPath: string): Promise<void> {
    console.log('Starting backup restoration from:', backupPath);
    // Veritabanı bağlantısını kapat
    await prisma.$disconnect();

    try {
        const zip = new AdmZip(backupPath);
        console.log('Zip file opened successfully');

        // Zip dosyasını çıkar
        const extractPath = path.dirname(DB_PATH);
        console.log('Extracting to:', extractPath);
        zip.extractAllTo(extractPath, true);
        console.log('Zip file extracted successfully');

        // Veritabanı dosyasını bul ve yerine koy
        const dbFiles = zip.getEntries().filter(entry => entry.entryName.endsWith('dev.db'));
        if (dbFiles.length === 0) {
            throw new Error('Database file not found in the backup');
        }
        const dbFile = dbFiles[0];
        const extractedDbPath = path.join(extractPath, dbFile.entryName);
        console.log('Moving extracted DB from', extractedDbPath, 'to', DB_PATH);
        await fsPromises.rename(extractedDbPath, DB_PATH);
        console.log('Database file moved successfully');

        // Uploads klasörünü geri yükle
        const uploadsFolders = zip.getEntries().filter(entry => entry.entryName.includes('uploads/') && entry.isDirectory);
        if (uploadsFolders.length > 0) {
            const uploadsFolder = uploadsFolders[0];
            const extractedUploadsPath = path.join(extractPath, uploadsFolder.entryName);
            console.log('Restoring uploads folder');
            await fsPromises.rm(UPLOADS_PATH, { recursive: true, force: true });
            await fsPromises.rename(extractedUploadsPath, UPLOADS_PATH);
            console.log('Uploads folder restored successfully');
        } else {
            console.log('No uploads folder found in the backup');
        }

        // Temizlik: Çıkarılan diğer dosya ve klasörleri sil
        const backupFolderName = path.basename(backupPath, '.zip');
        const extractedBackupFolder = path.join(extractPath, backupFolderName);
        await fsPromises.rm(extractedBackupFolder, { recursive: true, force: true });
        console.log('Cleaned up extracted files');

    } catch (error) {
        console.error('Error during backup restoration:', error);
        throw error;
    } finally {
        // Prisma client'ı yeniden başlat
        await prisma.$connect();
        console.log('Prisma client reconnected');
    }
}

export async function getBackupFilePath(fileName: string): Promise<string> {
    const filePath = path.join(BACKUP_DIR, fileName);
    try {
        await fsPromises.access(filePath);
        return filePath;
    } catch (error) {
        throw new Error('Backup file not found');
    }
}

export async function validateBackupFile(filePath: string): Promise<boolean> {
    try {
        console.log('Validating backup file:', filePath);
        const zip = new AdmZip(filePath);
        const zipEntries = zip.getEntries();

        console.log('Zip entries:', zipEntries.map(entry => entry.entryName));

        // Check if the zip contains the necessary files (e.g., database file and uploads folder)
        const hasDbFile = zipEntries.some(entry => entry.entryName.endsWith('dev.db'));
        const hasUploadsFolder = zipEntries.some(entry => entry.entryName.includes('uploads/'));

        console.log('Has DB file:', hasDbFile, 'Has uploads folder:', hasUploadsFolder);

        return hasDbFile && hasUploadsFolder;
    } catch (error) {
        console.error('Error validating backup file:', error);
        return false;
    }
}


export async function getBackupFileStream(fileName: string) {
    const filePath = await getBackupFilePath(fileName);
    return fs.createReadStream(filePath);
}

export async function getBackupFileSize(fileName: string): Promise<number> {
    const filePath = await getBackupFilePath(fileName);
    const stats = await fsPromises.stat(filePath);
    return stats.size;
}