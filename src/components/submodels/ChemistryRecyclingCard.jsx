import React from "react";
import { Recycle, AlertTriangle } from "lucide-react";
import AuditField from "../AuditField";

export default function ChemistryRecyclingCard({ chemistry, isFromAas, t }) {
  return (
    <section className="bg-white rounded-2xl border-2 border-emerald-500/40 p-6 shadow-sm space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
            <Recycle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">{t("dpp.chemTitle")}</h2>
            <p className="text-xs text-slate-500">
              <AuditField isFromAas={isFromAas} fieldKey="chemistry.source_node" value={chemistry?.source_node} />
            </p>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
          {t("dpp.chemAuth")}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
          <p className="text-slate-500 font-medium">{t("dpp.cathode")}</p>
          <p className="font-bold text-slate-900 mt-1">
            <AuditField isFromAas={isFromAas} fieldKey="chemistry.cathode" value={chemistry?.cathode} />
          </p>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
          <p className="text-slate-500 font-medium">{t("dpp.anode")}</p>
          <p className="font-bold text-slate-900 mt-1">
            <AuditField isFromAas={isFromAas} fieldKey="chemistry.anode" value={chemistry?.anode} />
          </p>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
          <p className="text-slate-500 font-medium">{t("dpp.electrolyte")}</p>
          <p className="font-bold text-slate-900 mt-1">
            <AuditField isFromAas={isFromAas} fieldKey="chemistry.electrolyte" value={chemistry?.electrolyte} />
          </p>
        </div>
      </div>

      <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-900">
        <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold">{t("dpp.neutralizationProto")}:</p>
          <p className="mt-0.5">
            <AuditField isFromAas={isFromAas} fieldKey="chemistry.safety_neutralization" value={chemistry?.safety_neutralization} />
          </p>
          <div className="mt-1.5 pt-1.5 border-t border-red-200/50 space-y-1">
            <p className="font-semibold text-[11px] text-red-800">{t("dpp.hazardousSubs")}:</p>
            {chemistry?.hazardous_substances?.map((sub, i) => (
              <p key={i} className="text-[11px] text-red-700 ml-2">
                • <AuditField isFromAas={isFromAas} fieldKey="chemistry.hazardous_substances" value={sub} />
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}