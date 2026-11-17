import React from "react";
import { Leaf } from "lucide-react";
import AuditField from "../AuditField";

export default function SustainabilityCard({ carbon, isFromAas, t }) {
  return (
    <section className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-5">
      <div className="flex items-center gap-2.5">
        <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
          <Leaf className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-900">{t("dpp.sustainTitle")}</h2>
          <p className="text-xs text-slate-500">{t("dpp.sustainSubtitle")}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
          <div className="flex items-baseline justify-between">
            <span className="text-xs font-semibold text-slate-600">{t("dpp.declaredCarbon")}</span>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">
              <AuditField isFromAas={isFromAas} fieldKey="carbon.performance_class" value={carbon?.performance_class} />
            </span>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">
            <AuditField isFromAas={isFromAas} fieldKey="carbon.carbon_footprint_kg_kwh" value={carbon?.carbon_footprint_kg_kwh} />{" "}
            <span className="text-xs font-normal text-slate-500">kg CO₂e/kWh</span>
          </p>
          <div className="space-y-1.5 pt-1">
            {carbon?.lifecycle_breakdown?.map((item, i) => (
              <div key={i} className="text-xs">
                <div className="flex justify-between text-slate-700 mb-0.5">
                  <span><AuditField isFromAas={isFromAas} fieldKey="carbon.lifecycle_breakdown" value={item.stage} /></span>
                  <span className="font-semibold"><AuditField isFromAas={isFromAas} fieldKey="carbon.lifecycle_breakdown" value={item.share} suffix="%" /></span>
                </div>
                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-baidata-purple rounded-full" style={{ width: `${item.share}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
          <p className="text-xs font-semibold text-slate-600">{t("dpp.certifiedRecycled")}</p>
          <div className="space-y-2.5">
            {carbon?.recycled_content?.map((mat, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200/70 text-xs">
                <span className="font-medium text-slate-800">
                  <AuditField isFromAas={isFromAas} fieldKey="carbon.recycled_content" value={mat.material} />
                </span>
                <div className="text-right">
                  <span className="font-extrabold text-baidata-purple text-sm">
                    <AuditField isFromAas={isFromAas} fieldKey="carbon.recycled_content" value={mat.actual} suffix="%" />
                  </span>
                  <span className="text-[11px] text-slate-500 ml-1.5">
                    ({t("dpp.target")}: {mat.target_2031}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 space-y-2">
        <p>
          <strong className="text-slate-800">{t("dpp.eolInstructions")}: </strong>
          <AuditField isFromAas={isFromAas} fieldKey="carbon.end_of_life_info" value={carbon?.end_of_life_info} />
        </p>
        <p>
          <strong className="text-slate-800">{t("dpp.renewableCasing")}: </strong>
          <AuditField isFromAas={isFromAas} fieldKey="carbon.renewable_content" value={carbon?.renewable_content || "-"} suffix="%" />
        </p>
      </div>
    </section>
  );
}