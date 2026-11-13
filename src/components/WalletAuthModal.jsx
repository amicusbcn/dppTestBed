import React, { useState } from "react";
import {
  X,
  ShieldCheck,
  KeyRound,
  Smartphone,
  Wrench,
  Recycle,
  Scale,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

const WALLET_CREDENTIALS = [
  {
    id: "owner",
    holderName: "Propietario · App e-Bike",
    roleLabel: "Titular del activo (Vinculación Bluetooth / Token)",
    did: "did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK",
    issuer: "IberiaVolt Mobility S.L. (Activación en compra)",
    policyGranted: "ODRL:Lectura_Telemetria_BMS_Propietario",
    icon: Smartphone,
    accent: "text-baidata-purple bg-baidata-lavenderSoft border-baidata-lavender",
  },
  {
    id: "workshop",
    holderName: "Taller E-Mobility Bilbao",
    roleLabel: "Servicio Técnico Autorizado (B2B)",
    did: "did:web:emobility-bilbao.es",
    issuer: "Registro Industrial / Red Oficial OEM",
    policyGranted: "ODRL:Acceso_Despiece_Reparacion_Y_Escritura_Log",
    icon: Wrench,
    accent: "text-amber-700 bg-amber-50 border-amber-200",
  },
  {
    id: "recycler",
    holderName: "ReciclaBat Norte S.A.",
    roleLabel: "Gestor Autorizado de Tratamiento y Reciclaje (B2B)",
    did: "did:web:reciclabat-norte.eu",
    issuer: "Autoridad Ambiental · NIMA 480009182",
    policyGranted: "ODRL:Acceso_Composicion_Quimica_Confidencial",
    icon: Recycle,
    accent: "text-emerald-700 bg-emerald-50 border-emerald-200",
  },
  {
    id: "authority",
    holderName: "Vigilancia de Mercado UE",
    roleLabel: "Autoridad Competente · Sello Cualificado eIDAS",
    did: "did:web:vigilancia-mercado.gob.es",
    issuer: "Nodo Nacional eIDAS / Comisión Europea",
    policyGranted: "ODRL:Auditoria_Regulatoria_Completa_Art77",
    icon: Scale,
    accent: "text-sky-700 bg-sky-50 border-sky-200",
  },
];

export default function WalletAuthModal({ isOpen, onClose, onAuthenticate }) {
  const [selectedId, setSelectedId] = useState("workshop");
  const [verifying, setVerifying] = useState(false);

  if (!isOpen) return null;

  const selectedCred = WALLET_CREDENTIALS.find((c) => c.id === selectedId);

  const handlePresent = () => {
    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
      onAuthenticate(selectedCred);
      onClose();
    }, 450);
  };

  return (
    <div className="fixed inset-0 z-50 bg-baidata-ink/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-baidata-purple">
              <KeyRound className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight">
                Wallet Digital · Presentación Verificable (OIDC4VP)
              </h3>
              <p className="text-[11px] text-slate-400">
                Solicitud de verificación desde Nodo EDC IberiaVolt
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            El pasaporte público no requiere registro. Si actúas como propietario o entidad acreditada de la cadena de valor, selecciona una{" "}
            <strong className="text-slate-800">Credencial Verificable (VC)</strong> de tu cartera para negociar acceso con el conector EDC:
          </p>

          <div className="space-y-2.5">
            {WALLET_CREDENTIALS.map((cred) => {
              const Icon = cred.icon;
              const isSelected = cred.id === selectedId;
              return (
                <button
                  key={cred.id}
                  type="button"
                  onClick={() => setSelectedId(cred.id)}
                  className={`w-full text-left p-3.5 rounded-xl border transition flex items-start gap-3 ${
                    isSelected
                      ? "border-baidata-purple bg-baidata-lavenderSoft/40 ring-1 ring-baidata-purple"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <div className={`p-2 rounded-lg border shrink-0 ${cred.accent}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-bold text-slate-900 truncate">
                        {cred.holderName}
                      </span>
                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-baidata-purple shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">{cred.roleLabel}</p>
                    <p className="text-[11px] font-mono text-slate-400 mt-1 truncate">
                      {cred.did}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {selectedCred && (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] space-y-1">
              <div className="flex items-center justify-between text-slate-500">
                <span>Emisor de confianza:</span>
                <span className="font-medium text-slate-700">{selectedCred.issuer}</span>
              </div>
              <div className="flex items-center justify-between text-slate-500">
                <span>Política EDC resultante:</span>
                <span className="font-mono text-baidata-purple font-semibold">
                  {selectedCred.policyGranted}
                </span>
              </div>
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={verifying}
              onClick={handlePresent}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-baidata-purple text-white hover:bg-baidata-purpleDark transition disabled:opacity-60"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>
                {verifying ? "Verificando firma DID..." : "Presentar Credencial al EDC"}
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}