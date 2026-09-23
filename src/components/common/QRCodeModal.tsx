import React, { useState } from 'react';
import { X, Download, Copy, Check, ExternalLink, QrCode } from 'lucide-react';
import { Business } from '../../types';

interface QRCodeModalProps {
  business: Business;
  isOpen: boolean;
  onClose: () => void;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({ business, isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Construct public URL
  const baseUrl = window.location.origin;
  const publicUrl = `${baseUrl}/#negocio/${business.slug}`;
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=360x360&data=${encodeURIComponent(
    publicUrl
  )}&bgcolor=ffffff&color=253745&margin=15&format=png`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQR = () => {
    const link = document.createElement('a');
    link.href = qrApiUrl;
    link.download = `QR-${business.slug}.png`;
    link.target = '_blank';
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
      <div className="relative w-full max-w-md bg-[#16222f] dark:bg-[#111a24] rounded-2xl shadow-2xl border border-slate-700/80 p-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-700/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-sky-950/80 border border-sky-800/60 text-sky-400">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white">Código QR del Negocio</h3>
              <p className="text-xs text-sky-300">{business.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-sky-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* QR Display */}
        <div className="my-6 flex flex-col items-center">
          <div className="p-4 bg-white rounded-2xl border-2 border-dashed border-slate-300 shadow-inner">
            <img
              src={qrApiUrl}
              alt={`QR para ${business.name}`}
              className="w-56 h-56 object-contain rounded-lg"
              loading="eager"
            />
          </div>
          <p className="mt-3 text-xs text-center text-sky-200 max-w-xs">
            Imprime este código QR para colocarlo en mesas de tu restaurante, vitrinas o flyers promocionales.
          </p>
        </div>

        {/* Link box */}
        <div className="mb-5 p-3 bg-[#0f1722] rounded-xl border border-slate-700/80 flex items-center justify-between gap-2">
          <div className="truncate text-xs font-mono text-sky-200">
            {publicUrl}
          </div>
          <button
            onClick={handleCopyLink}
            className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 text-sky-200 border border-slate-700 hover:bg-slate-700 flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-bold">Copiado</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar</span>
              </>
            )}
          </button>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleDownloadQR}
            className="flex-1 py-2.5 px-4 bg-sky-500 hover:bg-sky-400 text-slate-950 text-sm font-bold rounded-xl flex items-center justify-center gap-2 shadow-md transition-all hover:scale-[1.02] cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Descargar Imagen QR
          </button>
          <a
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 bg-slate-800 text-sky-200 border border-slate-700 hover:bg-slate-700 rounded-xl flex items-center justify-center transition-colors"
            title="Abrir en nueva pestaña"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
};
