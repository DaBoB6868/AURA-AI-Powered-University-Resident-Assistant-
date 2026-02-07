import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const RA_FILE = path.join(process.cwd(), 'backend', 'data', 'ra-directory.json');

export async function GET() {
  try {
    if (!fs.existsSync(RA_FILE)) {
      return NextResponse.json([]);
    }
    const raw = fs.readFileSync(RA_FILE, 'utf-8');
    const data = JSON.parse(raw || '[]');
    return NextResponse.json(data);
  } catch (err: any) {
    console.error('RA directory read error:', err);
    return NextResponse.json([], { status: 500 });
  }
}
