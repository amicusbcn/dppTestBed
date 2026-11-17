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
  Factory,
} from "lucide-react";
import { useTranslation } from "../hooks/useTranslation";

const CREDENTIAL_CONFIGS = [
  {
    id: "owner",
    did: "did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK",
    icon: Smartphone,
    accent: "text-baidata-purple bg-baidata-lavenderSoft border-baidata-lavender",
  },
  {
    id: "workshop",
    did: "did:web:emobility-bilbao.es",
    icon: Wrench,
    accent: "text-amber-700 bg-amber-50 border-amber-200",
  },
  {
    id: "recycler",
    did: "did:web:reciclabat-norte.eu",
    icon: Recycle,
    accent: "text-emerald-700 bg-emerald-50 border-emerald-200",
  },
  {
    id: "authority",
    did: "did:web:vigilancia-mercado.gob.es",
    icon: Scale,
    accent: "text-sky-700 bg-sky-50 border-sky-200",
  },
  {
    id: "oem",
    did: "did:web:iberiavolt.es:oem-master",
    icon: Factory,
    accent: "text-sky-700 bg-sky-50 border-sky-200",
  },
];

export default function WalletAuthModal({
  isOpen,
  onClose,
  onAuthenticate,
  lang = "es",
}) {
  const [selectedId, setSelectedId] = useState("workshop");
  const [verifying, setVerifying] = useState(false);
  const { t } = useTranslation(lang);

  if (!isOpen) return null;

  const credentials = CREDENTIAL_CONFIGS.map((cfg) => ({
    ...cfg,
    holderName: t(`walletModal.credentials.${cfg.id}.holderName`),
    roleLabel: t(`walletModal.credentials.${cfg.id}.roleLabel`),
    issuer: t(`walletModal.credentials.${cfg.id}.issuer`),
    policyGranted: t(`walletModal.credentials.${cfg.id}.policyGranted`),
  }));

  const selectedCred = credentials.find((c) => c.id === selectedId);

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
              <h3 className="text-sm font-bold tracking-tight">{t("walletModal.title")}</h3>
              <p className="text-[11px] text-slate-400">{t("walletModal.subtitle")}</p>
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
            {t("walletModal.introPrefix")}{" "}
            <strong className="text-slate-800">{t("walletModal.introHighlight")}</strong>{" "}
            {t("walletModal.introSuffix")}
          </p>

          <div className="space-y-2.5">
            {credentials.map((cred) => {
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
              <div className="flex items-center justify-between gap-2 text-slate-500">
                <span className="shrink-0">{t("walletModal.trustedIssuer")}</span>
                <span className="font-medium text-slate-700 text-right truncate">
                  {selectedCred.issuer}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2 text-slate-500">
                <span className="shrink-0">{t("walletModal.resultingPolicy")}</span>
                <span className="font-mono text-baidata-purple font-semibold text-right truncate">
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
              {t("walletModal.cancel")}
            </button>
            <button
              type="button"
              disabled={verifying}
              onClick={handlePresent}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-baidata-purple text-white hover:bg-baidata-purpleDark transition disabled:opacity-60"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>
                {verifying ? t("walletModal.verifying") : t("walletModal.presentBtn")}
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}