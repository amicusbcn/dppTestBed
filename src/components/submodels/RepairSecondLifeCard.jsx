import React from "react";
import { Wrench, RefreshCw, PlusCircle } from "lucide-react";
import AuditField from "../AuditField";

export default function RepairSecondLifeCard({
  repair,
  serviceLogs,
  isRepurposed,
  canEditWorkshop,
  onAddServiceRecord,
  onToggleSecondLife,
  isFromAas,
  t,
}) {
  return (
    <section className="bg-white rounded-2xl border-2 border-amber-400/50 p-6 shadow-sm space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">{t("dpp.repairTitle")}</h2>
            <p className="text-xs text-slate-500">
              {t("dpp.architecture")}: <AuditField isFromAas={isFromAas} fieldKey="repair.cell_architecture" value={repair?.cell_architecture} /> · {t("dpp.disassemblyRef")}:{" "}
              <span className="font-mono">
                <AuditField isFromAas={isFromAas} fieldKey="repair.disassembly_manual" value={repair?.disassembly_manual} />
              </span>
            </p>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800">
          {t("dpp.repairAuth")}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-xs font-semibold text-slate-700 mb-2">{t("dpp.sparesTitle")}:</p>
          <div className="flex flex-wrap gap-2">
            {repair?.spare_parts?.map((part, idx) => (
              <span
                key={idx}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                  isFromAas("repair.spare_parts")
                    ? "bg-slate-100 text-slate-800"
                    : "bg-white border border-rose-300 text-rose-600 border-dotted"
                }`}
              >
                {part}
              </span>
            ))}
          </div>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
          <p className="font-semibold text-slate-700 mb-1">{t("dpp.sparesSuppliers")}:</p>
          <div className="space-y-1 text-slate-600">
            <p>
              {t("dpp.webPortal")}:{" "}
              <a href={repair?.supplier_web || "#"} target="_blank" rel="noreferrer" className="text-baidata-purple hover:underline">
                <AuditField isFromAas={isFromAas} fieldKey="repair.supplier_web" value={repair?.supplier_web || "-"} />
              </a>
            </p>
            <p>
              {t("dpp.b2bEmail")}:{" "}
              <span className="font-mono">
                <AuditField isFromAas={isFromAas} fieldKey="repair.supplier_email" value={repair?.supplier_email || "-"} />
              </span>
            </p>
          </div>
        </div>
      </div>

      {canEditWorkshop && (
        <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <p className="font-bold text-amber-950">{t("dpp.circularOpsTitle")}</p>
            <p className="text-amber-800 mt-0.5">
              {isRepurposed ? t("dpp.circularOpsDesc1") : t("dpp.circularOpsDesc2")}
            </p>
          </div>
          <button
            type="button"
            onClick={onToggleSecondLife}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-semibold bg-amber-700 text-white hover:bg-amber-800 transition shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{isRepurposed ? t("dpp.revertFirstLife") : t("dpp.certifySecondLife")}</span>
          </button>
        </div>
      )}

      <div className="space-y-2.5 pt-2 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-slate-700">{t("dpp.traceHistoryTitle")}</p>
          {canEditWorkshop && (
            <button
              type="button"
              onClick={onAddServiceRecord}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-white hover:bg-slate-900 transition"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>{t("dpp.addRecordBtn")}</span>
            </button>
          )}
        </div>
        <div className="space-y-2">
          {serviceLogs?.map((log, i) => (
            <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-1 text-slate-500">
                <span className="font-semibold text-rose-600">{log.operator}</span>
                <span className="font-mono text-rose-600">{log.date}</span>
              </div>
              <p className="text-rose-600 mt-1">{log.action}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}