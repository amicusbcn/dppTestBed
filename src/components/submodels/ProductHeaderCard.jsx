import React from "react";
import { QRCodeSVG } from "qrcode.react";
import { CheckCircle2, Factory, Building2, QrCode, Flame } from "lucide-react";
import AuditField from "../AuditField";

export default function ProductHeaderCard({ dppData, isRepurposed, isFromAas, t }) {
  const { public_nameplate: nameplate } = dppData.submodels;
  const liveScanUrl = typeof window !== "undefined" ? window.location.href : dppData.gs1_digital_link;

  const currentOperator = isRepurposed
    ? {
        name: "E-Mobility Bilbao Re-Power S.L.",
        eori_vat: "ESB48992104",
        role: t("dpp.secondLifeOperatorRole"),
        did: "did:web:emobility-bilbao.es",
      }
    : dppData.responsible_operator;

  return (
    <section className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row justify-between gap-5">
        <div className="space-y-3 flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                isRepurposed
                  ? "bg-amber-50 text-amber-800 border-amber-300"
                  : "bg-emerald-50 text-emerald-700 border-emerald-200"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              {isRepurposed ? t("dpp.statusRepurposed") : dppData.status}
            </span>
            <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
              ID: <AuditField isFromAas={isFromAas} fieldKey="battery_id" value={dppData.battery_id} />
            </span>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              <AuditField isFromAas={isFromAas} fieldKey="nameplate.product_name" value={nameplate?.product_name} />
            </h1>
            <p className="text-sm text-slate-600 mt-1 flex items-center gap-1.5">
              <Factory className="w-4 h-4 text-slate-400 shrink-0" />
              <span>
                <AuditField isFromAas={isFromAas} fieldKey="nameplate.manufacturer" value={nameplate?.manufacturer} /> ·{" "}
                <AuditField isFromAas={isFromAas} fieldKey="nameplate.manufacturing_plant" value={nameplate?.manufacturing_plant} />
              </span>
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs flex items-center gap-3.5">
            {!isRepurposed ? (
              <img
                src={currentOperator?.logo_url || "/iberiavolt-logo.jpg"}
                alt={currentOperator?.name || "Operador"}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "/iberiavolt-logo.jpg";
                }}
                className="w-12 h-12 rounded-lg bg-white border border-slate-200 object-contain p-1 shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-amber-100 border border-amber-200 flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5 text-amber-700" />
              </div>
            )}
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                {t("dpp.operatorLabel")}
              </p>
              <p className="font-bold text-slate-900 text-sm mt-0.5">
                {isRepurposed ? (
                  currentOperator?.name
                ) : (
                  <AuditField isFromAas={isFromAas} fieldKey="responsible_operator.name" value={currentOperator?.name} />
                )}{" "}
                <span className="font-mono font-normal text-xs text-slate-500">
                  ({isRepurposed ? currentOperator?.eori_vat : <AuditField isFromAas={isFromAas} fieldKey="responsible_operator.eori_vat" value={currentOperator?.eori_vat} />})
                </span>
              </p>
              {isRepurposed && <p className="text-amber-800 font-medium mt-0.5">{currentOperator?.role}</p>}
            </div>
          </div>
        </div>

        <div className="flex sm:flex-col items-center justify-between sm:justify-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 shrink-0">
          <div className="p-2 bg-white rounded-xl border border-slate-200 shadow-xs">
            <QRCodeSVG value={liveScanUrl} size={96} level="M" />
          </div>
          <div className="text-left sm:text-center max-w-[175px]">
            <p className="text-[11px] font-bold text-slate-800 flex items-center sm:justify-center gap-1">
              <QrCode className="w-3.5 h-3.5 text-baidata-purple shrink-0" />
              <span>IEC 61406 Identification Link</span>
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">{t("dpp.qrLabel")}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
        <div className="p-3.5 rounded-xl bg-baidata-lavenderSoft/50 border border-baidata-lavender/60">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-baidata-purple">{t("dpp.nominalCapacity")}</p>
          <p className="text-xl font-extrabold text-slate-900 mt-1">
            <AuditField isFromAas={isFromAas} fieldKey="nameplate.nominal_capacity_wh" value={nameplate?.nominal_capacity_wh} suffix=" Wh" />
          </p>
          <p className="text-xs text-slate-600 mt-0.5">
            <AuditField isFromAas={isFromAas} fieldKey="nameplate.rated_capacity_ah" value={nameplate?.rated_capacity_ah} suffix=" Ah" /> ·{" "}
            <AuditField isFromAas={isFromAas} fieldKey="nameplate.nominal_voltage_v" value={nameplate?.nominal_voltage_v} suffix="V" />
          </p>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{t("dpp.cellChemistry")}</p>
          <p className="text-sm font-bold text-slate-900 mt-1">
            <AuditField isFromAas={isFromAas} fieldKey="nameplate.chemistry" value={nameplate?.chemistry} />
          </p>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{t("dpp.mfgAndMass")}</p>
          <p className="text-sm font-bold text-slate-900 mt-1">
            <AuditField isFromAas={isFromAas} fieldKey="nameplate.manufacturing_date" value={nameplate?.manufacturing_date} /> ·{" "}
            <AuditField isFromAas={isFromAas} fieldKey="nameplate.weight_kg" value={nameplate?.weight_kg} suffix=" kg" />
          </p>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{t("dpp.euCategory")}</p>
          <p className="text-sm font-bold text-slate-900 mt-1">
            {isRepurposed ? t("dpp.stationaryCategory") : <AuditField isFromAas={isFromAas} fieldKey="nameplate.battery_category" value={nameplate?.battery_category} />}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/80 flex items-start gap-2 text-amber-950">
          <Flame className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">{t("dpp.extinguishingAgents")}: </span>
            <span className="text-amber-800">
              <AuditField isFromAas={isFromAas} fieldKey="nameplate.extinguishing_agents" value={nameplate?.extinguishing_agents?.join(" · ")} />
            </span>
          </div>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-center">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">{t("dpp.heavyMetals")}</span>
          <span className="font-medium text-slate-700 mt-0.5">
            <AuditField isFromAas={isFromAas} fieldKey="nameplate.heavy_metals_declaration" value={nameplate?.heavy_metals_declaration} />
          </span>
        </div>
      </div>
    </section>
  );
}