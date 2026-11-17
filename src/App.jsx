import React, { useState, useEffect } from "react";
import fallbackDppData from "./data/batteryDpp.json";
import { fetchBatteryDpp, getRouteParams } from "./services/aasClient";
import { useTranslation } from "./hooks/useTranslation";
import BaidataHeader from "./components/BaidataHeader";
import WalletAuthModal from "./components/WalletAuthModal";
import EdcTraceModal from "./components/EdcTraceModal";
import ProductHeaderCard from "./components/submodels/ProductHeaderCard";
import BmsTelemetryCard from "./components/submodels/BmsTelemetryCard";
import RepairSecondLifeCard from "./components/submodels/RepairSecondLifeCard";
import ChemistryRecyclingCard from "./components/submodels/ChemistryRecyclingCard";
import PerformanceCard from "./components/submodels/PerformanceCard";
import DueDiligenceCard from "./components/submodels/DueDiligenceCard";
import SustainabilityCard from "./components/submodels/SustainabilityCard";
import HandoverDocsCard from "./components/submodels/HandoverDocsCard";
import { ShieldCheck, Server } from "lucide-react";

export default function App() {
  const [dppData, setDppData] = useState(fallbackDppData);
  const [aasSource, setAasSource] = useState("connecting");
  const [aasMappedFields, setAasMappedFields] = useState(new Set());
  const [activeCredential, setActiveCredential] = useState(null);
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [isTraceOpen, setIsTraceOpen] = useState(false);
  const [isRepurposed, setIsRepurposed] = useState(false);
  const [serviceLogs, setServiceLogs] = useState(
    fallbackDppData.submodels.workshop_repair.service_log
  );
  const [lang, setLang] = useState(() => getRouteParams().lang);
  const [batteryId, setBatteryId] = useState(() => getRouteParams().batteryId);
  const { t } = useTranslation(lang);

  useEffect(() => {
    const handlePopState = () => {
      const params = getRouteParams();
      setLang(params.lang);
      setBatteryId(params.batteryId);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    fetchBatteryDpp(lang, batteryId).then(({ data, source, mappedFields }) => {
      setDppData(data);
      setAasSource(source);
      setAasMappedFields(new Set(mappedFields || []));
    });
  }, [lang, batteryId]);

  const role = activeCredential?.id || "public";
  const permissions = {
    canViewBms: ["owner", "workshop", "authority", "oem"].includes(role),
    canViewRepair: ["workshop", "authority", "oem"].includes(role),
    canViewChemistry: ["recycler", "authority", "oem"].includes(role),
    canViewTier3Supply: ["authority", "oem"].includes(role),
    canEditWorkshop: ["workshop", "oem"].includes(role),
  };

  const isFromAas = (fieldKey) => aasSource === "basyx" && aasMappedFields.has(fieldKey);
  const submodels = dppData.submodels || fallbackDppData.submodels;

  const handleAddServiceRecord = () => {
    const today = new Date().toISOString().split("T")[0];
    setServiceLogs([
      {
        date: today,
        operator: `${activeCredential.holderName} (${activeCredential.did})`,
        action:
          lang === "en"
            ? "Preventive cell diagnostics and internal resistance recalibration"
            : "Diagnóstico preventivo de celdas y recalibración de resistencia interna",
      },
      ...serviceLogs,
    ]);
  };

  const handleToggleSecondLife = () => {
    const today = new Date().toISOString().split("T")[0];
    if (!isRepurposed) {
      setIsRepurposed(true);
      setServiceLogs([
        {
          date: today,
          operator: `${activeCredential.holderName} (${activeCredential.did})`,
          action:
            lang === "en"
              ? "SECOND LIFE REPURPOSING (Art. 77.6): Reconfigured for 48V stationary solar storage and economic operator responsibility transferred."
              : "REACONDICIONAMIENTO SEGUNDA VIDA (Art. 77.6): Reconfiguración para sistema estacionario solar 48V y traspaso de responsabilidad de operador económico.",
        },
        ...serviceLogs,
      ]);
    } else {
      setIsRepurposed(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-baidata-bg text-baidata-ink">
      <BaidataHeader
        activeCredential={activeCredential}
        onOpenWallet={() => setIsWalletOpen(true)}
        onLogout={() => setActiveCredential(null)}
        lang={lang}
        onChangeLang={setLang}
        batteryId={dppData.battery_id || batteryId}
      />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {activeCredential && (
          <div className="p-4 rounded-2xl bg-emerald-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
            <div className="flex items-start sm:items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5 sm:mt-0" />
              <div className="text-xs">
                <p className="font-bold text-sm">
                  {t("dpp.authAccess")}: {activeCredential.holderName}
                </p>
                <p className="text-emerald-200/80 font-mono text-[11px] mt-0.5">
                  {activeCredential.did} · {activeCredential.policyGranted}
                </p>
              </div>
            </div>
            <span className="inline-flex items-center self-start sm:self-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-800/80 text-emerald-200">
              {t("dpp.authSubmodels")}
            </span>
          </div>
        )}

        <ProductHeaderCard
          dppData={dppData}
          isRepurposed={isRepurposed}
          isFromAas={isFromAas}
          t={t}
        />

        {permissions.canViewBms && (
          <BmsTelemetryCard
            bms={submodels.dynamic_bms}
            performance={submodels.performance_durability}
            isFromAas={isFromAas}
            t={t}
          />
        )}

        {permissions.canViewRepair && (
          <RepairSecondLifeCard
            repair={submodels.workshop_repair}
            serviceLogs={serviceLogs}
            isRepurposed={isRepurposed}
            canEditWorkshop={permissions.canEditWorkshop}
            onAddServiceRecord={handleAddServiceRecord}
            onToggleSecondLife={handleToggleSecondLife}
            isFromAas={isFromAas}
            t={t}
          />
        )}

        {permissions.canViewChemistry && (
          <ChemistryRecyclingCard
            chemistry={submodels.recycler_chemistry}
            isFromAas={isFromAas}
            t={t}
          />
        )}

        <PerformanceCard
          performance={submodels.performance_durability}
          isFromAas={isFromAas}
          t={t}
        />

        <DueDiligenceCard
          dueDiligence={submodels.supply_chain_due_diligence}
          canViewTier3Supply={permissions.canViewTier3Supply}
          isFromAas={isFromAas}
          t={t}
        />

        <SustainabilityCard
          carbon={submodels.carbon_circularity}
          isFromAas={isFromAas}
          t={t}
        />

        <HandoverDocsCard
          docs={submodels.handover_documentation}
          canViewRepair={permissions.canViewRepair}
          activeCredential={activeCredential}
          onOpenWallet={() => setIsWalletOpen(true)}
          isFromAas={isFromAas}
          t={t}
        />
      </main>

      <footer className="border-t border-slate-200 bg-white mt-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>
            {t("footer.idsa")} · <strong className="text-slate-700">BAIDATA</strong> (IDSA Hub España)
          </p>
          <button
            type="button"
            onClick={() => setIsTraceOpen(true)}
            className="inline-flex items-center gap-1.5 text-slate-500 hover:text-baidata-purple font-mono text-[11px] transition"
          >
            <Server className="w-3.5 h-3.5" />
            <span>{t("footer.inspect")}</span>
          </button>
        </div>
      </footer>

      <WalletAuthModal
        isOpen={isWalletOpen}
        onClose={() => setIsWalletOpen(false)}
        onAuthenticate={(cred) => setActiveCredential(cred)}
        lang={lang}
      />

      <EdcTraceModal
        isOpen={isTraceOpen}
        onClose={() => setIsTraceOpen(false)}
        dppData={dppData}
        activeCredential={activeCredential}
        lang={lang}
      />
    </div>
  );
}