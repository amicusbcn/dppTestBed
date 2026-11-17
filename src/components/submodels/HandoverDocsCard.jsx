import React from "react";
import { FileText, Lock, Download } from "lucide-react";
import AuditField from "../AuditField";

export default function HandoverDocsCard({
  docs,
  canViewRepair,
  activeCredential,
  onOpenWallet,
  isFromAas,
  t,
}) {
  return (
    <section className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-sky-50 text-sky-700">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">{t("dpp.docTitle")}</h2>
            <p className="text-xs text-slate-500">{t("dpp.docSubtitle")}</p>
          </div>
        </div>
      </div>

      <div className="space-y-3 pt-2">
        {docs && docs.length > 0 ? (
          docs.map((doc, idx) => {
            const isPublic = doc.class_id === "03-01" || idx === 0;
            const hasAccess = isPublic || canViewRepair;

            return (
              <div
                key={idx}
                className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors ${
                  hasAccess
                    ? "bg-slate-50 border-slate-200 hover:border-baidata-purple/50"
                    : "bg-slate-50/50 border-slate-100 opacity-75 grayscale"
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${
                        isPublic ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {isPublic ? t("dpp.publicAccess") : t("dpp.restrictedAccess")}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">
                      <AuditField isFromAas={isFromAas} fieldKey={`docs.${idx}.doc_id`} value={doc.doc_id} />
                    </span>
                  </div>
                  <h3 className="font-semibold text-slate-900 text-sm truncate">
                    <AuditField isFromAas={isFromAas} fieldKey={`docs.${idx}.title`} value={doc.title} />
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {t("dpp.version")}: <AuditField isFromAas={isFromAas} fieldKey={`docs.${idx}.version`} value={doc.version} /> · {t("dpp.vdiClass")}: {doc.class_id}
                  </p>
                </div>

                {hasAccess ? (
                  <a
                    href={doc.file_url !== "#" ? doc.file_url : undefined}
                    target="_blank"
                    rel="noreferrer"
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold shrink-0 ${
                      doc.file_url !== "#"
                        ? "bg-baidata-purple text-white hover:bg-baidata-purpleDark shadow-sm"
                        : "bg-slate-200 text-slate-500 cursor-not-allowed"
                    }`}
                  >
                    {doc.file_url !== "#" ? (
                      <>
                        <Download className="w-4 h-4" />
                        <span>{t("dpp.downloadPdf")}</span>
                      </>
                    ) : (
                      t("dpp.noFile")
                    )}
                  </a>
                ) : (
                  <div className="px-3 py-2 rounded-lg bg-slate-200 text-slate-500 text-xs font-medium flex items-center gap-1.5 shrink-0">
                    <Lock className="w-3.5 h-3.5" />
                    {t("dpp.credRequiredBadge")}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <p className="text-sm text-slate-500 italic px-2">{t("dpp.noDocs")}</p>
        )}
      </div>

      {!activeCredential && (
        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            {t("dpp.credRequiredLock")}
          </span>
          <button
            type="button"
            onClick={onOpenWallet}
            className="text-baidata-purple font-semibold hover:underline self-start sm:self-center shrink-0"
          >
            {t("dpp.presentCred")}
          </button>
        </div>
      )}
    </section>
  );
}