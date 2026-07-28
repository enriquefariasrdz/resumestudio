import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const whereCondition = session.role === 'ADMIN' ? {} : { userId: session.userId };

    const resumes = await prisma.resume.findMany({
      where: whereCondition,
      orderBy: { updatedAt: 'desc' },
      include: {
        user: {
          select: { email: true, name: true }
        }
      }
    });

    return NextResponse.json(resumes);
  } catch (error) {
    console.error('Database GET Error:', error);
    return NextResponse.json({ error: 'Failed to fetch resumes' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, versionName, content } = body;

    const newResume = await prisma.resume.create({
      data: {
        userId: session.userId,
        title: title || 'Software Engineer Resume',
        versionName: versionName || 'v1',
        content: typeof content === 'string' ? content : JSON.stringify(content),
      },
    });

    return NextResponse.json({ success: true, data: newResume });
  } catch (error) {
    console.error('Database POST Error:', error);
    return NextResponse.json({ success: false, error: 'Database write failed' }, { status: 500 });
  }
}