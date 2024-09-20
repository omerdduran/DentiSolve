import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
        return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const filename = file.name.replace(/\s/g, '-');
    const ext = path.extname(filename);
    const timestamp = Date.now();
    const uniqueFilename = `${path.basename(filename, ext)}-${timestamp}${ext}`;

    try {
        const uploadDir = path.join(process.cwd(), 'public', 'uploads');

        // Ensure the upload directory exists
        await mkdir(uploadDir, { recursive: true });

        await writeFile(path.join(uploadDir, uniqueFilename), Buffer.from(buffer));
        const fileUrl = `/uploads/${uniqueFilename}`;

        return NextResponse.json({ url: fileUrl }, { status: 200 });
    } catch (error) {
        console.error('Error saving file:', error);
        return NextResponse.json({ error: 'Error saving file' }, { status: 500 });
    }
}