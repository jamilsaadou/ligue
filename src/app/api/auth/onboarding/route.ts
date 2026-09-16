import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { COUNTRIES, JOIN_REASON_IDS } from '@/data/onboarding';

type OnboardingPayload = {
  countryCode?: string;
  phoneNational?: string;
  joinReasons?: string[];
};

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ ok: false, message: 'Non autorisé.' }, { status: 401 });
    }

    const payload = (await request.json()) as OnboardingPayload;

    const country = COUNTRIES.find((item) => item.code === payload.countryCode);
    if (!country) {
      return NextResponse.json(
        { ok: false, message: 'Veuillez sélectionner un pays valide.' },
        { status: 400 }
      );
    }

    // L'indicatif est dérivé du pays côté serveur : la concordance est garantie.
    const nationalDigits = (payload.phoneNational || '').replace(/\D/g, '');
    if (nationalDigits.length < 6 || nationalDigits.length > 15) {
      return NextResponse.json(
        { ok: false, message: 'Veuillez saisir un numéro de téléphone valide.' },
        { status: 400 }
      );
    }
    const phone = `${country.dialCode} ${nationalDigits}`;

    const joinReasons = Array.isArray(payload.joinReasons)
      ? payload.joinReasons.filter((reason) => JOIN_REASON_IDS.includes(reason))
      : [];
    if (joinReasons.length === 0) {
      return NextResponse.json(
        { ok: false, message: 'Indiquez au moins une raison pour laquelle vous rejoignez la plateforme.' },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: { id: session.id },
      data: {
        countryCode: country.code,
        phone,
        joinReasons,
        onboardedAt: new Date()
      }
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Onboarding error:', error);
    return NextResponse.json({ ok: false, message: 'Erreur serveur. Réessayez.' }, { status: 500 });
  }
}
