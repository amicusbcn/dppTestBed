import React from "react";
import { Activity } from "lucide-react";
import AuditField from "../AuditField";

export default function PerformanceCard({ performance, isFromAas, t }) {
  return (
    <section className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-4">
      <div className="flex items-center gap-2.5">
        <div className="p-2 rounded-xl bg-baidata-lavenderSoft text-baidata-purple">
          <Activity className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-900">{t("dpp.perfTitle")}</h2>
          <p className="text-xs text-slate-500">{t("dpp.perfSubtitle")}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
          <p className="text-slate-500 font-medium">{t("dpp.initRes")}</p>
          <p className="text-lg font-extrabold text-slate-900 mt-1">
            <AuditField isFromAas={isFromAas} fieldKey="performance.internal_resistance_initial_mohm" value={performance?.internal_resistance_initial_mohm} suffix=" mΩ" />
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">{t("dpp.at25c50soc")}</p>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
          <p className="text-slate-500 font-medium">{t("dpp.roundTripEff")}</p>
          <p className="text-lg font-extrabold text-slate-900 mt-1">
            <AuditField isFromAas={isFromAas} fieldKey="performance.round_trip_efficiency_initial_pct" value={performance?.round_trip_efficiency_initial_pct} suffix="%" />
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {t("dpp.at50Life")}: <AuditField isFromAas={isFromAas} fieldKey="performance.round_trip_efficiency_50pct_life_pct" value={performance?.round_trip_efficiency_50pct_life_pct} suffix="%" />
          </p>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
          <p className="text-slate-500 font-medium">{t("dpp.expectedLife")}</p>
          <p className="text-lg font-extrabold text-slate-900 mt-1">
            <AuditField isFromAas={isFromAas} fieldKey="performance.expected_lifetime_cycles" value={performance?.expected_lifetime_cycles} suffix={` ${t("dpp.cycles")}`} />
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {t("dpp.designWarranty")}: <AuditField isFromAas={isFromAas} fieldKey="performance.expected_lifetime_years" value={performance?.expected_lifetime_years} suffix={` ${t("dpp.years")}`} />
          </p>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
          <p className="text-slate-500 font-medium">{t("dpp.exhaustionThreshold")}</p>
          <p className="text-lg font-extrabold text-slate-900 mt-1">
            <AuditField isFromAas={isFromAas} fieldKey="performance.capacity_exhaustion_threshold_pct" value={performance?.capacity_exhaustion_threshold_pct} suffix="% SoH" />
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">{t("dpp.secondLifeFit")}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
          <div>
            <span className="text-slate-500 font-medium block">{t("dpp.tempRange")}</span>
            <span className="font-bold text-slate-800">
              <AuditField isFromAas={isFromAas} fieldKey="performance.temp_min" value={performance?.temp_min || "-10"} suffix="°C" /> {t("dpp.to")}{" "}
              <AuditField isFromAas={isFromAas} fieldKey="performance.temp_max" value={performance?.temp_max || "45"} suffix="°C" />
            </span>
          </div>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
          <div>
            <span className="text-slate-500 font-medium block">{t("dpp.opVoltages")}</span>
            <span className="font-bold text-slate-800">
              <AuditField isFromAas={isFromAas} fieldKey="performance.volt_min" value={performance?.volt_min || "30"} suffix="V" /> ({t("dpp.min")}) /{" "}
              <AuditField isFromAas={isFromAas} fieldKey="performance.volt_max" value={performance?.volt_max || "42"} suffix="V" /> ({t("dpp.max")})
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}