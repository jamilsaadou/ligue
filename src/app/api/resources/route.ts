import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const countries = await prisma.country.findMany({
      where: { code: 'NE' },
      orderBy: { name: 'asc' },
      include: {
        resources: { orderBy: { name: 'asc' } }
      }
    });

    return NextResponse.json({ ok: true, countries });
  } catch (error) {
    console.error('Resources fetch error:', error);
    return NextResponse.json({ ok: false, countries: [] }, { status: 500 });
  }
}
