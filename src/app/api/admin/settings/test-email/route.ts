import { NextResponse } from 'next/server';
import { requireAdminModule } from '@/lib/rbac';
import { sendSmtpTestEmail } from '@/lib/mailer';

export async function POST() {
  try {
    await requireAdminModule('settings');
    const recipient = await sendSmtpTestEmail();
    return NextResponse.json({
      ok: true,
      message: `Email de test envoyé à ${recipient}.`
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ ok: false, message: 'Non autorisé.' }, { status: 401 });
    }
    if (error instanceof Error && error.message === 'FORBIDDEN') {
      return NextResponse.json({ ok: false, message: 'Accès refusé.' }, { status: 403 });
    }
    console.error('SMTP test error:', error);
    const code =
      typeof error === 'object' && error && 'code' in error
        ? String((error as { code?: unknown }).code || '')
        : '';
    const message =
      error instanceof Error && error.message === 'SMTP_INCOMPLETE'
        ? 'Configuration SMTP incomplète.'
        : code === 'EAUTH'
          ? "Authentification SMTP refusée. Vérifiez l'identifiant et le mot de passe."
          : code === 'ETIMEDOUT' || code === 'ECONNECTION'
            ? 'Connexion au serveur SMTP impossible ou expirée.'
            : "L'email de test n'a pas pu être envoyé.";
    return NextResponse.json({ ok: false, message }, { status: 502 });
  }
}
