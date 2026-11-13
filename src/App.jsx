import React, { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import fallbackDppData from "./data/batteryDpp.json";
import { fetchBatteryDpp } from "./services/aasClient";
import BaidataHeader from "./components/BaidataHeader";
import WalletAuthModal from "./components/WalletAuthModal";
import EdcTraceModal from "./components/EdcTraceModal";
import {
  QrCode,
  BatteryCharging,
  Leaf,
  Factory,
  Wrench,
  Recycle,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Server,
  PlusCircle,
  Lock,
  Activity,
  Globe,
  Flame,
  RefreshCw,
  Building2,
} from "lucide-react";

export default function App() {
  const [dppData, setDppData] = useState(fallbackDppData);
  const [aasSource, setAasSource] = useState("connecting");
  const [activeCredential, setActiveCredential] = useState(null);
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [isTraceOpen, setIsTraceOpen] = useState(false);
  const [isRepurposed, setIsRepurposed] = useState(false);
  const [serviceLogs, setServiceLogs] = useState(
    fallbackDppData.submodels.workshop_repair.service_log
  );

  useEffect(() => {
    fetchBatteryDpp().then(({ data, source }) => {
      setDppData(data);
      setAasSource(source);
    });
  }, []);

  const role = activeCredential?.id || "public";
  const canViewBms = ["owner", "workshop", "authority"].includes(role);
  const canViewRepair = ["workshop", "authority"].includes(role);
  const canViewChemistry = ["recycler", "authority"].includes(role);
  const canViewTier3Supply = role === "authority";

  const {
    public_nameplate: nameplate,
    performance_durability: performance,
    carbon_circularity: carbon,
    supply_chain_due_diligence: dueDiligence,
    dynamic_bms: bms,
    workshop_repair: repair,
    recycler_chemistry: chemistry,
    regulatory_compliance: compliance,
  } = dppData.submodels;

  const liveScanUrl =
    typeof window !== "undefined" ? window.location.href : dppData.gs1_digital_link;

  const currentOperator = isRepurposed
    ? {
        name: "E-Mobility Bilbao Re-Power S.L.",
        eori_vat: "ESB48992104",
        role: "Operador Segunda Vida · Almacenamiento Estacionario (Art. 77.6)",
        did: "did:web:emobility-bilbao.es",
      }
    : dppData.responsible_operator;

  const handleAddServiceRecord = () => {
    const today = new Date().toISOString().split("T")[0];
    setServiceLogs([
      {
        date: today,
        operator: `${activeCredential.holderName} (${activeCredential.did})`,
        action: "Diagnóstico preventivo de celdas y recalibración de resistencia interna",
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
            "REACONDICIONAMIENTO SEGUNDA VIDA (Art. 77.6): Reconfiguración para sistema estacionario solar 48V y traspaso de responsabilidad de operador económico.",
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
      />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Banner contextual solo si hay una credencial verificada */}
        {activeCredential && (
          <div className="p-4 rounded-2xl bg-emerald-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
            <div className="flex items-start sm:items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5 sm:mt-0" />
              <div className="text-xs">
                <p className="font-bold text-sm">
                  Acceso autenticado: {activeCredential.holderName}
                </p>
                <p className="text-emerald-200/80 font-mono text-[11px] mt-0.5">
                  {activeCredential.did} · {activeCredential.policyGranted}
                </p>
              </div>
            </div>
            <span className="inline-flex items-center self-start sm:self-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-800/80 text-emerald-200">
              Submodelos autorizados desbloqueados
            </span>
          </div>
        )}

        {/* 1. CABECERA DEL PRODUCTO Y QR REAL (Anexo XIII) */}
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
                  {isRepurposed
                    ? "Reacondicionada · Segunda Vida (Estacionaria)"
                    : dppData.status}
                </span>
                <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                  ID: {dppData.battery_id}
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                    aasSource === "basyx"
                      ? "bg-sky-50 text-sky-700 border-sky-200"
                      : "bg-slate-100 text-slate-600 border-slate-200"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      aasSource === "basyx" ? "bg-sky-500 animate-pulse" : "bg-slate-400"
                    }`}
                  />
                  {aasSource === "basyx"
                    ? "AAS En Vivo · Azure BaSyx"
                    : aasSource === "connecting"
                    ? "Conectando AAS..."
                    : "Modo Respaldo Local"}
                </span>
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                  {nameplate.product_name}
                </h1>
                <p className="text-sm text-slate-600 mt-1 flex items-center gap-1.5">
                  <Factory className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>
                    {nameplate.manufacturer} · {nameplate.manufacturing_plant}
                  </span>
                </p>
              </div>

              {/* Operador Económico Responsable (cambia en Segunda Vida) */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs flex items-start gap-2.5">
                <Building2 className="w-4 h-4 text-baidata-purple shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    Operador Económico Responsable del DPP
                  </p>
                  <p className="font-bold text-slate-900 mt-0.5">
                    {currentOperator.name}{" "}
                    <span className="font-mono font-normal text-slate-500">
                      ({currentOperator.eori_vat})
                    </span>
                  </p>
                  <p className="text-slate-600">{currentOperator.role}</p>
                </div>
              </div>
            </div>

            {/* QR Real Escaneable */}
            <div className="flex sm:flex-col items-center justify-between sm:justify-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 shrink-0">
              <div className="p-2 bg-white rounded-xl border border-slate-200 shadow-xs">
                <QRCodeSVG value={liveScanUrl} size={96} level="M" />
              </div>
              <div className="text-left sm:text-center max-w-[160px]">
                <p className="text-[11px] font-bold text-slate-800 flex items-center sm:justify-center gap-1">
                  <QrCode className="w-3.5 h-3.5 text-baidata-purple" />
                  <span>GS1 Digital Link</span>
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">
                  Escanea con tu móvil para abrir este pasaporte en directo
                </p>
              </div>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-2 text-[11px] font-mono text-slate-600 overflow-x-auto">
            <span className="font-semibold text-baidata-purple shrink-0">URI:</span>
            <span className="truncate">{dppData.gs1_digital_link}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            <div className="p-3.5 rounded-xl bg-baidata-lavenderSoft/50 border border-baidata-lavender/60">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-baidata-purple">
                Capacidad Nominal
              </p>
              <p className="text-xl font-extrabold text-slate-900 mt-1">
                {nameplate.nominal_capacity_wh} Wh
              </p>
              <p className="text-xs text-slate-600 mt-0.5">
                {nameplate.rated_capacity_ah} Ah · {nameplate.nominal_voltage_v}V
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Química de celda
              </p>
              <p className="text-sm font-bold text-slate-900 mt-1">
                {nameplate.chemistry}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Fabricación y Masa
              </p>
              <p className="text-sm font-bold text-slate-900 mt-1">
                {nameplate.manufacturing_date} · {nameplate.weight_kg} kg
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Categoría UE
              </p>
              <p className="text-sm font-bold text-slate-900 mt-1">
                {isRepurposed
                  ? "Almacenamiento Estacionario (SB)"
                  : nameplate.battery_category}
              </p>
            </div>
          </div>

          {/* Seguridad de Emergencia y Etiquetado Obligatorio */}
          <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-start gap-2 text-amber-950">
              <Flame className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Agentes extintores homologados: </span>
                <span>{nameplate.extinguishing_agents.join(" · ")}</span>
              </div>
            </div>
            <span className="text-[11px] font-medium text-slate-600 shrink-0">
              {nameplate.heavy_metals_declaration}
            </span>
          </div>
        </section>

        {/* SUBMODELO DESBLOQUEADO: Estado Dinámico BMS */}
        {canViewBms && (
          <section className="bg-white rounded-2xl border-2 border-baidata-purple/30 p-6 shadow-sm space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-baidata-lavenderSoft text-baidata-purple">
                  <BatteryCharging className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Estado de Salud y Telemetría Dinámica BMS
                  </h2>
                  <p className="text-xs text-slate-500">{bms.last_sync}</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-baidata-lavenderSoft text-baidata-purple">
                Acceso Autorizado · BMS
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200">
                <p className="text-xs font-medium text-emerald-800">
                  Estado de Salud (SoH)
                </p>
                <p className="text-2xl font-extrabold text-emerald-900 mt-1">
                  {bms.state_of_health_soh}%
                </p>
                <p className="text-[11px] text-emerald-700 mt-0.5">
                  Capacidad útil: {bms.remaining_capacity_wh} Wh
                </p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <p className="text-xs font-medium text-slate-600">
                  Ciclos y Resistencia Actual
                </p>
                <p className="text-2xl font-extrabold text-slate-900 mt-1">
                  {bms.charge_cycles}{" "}
                  <span className="text-xs font-normal text-slate-500">ciclos</span>
                </p>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Resistencia interna BMS:{" "}
                  <strong>{performance.internal_resistance_current_mohm} mΩ</strong>{" "}
                  (Inicial: {performance.internal_resistance_initial_mohm} mΩ)
                </p>
              </div>
              <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200">
                <p className="text-xs font-medium text-amber-800">Eventos térmicos</p>
                <p className="text-sm font-bold text-amber-950 mt-1">
                  {bms.extreme_events[0].event}
                </p>
                <p className="text-[11px] text-amber-700 mt-0.5">
                  {bms.extreme_events[0].date} · {bms.extreme_events[0].impact}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* SUBMODELO DESBLOQUEADO: Reparabilidad y Transición a Segunda Vida */}
        {canViewRepair && (
          <section className="bg-white rounded-2xl border-2 border-amber-400/50 p-6 shadow-sm space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Reparación, Despiece y Reacondicionamiento (Segunda Vida)
                  </h2>
                  <p className="text-xs text-slate-500">
                    Arquitectura: {repair.cell_architecture} · Manual:{" "}
                    <span className="font-mono">{repair.disassembly_manual}</span>
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800">
                Acceso B2B · Operador Acreditado
              </span>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-700 mb-2">
                Repuestos homologados disponibles:
              </p>
              <div className="flex flex-wrap gap-2">
                {repair.spare_parts.map((part, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-800 text-xs font-medium"
                  >
                    {part}
                  </span>
                ))}
              </div>
            </div>

            {/* Simulación realista de cambio de ciclo de vida (Art. 77.6) */}
            {role === "workshop" && (
              <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <p className="font-bold text-amber-950">
                    Operación de Economía Circular (Reglamento UE Art. 77.6)
                  </p>
                  <p className="text-amber-800 mt-0.5">
                    {isRepurposed
                      ? "La batería ya consta como reacondicionada para almacenamiento estacionario."
                      : "Certifica la reutilización del pack para almacenamiento solar estacionario y asume la titularidad del DPP."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleToggleSecondLife}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-semibold bg-amber-700 text-white hover:bg-amber-800 transition shrink-0"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>
                    {isRepurposed
                      ? "Revertir a Primera Vida (Demo)"
                      : "Certificar Segunda Vida"}
                  </span>
                </button>
              </div>
            )}

            <div className="space-y-2.5 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-700">
                  Historial federado de intervenciones (Trazabilidad AAS)
                </p>
                {role === "workshop" && (
                  <button
                    type="button"
                    onClick={handleAddServiceRecord}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-white hover:bg-slate-900 transition"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Registrar intervención</span>
                  </button>
                )}
              </div>
              <div className="space-y-2">
                {serviceLogs.map((log, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-1 text-slate-500">
                      <span className="font-semibold text-slate-800">{log.operator}</span>
                      <span className="font-mono">{log.date}</span>
                    </div>
                    <p className="text-slate-700 mt-1">{log.action}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* SUBMODELO DESBLOQUEADO: Química Confidencial (Reciclador / Autoridad) */}
        {canViewChemistry && (
          <section className="bg-white rounded-2xl border-2 border-emerald-500/40 p-6 shadow-sm space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
                  <Recycle className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Composición Química Detallada y Protocolo de Reciclaje
                  </h2>
                  <p className="text-xs text-slate-500">{chemistry.source_node}</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                Acceso B2B · Gestor Autorizado
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <p className="text-slate-500 font-medium">Cátodo</p>
                <p className="font-bold text-slate-900 mt-1">{chemistry.cathode}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <p className="text-slate-500 font-medium">Ánodo</p>
                <p className="font-bold text-slate-900 mt-1">{chemistry.anode}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <p className="text-slate-500 font-medium">Electrolito</p>
                <p className="font-bold text-slate-900 mt-1">{chemistry.electrolyte}</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-900">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Protocolo de neutralización segura:</p>
                <p className="mt-0.5">{chemistry.safety_neutralization}</p>
                <p className="mt-1.5 text-[11px] text-red-800">
                  Sustancias peligrosas: {chemistry.hazardous_substances.join(" · ")}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* SECCIÓN PÚBLICA: Rendimiento y Durabilidad (Anexo IV) */}
        <section className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-baidata-lavenderSoft text-baidata-purple">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Rendimiento Electroquímico y Durabilidad
              </h2>
              <p className="text-xs text-slate-500">
                Parámetros nominales declarados · Anexo IV Reglamento (UE) 2023/1542
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <p className="text-slate-500 font-medium">Resistencia Interna Inicial</p>
              <p className="text-lg font-extrabold text-slate-900 mt-1">
                {performance.internal_resistance_initial_mohm} mΩ
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">A 25 °C · 50% SoC</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <p className="text-slate-500 font-medium">Eficiencia Ida y Vuelta</p>
              <p className="text-lg font-extrabold text-slate-900 mt-1">
                {performance.round_trip_efficiency_initial_pct}%
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Al 50% vida: {performance.round_trip_efficiency_50pct_life_pct}%
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <p className="text-slate-500 font-medium">Vida Útil Esperada</p>
              <p className="text-lg font-extrabold text-slate-900 mt-1">
                {performance.expected_lifetime_cycles} ciclos
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Garantía diseño: {performance.expected_lifetime_years} años
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <p className="text-slate-500 font-medium">Umbral Agotamiento</p>
              <p className="text-lg font-extrabold text-slate-900 mt-1">
                {performance.capacity_exhaustion_threshold_pct}% SoH
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Apto Segunda Vida &lt;80%
              </p>
            </div>
          </div>
        </section>

        {/* SECCIÓN PÚBLICA + B2G: Trazabilidad de Materias Primas y Diligencia Debida (Art. 48) */}
        <section className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-sky-50 text-sky-700">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Trazabilidad de Materias Primas y Diligencia Debida
                </h2>
                <p className="text-xs text-slate-500">
                  Artículos 48–52 · Auditoría Tercera Parte:{" "}
                  <span className="font-mono">{dueDiligence.public_attestation.certificate_id}</span>
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              {dueDiligence.public_attestation.status}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-bold text-slate-800">
                Organismo Auditor: {dueDiligence.public_attestation.auditor}
              </span>
              <span className="text-slate-500">
                Fecha verificación: {dueDiligence.public_attestation.audit_date}
              </span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              {dueDiligence.public_attestation.summary}
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {dueDiligence.public_attestation.covered_minerals.map((m, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-0.5 rounded-md bg-white border border-slate-200 font-semibold text-slate-700"
                >
                  {m}
                </span>
              ))}
            </div>
          </div>

          {/* Trazabilidad granular Tier-2/3: solo visible con credencial de Autoridad B2G */}
          {canViewTier3Supply ? (
            <div className="p-4 rounded-xl bg-sky-50/70 border border-sky-200 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-sky-950">
                  Desglose Confidencial de Cadena de Custodia (Refinerías Tier-2/3 · Acceso B2G)
                </p>
                <span className="text-[11px] font-mono text-sky-800">
                  Sello eIDAS verificado
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                {dueDiligence.restricted_tier_traceability.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-white border border-sky-200/80 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{item.mineral}</span>
                      <span className="font-mono text-[10px] text-sky-700">
                        {item.batch_vc}
                      </span>
                    </div>
                    <p className="text-slate-600">{item.origin}</p>
                    <p className="text-[11px] font-medium text-slate-500">
                      Refinería: {item.refiner}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500 pt-1">
              <span className="inline-flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                La identidad de proveedores y refinerías Tier-2/3 está protegida por secreto comercial (acceso exclusivo Autoridad UE).
              </span>
            </div>
          )}
        </section>

        {/* SECCIÓN PÚBLICA: Sostenibilidad y Circularidad (Anexo XIII.1) */}
        <section className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Huella de Carbono y Contenido Reciclado
              </h2>
              <p className="text-xs text-slate-500">
                Información pública obligatoria · Reglamento (UE) 2023/1542
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-semibold text-slate-600">
                  Huella de Carbono Declarada
                </span>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">
                  {carbon.performance_class}
                </span>
              </div>
              <p className="text-2xl font-extrabold text-slate-900">
                {carbon.carbon_footprint_kg_kwh}{" "}
                <span className="text-xs font-normal text-slate-500">kg CO₂e/kWh</span>
              </p>
              <div className="space-y-1.5 pt-1">
                {carbon.lifecycle_breakdown.map((item, i) => (
                  <div key={i} className="text-xs">
                    <div className="flex justify-between text-slate-600 mb-0.5">
                      <span>{item.stage}</span>
                      <span className="font-semibold">{item.share}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-baidata-purple rounded-full"
                        style={{ width: `${item.share}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
              <p className="text-xs font-semibold text-slate-600">
                Contenido Reciclado Certificado (vs. Meta UE 2031)
              </p>
              <div className="space-y-2.5">
                {carbon.recycled_content.map((mat, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200/70 text-xs"
                  >
                    <span className="font-medium text-slate-800">{mat.material}</span>
                    <div className="text-right">
                      <span className="font-extrabold text-baidata-purple text-sm">
                        {mat.actual}%
                      </span>
                      <span className="text-[11px] text-slate-400 ml-1.5">
                        (Meta: {mat.target_2031}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600">
            <strong className="text-slate-800">Instrucciones de fin de vida: </strong>
            {carbon.end_of_life_info}
          </div>
        </section>

        {/* SECCIÓN PÚBLICA / AUDITORÍA: Conformidad Regulatoria UE */}
        <section className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-sky-50 text-sky-700">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Declaración UE de Conformidad y Normativa
                </h2>
                <p className="text-xs text-slate-500">
                  Ref: {compliance.eu_declaration_id} · Organismo: {compliance.notified_body}
                </p>
              </div>
            </div>
            {role === "authority" && (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-sky-100 text-sky-800">
                Sello eIDAS Verificado · {compliance.audit_date}
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {compliance.standards_applied.map((std, idx) => (
              <span
                key={idx}
                className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700"
              >
                {std}
              </span>
            ))}
          </div>

          {!activeCredential && (
            <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                Los submodelos de telemetría BMS, despiece, química y trazabilidad Tier-3 requieren credencial verificable.
              </span>
              <button
                type="button"
                onClick={() => setIsWalletOpen(true)}
                className="text-baidata-purple font-semibold hover:underline self-start sm:self-center shrink-0"
              >
                Presentar credencial →
              </button>
            </div>
          )}
        </section>
      </main>

      {/* Pie de página discreto con acceso técnico M2M para demostraciones */}
      <footer className="border-t border-slate-200 bg-white mt-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>
            Infraestructura de Espacios de Datos Soberanos ·{" "}
            <strong className="text-slate-700">BAIDATA</strong> (IDSA Hub España)
          </p>
          <button
            type="button"
            onClick={() => setIsTraceOpen(true)}
            className="inline-flex items-center gap-1.5 text-slate-500 hover:text-baidata-purple font-mono text-[11px] transition"
          >
            <Server className="w-3.5 h-3.5" />
            <span>Inspeccionar API AAS / Traza Nodo EDC</span>
          </button>
        </div>
      </footer>

      <WalletAuthModal
        isOpen={isWalletOpen}
        onClose={() => setIsWalletOpen(false)}
        onAuthenticate={(cred) => setActiveCredential(cred)}
      />

      <EdcTraceModal
        isOpen={isTraceOpen}
        onClose={() => setIsTraceOpen(false)}
        dppData={dppData}
        activeCredential={activeCredential}
      />
    </div>
  );
}