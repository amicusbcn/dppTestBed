import React, { useState } from 'react';
import { ShieldCheck, Smartphone, KeyRound, X, Loader2, ChevronRight } from 'lucide-react';

export default function OwnerAuthModal({ isOpen, onClose, onAuthenticated }) {
  const [loadingMethod, setLoadingMethod] = useState(null);

  if (!isOpen) return null;

  const handleLogin = (method) => {
    setLoadingMethod(method);
    setTimeout(() => {
      setLoadingMethod(null);
      onAuthenticated(method);
    }, 650);
  };

  return (
    <div className="fixed inset-0 z-50 bg-baidata-ink/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
        <div className="bg-baidata-purple text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5" />
            <h3 className="font-bold text-sm">Verificación de Propiedad (B2B2C)</h3>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            El ciudadano no opera un conector EDC propio. Para consultar el{' '}
            <strong className="text-baidata-ink">Estado de Salud (SoH)</strong> y los ciclos
            (Anexo XIII.4), autentícate ante el portal del DPPSP para que consulte el espacio de
            datos en tu nombre:
          </p>

          <div className="space-y-2.5">
            <button
              onClick={() => handleLogin('EUDI Wallet (OIDC4VP)')}
              disabled={!!loadingMethod}
              className="w-full p-3.5 rounded-2xl border border-baidata-lavender bg-baidata-lavenderSoft/70 hover:bg-baidata-lavenderSoft text-left flex items-center justify-between transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-baidata-purple text-white flex items-center justify-center shrink-0">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-baidata-ink">
                    Presentar Credencial desde Wallet (OIDC4VP)
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Prueba criptográfica vinculada a BAT-2026-8841
                  </div>
                </div>
              </div>
              {loadingMethod === 'EUDI Wallet (OIDC4VP)' ? (
                <Loader2 className="w-4 h-4 animate-spin text-baidata-purple" />
              ) : (
                <ChevronRight className="w-4 h-4 text-baidata-purple" />
              )}
            </button>

            <button
              onClick={() => handleLogin('Cuenta OEM (OAuth2 / OIDC)')}
              disabled={!!loadingMethod}
              className="w-full p-3.5 rounded-2xl border border-slate-200 hover:border-baidata-purple/40 bg-white text-left flex items-center justify-between transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-baidata-ink text-white flex items-center justify-center shrink-0">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-baidata-ink">
                    Iniciar sesión con Cuenta Fabricante (OIDC)
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Batería emparejada previamente vía App Bluetooth
                  </div>
                </div>
              </div>
              {loadingMethod === 'Cuenta OEM (OAuth2 / OIDC)' ? (
                <Loader2 className="w-4 h-4 animate-spin text-baidata-ink" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-400" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}