import React, { useState } from "react";
import { X, Wrench, ShieldCheck, KeyRound, CheckCircle2, AlertCircle } from "lucide-react";
import {
  SERVICE_OPERATION_CATALOG,
  registerServiceIntervention,
} from "../services/aasClient";
import { useTranslation } from "../hooks/useTranslation";

export default function ServiceRecordModal({
  isOpen,
  onClose,
  dppData,
  activeCredential,
  currentLogsCount = 1,
  onSuccess,
  lang = "es",
}) {
  const { t } = useTranslation(lang);
  const [serviceType, setServiceType] = useState("Repair");
  const [partNumber, setPartNumber] = useState("IV-MOD-10S4P-625");
  const [updateSoH, setUpdateSoH] = useState(false);
  const [postSoH, setPostSoH] = useState("98.0");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const repair = dppData?.submodels?.workshop_repair || {};
  const bms = dppData?.submodels?.dynamic_bms || {};
  const spareParts = repair.spare_parts || [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");

    try {
      await registerServiceIntervention({
        serviceSubmodelId: repair.service_submodel_id,
        conditionSubmodelId: bms.aas_submodel_id,
        currentCount: currentLogsCount,
        serviceType,
        partNumber,
        notes,
        postSoH: updateSoH ? Number(postSoH) : null,
        operatorName: activeCredential?.holderName || "Taller Autorizado",
        operatorDid: activeCredential?.did || "did:web:workshop.iberiavolt.es",
      });

      setSubmitting(false);
      setNotes("");
      onSuccess();
      onClose();
    } catch (err) {
      setSubmitting(false);
      setErrorMsg(err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-baidata-ink/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-amber-600">
              <Wrench className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight">{t("serviceModal.title")}</h3>
              <p className="text-[11px] text-slate-400">{t("serviceModal.subtitle")}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              {t("serviceModal.operationLabel")}
            </label>
            <select
              value={serviceType}
              onChange={(e) => {
                const val = e.target.value;
                setServiceType(val);
                if (val === "Repair") setUpdateSoH(true);
              }}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 font-medium focus:border-baidata-purple focus:outline-none"
            >
              {Object.entries(SERVICE_OPERATION_CATALOG).map(([code, labels]) => (
                <option key={code} value={code}>
                  [{code}] {labels[lang] || labels.es}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              {t("serviceModal.partLabel")}
            </label>
            <select
              value={partNumber}
              onChange={(e) => setPartNumber(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 font-medium focus:border-baidata-purple focus:outline-none"
            >
              <option value="NONE">{t("serviceModal.noPartOption")}</option>
              {spareParts.map((part, idx) => {
                const match = part.match(/\(([^)]+)\)/);
                const code = match ? match[1] : part;
                return (
                  <option key={idx} value={code}>
                    {part}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <label className="flex items-center gap-2 font-semibold text-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={updateSoH}
                onChange={(e) => setUpdateSoH(e.target.checked)}
                className="rounded border-slate-300 text-baidata-purple focus:ring-baidata-purple"
              />
              <span>{t("serviceModal.updateSohCheck")}</span>
            </label>

            {updateSoH && (
              <div className="flex items-center gap-3 pt-1">
                <span className="text-slate-600">{t("serviceModal.newSohLabel")}:</span>
                <input
                  type="number"
                  step="0.1"
                  min="50"
                  max="100"
                  value={postSoH}
                  onChange={(e) => setPostSoH(e.target.value)}
                  className="w-24 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 font-mono font-bold text-slate-900"
                />
                <span className="font-bold text-slate-600">%</span>
              </div>
            )}
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              {t("serviceModal.notesLabel")}
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t("serviceModal.notesPlaceholder")}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-baidata-purple focus:outline-none"
            />
          </div>

          {/* Bloque de firma simulada con identidad descentralizada */}
          <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-1">
            <div className="flex items-center justify-between text-emerald-900 font-bold">
              <span className="inline-flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-emerald-700" />
                {t("serviceModal.signatureBoxTitle")}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700">
                <CheckCircle2 className="w-3.5 h-3.5" /> DID Ready
              </span>
            </div>
            <p className="text-emerald-800 font-medium">{activeCredential?.holderName}</p>
            <p className="font-mono text-[11px] text-emerald-700 truncate">
              {activeCredential?.did}
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg font-semibold text-slate-600 hover:bg-slate-100 transition"
            >
              {t("serviceModal.cancel")}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold bg-slate-900 text-white hover:bg-slate-800 transition disabled:opacity-60"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>
                {submitting ? t("serviceModal.submitting") : t("serviceModal.submitBtn")}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}