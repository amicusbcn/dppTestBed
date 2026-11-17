import React from "react";
import { X, Server, ShieldCheck, Lock } from "lucide-react";
import { useTranslation } from "../hooks/useTranslation";

export default function EdcTraceModal({
  isOpen,
  onClose,
  dppData,
  activeCredential,
  lang = "es",
}) {
  const { t } = useTranslation(lang);

  if (!isOpen) return null;

  const role = activeCredential?.id || "public";

  const submodelAccess = [
    {
      key: "public_nameplate",
      title: t("edcModal.sm1"),
      id: dppData.submodels.public_nameplate.aas_submodel_id,
      node: dppData.submodels.public_nameplate.source_node,
      allowed: true,
    },
    {
      key: "performance_durability",
      title: t("edcModal.sm2"),
      id: dppData.submodels.performance_durability.aas_submodel_id,
      node: dppData.submodels.performance_durability.source_node,
      allowed: true,
    },
    {
      key: "carbon_circularity",
      title: t("edcModal.sm3"),
      id: dppData.submodels.carbon_circularity.aas_submodel_id,
      node: dppData.submodels.carbon_circularity.source_node,
      allowed: true,
    },
    {
      key: "due_diligence_public",
      title: t("edcModal.sm4a"),
      id: dppData.submodels.supply_chain_due_diligence.aas_submodel_id,
      node: dppData.submodels.supply_chain_due_diligence.source_node,
      allowed: true,
    },
    {
      key: "due_diligence_tier3",
      title: t("edcModal.sm4b"),
      id: `${dppData.submodels.supply_chain_due_diligence.aas_submodel_id}:tier3`,
      node: dppData.submodels.supply_chain_due_diligence.source_node,
      allowed: ["authority", "oem"].includes(role),
    },
    {
      key: "dynamic_bms",
      title: t("edcModal.sm5"),
      id: dppData.submodels.dynamic_bms.aas_submodel_id,
      node: dppData.submodels.dynamic_bms.source_node,
      allowed: ["owner", "workshop", "authority", "oem"].includes(role),
    },
    {
      key: "workshop_repair",
      title: t("edcModal.sm6"),
      id: dppData.submodels.workshop_repair.aas_submodel_id,
      node: dppData.submodels.workshop_repair.source_node,
      allowed: ["workshop", "authority", "oem"].includes(role),
    },
    {
      key: "recycler_chemistry",
      title: t("edcModal.sm7"),
      id: dppData.submodels.recycler_chemistry.aas_submodel_id,
      node: dppData.submodels.recycler_chemistry.source_node,
      allowed: ["recycler", "authority", "oem"].includes(role),
    },
  ];

  const payloadPreview = {
    "@context": [
      "https://admin-shell.io/aas/3/0",
      "https://w3id.org/idsa/contexts/context.jsonld",
    ],
    assetAdministrationShell: {
      idShort: `DPP_${dppData.battery_id}`,
      globalAssetId: dppData.asset_uri || dppData.gs1_digital_link,
    },
    edcSession: {
      consumerDid: activeCredential ? activeCredential.did : "anonymous (B2C QR Scan)",
      activePolicy: activeCredential
        ? activeCredential.policyGranted
        : "ODRL:Public_AnexoXIII_Art77",
      accessibleSubmodels: submodelAccess.filter((s) => s.allowed).map((s) => s.id),
    },
  };

  return (
    <div className="fixed inset-0 z-50 bg-baidata-ink/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 text-slate-100 rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-700 overflow-hidden max-h-[90vh] flex flex-col">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Server className="w-5 h-5 text-baidata-idsaBlue" />
            <div>
              <h3 className="text-sm font-bold text-white">{t("edcModal.title")}</h3>
              <p className="text-xs text-slate-400">{t("edcModal.subtitle")}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          <div className="space-y-2">
            <p className="font-semibold text-slate-300 uppercase tracking-wider text-[11px]">
              {t("edcModal.accessSectionTitle")}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {submodelAccess.map((item) => (
                <div
                  key={item.key}
                  className={`p-3 rounded-xl border ${
                    item.allowed
                      ? "bg-emerald-950/40 border-emerald-800/70"
                      : "bg-slate-800/60 border-slate-700/70 opacity-70"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 font-semibold">
                    <span className="text-slate-100 truncate">{item.title}</span>
                    {item.allowed ? (
                      <span className="inline-flex items-center gap-1 text-emerald-400 shrink-0">
                        <ShieldCheck className="w-3.5 h-3.5" /> {t("edcModal.authorized")}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-slate-400 shrink-0">
                        <Lock className="w-3.5 h-3.5" /> {t("edcModal.denied")}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 truncate">{item.node}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="font-semibold text-slate-300 uppercase tracking-wider text-[11px]">
              {t("edcModal.catalogTitle")}
            </p>
            <pre className="p-4 rounded-xl bg-black/60 border border-slate-800 font-mono text-[11px] text-emerald-300 overflow-x-auto leading-relaxed">
              {JSON.stringify(payloadPreview, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}