import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save to public/uploads
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    
    // Ensure directory exists
    await mkdir(uploadDir, { recursive: true });

    // Sanitize filename to prevent directory traversal
    const safeFileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
    const filePath = join(uploadDir, safeFileName);
    
    await writeFile(filePath, buffer);

    const fileUrl = `/uploads/${safeFileName}`;

    return NextResponse.json({ success: true, url: fileUrl });
  } catch (error) {
    console.error('File upload API error:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
