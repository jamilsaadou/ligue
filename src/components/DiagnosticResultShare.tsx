'use client';

import { useState } from 'react';
import { Download, Image as ImageIcon, LoaderCircle, Share2 } from 'lucide-react';
import { sendAnalyticsEvent } from '@/lib/analytics-client';
import { useSiteConfig } from '@/hooks/useSiteConfig';

type CategoryResult = {
  name: string;
  score: number;
  maxScore: number;
  level: 'safe' | 'warning' | 'danger';
};

type Props = {
  diagnosticId: string;
  attemptId?: string | null;
  diagnosticTitle: string;
  level: 'safe' | 'warning' | 'danger';
  title: string;
  subtitle: string;
  message: string;
  totalScore: number;
  maxScore: number;
  categories: CategoryResult[];
};

const LEVEL_COLORS = {
  safe: '#64748b',
  warning: '#eb5f2a',
  danger: '#ef4444'
};

const LEVEL_BACKGROUNDS = {
  safe: '#f1f5f9',
  warning: '#fff7ed',
  danger: '#fef2f2'
};

const roundedRect = (
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) => {
  context.beginPath();
  context.roundRect(x, y, width, height, radius);
  context.fill();
};

const wrapText = (
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) => {
  const words = text.split(/\s+/);
  let line = '';
  let currentY = y;
  words.forEach((word) => {
    const candidate = line ? `${line} ${word}` : word;
    if (context.measureText(candidate).width > maxWidth && line) {
      context.fillText(line, x, currentY);
      line = word;
      currentY += lineHeight;
    } else {
      line = candidate;
    }
  });
  if (line) context.fillText(line, x, currentY);
  return currentY;
};

const canvasToBlob = (canvas: HTMLCanvasElement) =>
  new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Image indisponible'))),
      'image/png',
      1
    );
  });

const loadCanvasImage = (source: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Logo indisponible'));
    image.src = source;
  });

export default function DiagnosticResultShare(props: Props) {
  const siteConfig = useSiteConfig();
  const [isGenerating, setIsGenerating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const generateImage = async () => {
    await document.fonts.ready;
    const width = 1600;
    const height = Math.max(1900, 1270 + props.categories.length * 118);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas indisponible');

    const color = LEVEL_COLORS[props.level];
    context.fillStyle = '#f8fafc';
    context.fillRect(0, 0, width, height);

    context.fillStyle = '#ffffff';
    roundedRect(context, 90, 90, width - 180, height - 180, 48);

    context.fillStyle = '#eb5f2a';
    roundedRect(context, 90, 90, width - 180, 190, 48);
    context.fillRect(90, 200, width - 180, 80);

    context.fillStyle = '#ffffff';
    context.beginPath();
    context.arc(185, 185, 48, 0, Math.PI * 2);
    context.fill();
    if (siteConfig.logoDataUrl) {
      try {
        const logo = await loadCanvasImage(siteConfig.logoDataUrl);
        const scale = Math.min(80 / logo.width, 80 / logo.height);
        const logoWidth = logo.width * scale;
        const logoHeight = logo.height * scale;
        context.drawImage(
          logo,
          185 - logoWidth / 2,
          185 - logoHeight / 2,
          logoWidth,
          logoHeight
        );
      } catch {
        context.fillStyle = '#eb5f2a';
        context.font = '800 30px Manrope, Arial, sans-serif';
        context.textAlign = 'center';
        context.fillText(siteConfig.siteName.slice(0, 2).toUpperCase(), 185, 196);
      }
    } else {
      context.fillStyle = '#eb5f2a';
      context.font = '800 30px Manrope, Arial, sans-serif';
      context.textAlign = 'center';
      context.fillText(siteConfig.siteName.slice(0, 2).toUpperCase(), 185, 196);
    }

    context.textAlign = 'left';
    context.fillStyle = '#ffffff';
    context.font = '800 42px Manrope, Arial, sans-serif';
    context.fillText(siteConfig.siteName.slice(0, 36), 265, 175);
    context.font = '500 24px Manrope, Arial, sans-serif';
    context.fillText('Résultat confidentiel du diagnostic', 265, 220);

    context.fillStyle = LEVEL_BACKGROUNDS[props.level];
    roundedRect(context, 170, 350, width - 340, 510, 36);
    context.textAlign = 'center';
    context.fillStyle = color;
    context.font = '800 42px Manrope, Arial, sans-serif';
    context.fillText(props.subtitle.toUpperCase(), width / 2, 450);
    context.fillStyle = '#0f172a';
    context.font = '800 74px Manrope, Arial, sans-serif';
    context.fillText(props.title, width / 2, 550);
    context.fillStyle = color;
    context.font = '800 118px Manrope, Arial, sans-serif';
    context.fillText(`${props.totalScore}`, width / 2 - 30, 700);
    const scoreWidth = context.measureText(`${props.totalScore}`).width;
    context.textAlign = 'left';
    context.fillStyle = '#94a3b8';
    context.font = '600 38px Manrope, Arial, sans-serif';
    context.fillText(`/${props.maxScore}`, width / 2 - 30 + scoreWidth, 700);

    context.textAlign = 'center';
    context.fillStyle = '#475569';
    context.font = '500 28px Manrope, Arial, sans-serif';
    wrapText(context, props.message, width / 2, 770, 1050, 40);

    context.textAlign = 'left';
    context.fillStyle = '#0f172a';
    context.font = '800 40px Manrope, Arial, sans-serif';
    context.fillText('Résultats par catégorie', 170, 950);
    context.fillStyle = '#64748b';
    context.font = '500 24px Manrope, Arial, sans-serif';
    context.fillText(props.diagnosticTitle, 170, 994);

    props.categories.forEach((category, index) => {
      const y = 1060 + index * 118;
      const categoryColor = LEVEL_COLORS[category.level];
      const percentage = category.maxScore
        ? Math.min(1, category.score / category.maxScore)
        : 0;
      context.fillStyle = '#f8fafc';
      roundedRect(context, 170, y, width - 340, 92, 20);
      context.fillStyle = '#0f172a';
      context.font = '700 25px Manrope, Arial, sans-serif';
      context.fillText(category.name, 205, y + 36);
      context.textAlign = 'right';
      context.fillStyle = '#64748b';
      context.font = '600 23px Manrope, Arial, sans-serif';
      context.fillText(`${category.score}/${category.maxScore}`, width - 205, y + 36);
      context.textAlign = 'left';
      context.fillStyle = '#e2e8f0';
      roundedRect(context, 205, y + 56, width - 410, 12, 6);
      context.fillStyle = categoryColor;
      roundedRect(context, 205, y + 56, Math.max(12, (width - 410) * percentage), 12, 6);
    });

    const footerY = height - 270;
    context.fillStyle = '#f1f5f9';
    roundedRect(context, 170, footerY, width - 340, 110, 24);
    context.fillStyle = '#475569';
    context.textAlign = 'center';
    context.font = '600 23px Manrope, Arial, sans-serif';
    context.fillText(
      "Ce résultat est indicatif. En cas de danger, contactez les secours ou une structure d'aide.",
      width / 2,
      footerY + 48
    );
    context.font = '500 20px Manrope, Arial, sans-serif';
    context.fillText(
      `Généré le ${new Date().toLocaleDateString('fr-FR')} - ${siteConfig.siteName}`,
      width / 2,
      footerY + 80
    );

    return canvasToBlob(canvas);
  };

  const downloadBlob = (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `resultat-diagnostic-${new Date().toISOString().slice(0, 10)}.png`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    setIsGenerating(true);
    setMessage(null);
    try {
      const blob = await generateImage();
      const file = new File([blob], 'resultat-alerte-violence.png', { type: 'image/png' });
      const canShareFile =
        'share' in navigator && Boolean(navigator.canShare?.({ files: [file] }));
      if (canShareFile) {
        await navigator.share({
          title: 'Mon résultat ALERTE VIOLENCE',
          text: 'Voici mon résultat confidentiel au diagnostic ALERTE VIOLENCE.',
          files: [file]
        });
        setMessage('Image partagée.');
        sendAnalyticsEvent({
          eventName: 'diagnostic_result_shared',
          eventCategory: 'diagnostic',
          diagnosticId: props.diagnosticId,
          attemptId: props.attemptId || undefined,
          metadata: { format: 'png_hd', method: 'native_share', level: props.level }
        });
      } else {
        downloadBlob(blob);
        setMessage('Image HD téléchargée, prête à être partagée.');
        sendAnalyticsEvent({
          eventName: 'diagnostic_result_downloaded',
          eventCategory: 'diagnostic',
          diagnosticId: props.diagnosticId,
          attemptId: props.attemptId || undefined,
          metadata: { format: 'png_hd', method: 'download', level: props.level }
        });
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      console.error('Result image generation error:', error);
      setMessage("Impossible de générer l'image pour le moment.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    setIsGenerating(true);
    setMessage(null);
    try {
      downloadBlob(await generateImage());
      setMessage('Image HD téléchargée.');
    } catch (error) {
      console.error('Result image download error:', error);
      setMessage("Impossible de générer l'image pour le moment.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="glass-card p-5 md:p-8 border border-[#eb5f2a]/20 bg-white">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#eb5f2a]/10 flex items-center justify-center flex-shrink-0">
            <ImageIcon className="w-6 h-6 text-[#eb5f2a]" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Partager mon résultat</h2>
            <p className="text-sm text-slate-600 mt-1">
              Une image PNG haute définition, sans donnée personnelle.
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={handleShare}
            disabled={isGenerating}
            className="glass-button flex items-center justify-center gap-2 !py-3 !px-5 disabled:opacity-60"
          >
            {isGenerating ? (
              <LoaderCircle className="w-5 h-5 animate-spin" />
            ) : (
              <Share2 className="w-5 h-5" />
            )}
            Partager l’image HD
          </button>
          <button
            type="button"
            onClick={handleDownload}
            disabled={isGenerating}
            className="glass-button-outline flex items-center justify-center gap-2 !py-3 !px-4 disabled:opacity-60"
            title="Télécharger l’image PNG"
          >
            <Download className="w-5 h-5" />
            Télécharger
          </button>
        </div>
      </div>
      {message && <p className="text-sm text-slate-500 mt-4 lg:text-right">{message}</p>}
    </div>
  );
}
