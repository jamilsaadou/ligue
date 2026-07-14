import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminModule } from '@/lib/rbac';

type ResourcePayload = {
  countryId?: string;
  countryCode?: string;
  countryName?: string;
  emergencyNumber?: string;
  name?: string;
  type?: 'association' | 'institution' | 'urgence' | 'ligne_ecoute';
  contact?: string;
  description?: string;
  address?: string;
  website?: string;
};

const authError = (error: unknown) => {
  if (error instanceof Error && error.message === 'UNAUTHORIZED') {
    return NextResponse.json({ ok: false, message: 'Non autorisé.' }, { status: 401 });
  }
  if (error instanceof Error && error.message === 'FORBIDDEN') {
    return NextResponse.json({ ok: false, message: 'Accès refusé.' }, { status: 403 });
  }
  return null;
};

export async function POST(request: Request) {
  try {
    await requireAdminModule('resources');
    const payload = (await request.json()) as ResourcePayload;
    const name = payload.name?.trim() || '';
    const type = payload.type || 'association';
    const contact = payload.contact?.trim() || '';

    if (!name || !contact) {
      return NextResponse.json(
        { ok: false, message: 'Nom et contact requis.' },
        { status: 400 }
      );
    }

    let countryId = payload.countryId;
    if (!countryId) {
      const code = payload.countryCode?.trim().toUpperCase();
      const countryName = payload.countryName?.trim();
      if (!code || !countryName) {
        return NextResponse.json(
          { ok: false, message: 'Pays requis.' },
          { status: 400 }
        );
      }

      const country = await prisma.country.upsert({
        where: { code },
        update: {
          name: countryName,
          emergencyNumber: payload.emergencyNumber?.trim() || null
        },
        create: {
          code,
          name: countryName,
          emergencyNumber: payload.emergencyNumber?.trim() || null
        }
      });
      countryId = country.id;
    }

    const resource = await prisma.resource.create({
      data: {
        countryId,
        name,
        type,
        contact,
        description: payload.description?.trim() || null,
        address: payload.address?.trim() || null,
        website: payload.website?.trim() || null
      }
    });

    return NextResponse.json({ ok: true, id: resource.id });
  } catch (error) {
    const auth = authError(error);
    if (auth) return auth;
    console.error('Create resource error:', error);
    return NextResponse.json(
      { ok: false, message: 'Impossible de créer la ressource.' },
      { status: 500 }
    );
  }
}
