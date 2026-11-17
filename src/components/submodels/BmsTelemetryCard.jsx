import React from "react";
import { BatteryCharging } from "lucide-react";
import AuditField from "../AuditField";

export default function BmsTelemetryCard({ bms, performance, isFromAas, t }) {
  return (
    <section className="bg-white rounded-2xl border-2 border-baidata-purple/30 p-6 shadow-sm space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-baidata-lavenderSoft text-baidata-purple">
            <BatteryCharging className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">{t("dpp.bmsTitle")}</h2>
            <p className="text-xs text-slate-500">
              <AuditField isFromAas={isFromAas} fieldKey="bms.last_sync" value={bms?.last_sync} />
            </p>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-baidata-lavenderSoft text-baidata-purple">
          {t("dpp.bmsAuth")}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200">
          <p className="text-xs font-medium text-emerald-800">{t("dpp.soh")}</p>
          <p className="text-2xl font-extrabold text-emerald-900 mt-1">
            <AuditField isFromAas={isFromAas} fieldKey="bms.state_of_health_soh" value={bms?.state_of_health_soh} suffix="%" />
          </p>
          <p className="text-[11px] text-emerald-700 mt-0.5">
            {t("dpp.usefulCapacity")}: <AuditField isFromAas={isFromAas} fieldKey="bms.remaining_capacity_wh" value={bms?.remaining_capacity_wh} suffix=" Wh" />
          </p>
        </div>
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
          <p className="text-xs font-medium text-slate-600">{t("dpp.cyclesAndRes")}</p>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">
            <AuditField isFromAas={isFromAas} fieldKey="bms.charge_cycles" value={bms?.charge_cycles} />{" "}
            <span className="text-xs font-normal text-slate-500">{t("dpp.cycles")}</span>
          </p>
          <p className="text-[11px] text-slate-600 mt-0.5">
            {t("dpp.internalRes")}:{" "}
            <strong>
              <AuditField isFromAas={isFromAas} fieldKey="performance.internal_resistance_current_mohm" value={performance?.internal_resistance_current_mohm} suffix=" mΩ" />
            </strong>{" "}
            ({t("dpp.initial")}: <AuditField isFromAas={isFromAas} fieldKey="performance.internal_resistance_initial_mohm" value={performance?.internal_resistance_initial_mohm} suffix=" mΩ" />)
          </p>
        </div>
        <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200">
          <p className="text-xs font-medium text-amber-800">{t("dpp.thermalEvents")}</p>
          <p className="text-sm font-bold text-amber-950 mt-1">
            <AuditField isFromAas={isFromAas} fieldKey="bms.extreme_events" value={bms?.extreme_events?.[0]?.event} />
          </p>
          <p className="text-[11px] text-amber-700 mt-0.5">
            <AuditField isFromAas={isFromAas} fieldKey="bms.extreme_events" value={bms?.extreme_events?.[0]?.date} /> ·{" "}
            <AuditField isFromAas={isFromAas} fieldKey="bms.extreme_events" value={bms?.extreme_events?.[0]?.impact} />
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
          <span className="text-slate-500 font-semibold block mb-1">{t("dpp.operationalPerf")}</span>
          <p>{t("dpp.peakPower")}: <span className="font-bold text-slate-800"><AuditField isFromAas={isFromAas} fieldKey="bms.remaining_power_w" value={bms?.remaining_power_w || "-"} suffix=" W" /></span></p>
          <p>{t("dpp.energyEff")}: <span className="font-bold text-slate-800"><AuditField isFromAas={isFromAas} fieldKey="bms.remaining_efficiency_pct" value={bms?.remaining_efficiency_pct || "-"} suffix="%" /></span></p>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
          <span className="text-slate-500 font-semibold block mb-1">{t("dpp.energyTraffic")}</span>
          <p>{t("dpp.totalEnergyProc")}: <span className="font-bold text-slate-800"><AuditField isFromAas={isFromAas} fieldKey="bms.energy_throughput_wh" value={bms?.energy_throughput_wh || "-"} suffix=" Wh" /></span></p>
          <p>{t("dpp.totalCapProc")}: <span className="font-bold text-slate-800"><AuditField isFromAas={isFromAas} fieldKey="bms.capacity_throughput_ah" value={bms?.capacity_throughput_ah || "-"} suffix=" Ah" /></span></p>
        </div>
      </div>
    </section>
  );
}