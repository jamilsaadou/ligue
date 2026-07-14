import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const diagnostics = await prisma.diagnostic.findMany({
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

    // Calculate stats for each diagnostic
    const diagnosticsWithStats = diagnostics.map((diagnostic) => {
      const totalQuestions = diagnostic.categories.reduce(
        (acc, cat) => acc + cat.questions.length,
        0
      );
      const totalCategories = diagnostic.categories.length;
      return {
        id: diagnostic.id,
        title: diagnostic.title,
        description: diagnostic.description,
        totalQuestions,
        totalCategories,
        categories: diagnostic.categories
      };
    });

    return NextResponse.json({ ok: true, diagnostics: diagnosticsWithStats });
  } catch (error) {
    console.error('List diagnostics error:', error);
    return NextResponse.json({ ok: false, diagnostics: [] }, { status: 500 });
  }
}
