import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminModule } from '@/lib/rbac';

type OptionInput = {
  text: string;
  points: number;
};

type QuestionInput = {
  text: string;
  options: OptionInput[];
};

type CategoryInput = {
  name: string;
  description?: string | null;
  icon?: string | null;
  questions: QuestionInput[];
};

type DiagnosticInput = {
  title?: string;
  description?: string | null;
  status?: 'draft' | 'active' | 'archived';
  version?: number;
  categories?: CategoryInput[];
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export async function POST(request: Request) {
  try {
    const session = await requireAdminModule('diagnostics');
    const payload = (await request.json()) as DiagnosticInput;
    const title = payload.title?.trim() || 'Diagnostic sans titre';
    const description = payload.description?.trim() || null;
    const status = payload.status || 'draft';
    const version = payload.version || 1;

    const diagnostic = await prisma.diagnostic.create({
      data: {
        title,
        description,
        status,
        version,
        createdById: session.id,
        categories: {
          create: (payload.categories || []).map((category, index) => {
            const categoryName = category.name?.trim() || 'Catégorie';
            return {
              name: categoryName,
              slug: slugify(categoryName),
              description: category.description?.trim() || null,
              icon: category.icon || null,
              sortOrder: index,
              questions: {
                create: category.questions.map((question, qIndex) => ({
                  text: question.text?.trim() || 'Question',
                  sortOrder: qIndex,
                  options: {
                    create: question.options.map((option, oIndex) => ({
                      text: option.text?.trim() || 'Option',
                      points: Number(option.points) || 0,
                      sortOrder: oIndex
                    }))
                  }
                }))
              }
            };
          })
        }
      }
    });

    return NextResponse.json({ ok: true, id: diagnostic.id });
  } catch (error) {
    console.error('Create diagnostic error:', error);
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ ok: false, message: 'Non autorisé.' }, { status: 401 });
    }
    if (error instanceof Error && error.message === 'FORBIDDEN') {
      return NextResponse.json({ ok: false, message: 'Accès refusé.' }, { status: 403 });
    }
    return NextResponse.json(
      { ok: false, message: 'Impossible de créer le diagnostic.' },
      { status: 500 }
    );
  }
}
