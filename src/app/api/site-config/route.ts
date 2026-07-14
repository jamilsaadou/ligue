import { NextResponse } from 'next/server';
import { getPublicSiteConfig } from '@/lib/site-config';

export async function GET() {
  try {
    const config = await getPublicSiteConfig();
    return NextResponse.json(config, {
      headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300' }
    });
  } catch (error) {
    console.error('Public site config error:', error);
    return NextResponse.json({}, { status: 500 });
  }
}
