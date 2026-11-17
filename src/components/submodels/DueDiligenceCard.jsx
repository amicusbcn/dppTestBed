import React from "react";
import { Globe, Lock } from "lucide-react";
import AuditField from "../AuditField";

export default function DueDiligenceCard({ dueDiligence, canViewTier3Supply, isFromAas, t }) {
  return (
    <section className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-sky-50 text-sky-700">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">{t("dpp.traceTitle")}</h2>
            <p className="text-xs text-slate-500">
              {t("dpp.traceSubtitle")}:{" "}
              <span className="font-mono">
                <AuditField isFromAas={isFromAas} fieldKey="dd.certificate_id" value={dueDiligence?.public_attestation?.certificate_id} />
              </span>
            </p>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <AuditField isFromAas={isFromAas} fieldKey="dd.status" value={dueDiligence?.public_attestation?.status} />
        </span>
      </div>

      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-bold text-slate-800">
            {t("dpp.auditorBody")}: <AuditField isFromAas={isFromAas} fieldKey="dd.auditor" value={dueDiligence?.public_attestation?.auditor} />
          </span>
          <span className="text-slate-500">
            {t("dpp.verifyDate")}: <AuditField isFromAas={isFromAas} fieldKey="dd.audit_date" value={dueDiligence?.public_attestation?.audit_date} />
          </span>
        </div>
        <p className="text-slate-600 leading-relaxed">
          <AuditField isFromAas={isFromAas} fieldKey="dd.summary" value={dueDiligence?.public_attestation?.summary} />
        </p>
        <div className="flex flex-wrap gap-1.5 pt-1">
          {dueDiligence?.public_attestation?.covered_minerals?.map((m, idx) => (
            <span key={idx} className="px-2.5 py-0.5 rounded-md bg-white border border-slate-200 font-semibold text-slate-700">
              <AuditField isFromAas={isFromAas} fieldKey="dd.covered_minerals" value={m} />
            </span>
          ))}
        </div>
      </div>

      {canViewTier3Supply ? (
        <div className="p-4 rounded-xl bg-sky-50/70 border border-sky-200 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-sky-950">{t("dpp.tier3Title")}</p>
            <span className="text-[11px] font-mono text-sky-800">{t("dpp.eidasSeal")}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
            {dueDiligence?.restricted_tier_traceability?.map((item, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-white border border-sky-200/80 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">
                    <AuditField isFromAas={isFromAas} fieldKey="dd.restricted_tier_traceability" value={item.mineral} />
                  </span>
                  <span className="font-mono text-[10px] text-sky-700">
                    <AuditField isFromAas={isFromAas} fieldKey="dd.restricted_tier_traceability" value={item.batch_vc} />
                  </span>
                </div>
                <p className="text-slate-600"><AuditField isFromAas={isFromAas} fieldKey="dd.restricted_tier_traceability" value={item.origin} /></p>
                <p className="text-[11px] font-medium text-slate-500">
                  {t("dpp.refinery")}: <AuditField isFromAas={isFromAas} fieldKey="dd.restricted_tier_traceability" value={item.refiner} />
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500 pt-1">
          <span className="inline-flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            {t("dpp.tier3Lock")}
          </span>
        </div>
      )}
    </section>
  );
}