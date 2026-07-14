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

const authError = (error: unknown) => {
  if (error instanceof Error && error.message === 'UNAUTHORIZED') {
    return NextResponse.json({ ok: false, message: 'Non autorisé.' }, { status: 401 });
  }
  if (error instanceof Error && error.message === 'FORBIDDEN') {
    return NextResponse.json({ ok: false, message: 'Accès refusé.' }, { status: 403 });
  }
  return null;
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminModule('diagnostics');
    const { id } = await params;
    const diagnostic = await prisma.diagnostic.findUnique({
      where: { id },
      include: {
        categories: {
          orderBy: { sortOrder: 'asc' },
          include: {
            questions: {
              orderBy: { sortOrder: 'asc' },
              include: {
                options: { orderBy: { sortOrder: 'asc' } }
              }
            }
          }
        }
      }
    });

    if (!diagnostic) {
      return NextResponse.json(
        { ok: false, message: 'Diagnostic introuvable.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, diagnostic });
  } catch (error) {
    const auth = authError(error);
    if (auth) return auth;
    console.error('Fetch diagnostic error:', error);
    return NextResponse.json(
      { ok: false, message: 'Impossible de charger le diagnostic.' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminModule('diagnostics');
    const { id } = await params;
    const payload = (await request.json()) as DiagnosticInput;
    const title = payload.title?.trim() || 'Diagnostic sans titre';
    const description = payload.description?.trim() || null;
    const status = payload.status || 'draft';
    const version = payload.version || 1;
    const categories = payload.categories || [];

    await prisma.$transaction(async (tx) => {
      await tx.diagnostic.update({
        where: { id },
        data: {
          title,
          description,
          status,
          version
        }
      });

      await tx.diagnosticCategory.deleteMany({
        where: { diagnosticId: id }
      });

      if (categories.length > 0) {
        for (const [index, category] of categories.entries()) {
          const categoryName = category.name?.trim() || 'Catégorie';
          await tx.diagnosticCategory.create({
            data: {
              diagnosticId: id,
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
            }
          });
        }
      }
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const auth = authError(error);
    if (auth) return auth;
    console.error('Update diagnostic error:', error);
    return NextResponse.json(
      { ok: false, message: 'Impossible de mettre à jour le diagnostic.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminModule('diagnostics');
    const { id } = await params;
    await prisma.diagnostic.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    const auth = authError(error);
    if (auth) return auth;
    console.error('Delete diagnostic error:', error);
    return NextResponse.json(
      { ok: false, message: 'Impossible de supprimer le diagnostic.' },
      { status: 500 }
    );
  }
}
