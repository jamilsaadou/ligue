import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const diagnostic = await prisma.diagnostic.findFirst({
      where: { status: 'active' },
      orderBy: { updatedAt: 'desc' },
      include: {
        categories: {
          orderBy: { sortOrder: 'asc' },
          include: {
            questions: {
              orderBy: { sortOrder: 'asc' },
              include: { options: { orderBy: { sortOrder: 'asc' } } }
            }
          }
        }
      }
    });

    if (!diagnostic) {
      return NextResponse.json({ ok: false, diagnostic: null });
    }

    return NextResponse.json({ ok: true, diagnostic });
  } catch (error) {
    console.error('Active diagnostic error:', error);
    return NextResponse.json({ ok: false, diagnostic: null }, { status: 500 });
  }
}
