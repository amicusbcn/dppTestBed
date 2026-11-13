import React, { useState } from "react";
import dppData from "./data/batteryDpp.json";
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
  Scale,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Server,
  PlusCircle,
  Lock,
} from "lucide-react";

export default function App() {
  const [activeCredential, setActiveCredential] = useState(null);
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [isTraceOpen, setIsTraceOpen] = useState(false);
  const [serviceLogs, setServiceLogs] = useState(
    dppData.submodels.workshop_repair.service_log
  );

  const role = activeCredential?.id || "public";
  const canViewBms = ["owner", "workshop", "authority"].includes(role);
  const canViewRepair = ["workshop", "authority"].includes(role);
  const canViewChemistry = ["recycler", "authority"].includes(role);

  const {
    public_nameplate: nameplate,
    carbon_circularity: carbon,
    dynamic_bms: bms,
    workshop_repair: repair,
    recycler_chemistry: chemistry,
    regulatory_compliance: compliance,
  } = dppData.submodels;

  const handleAddServiceRecord = () => {
    const today = new Date().toISOString().split("T")[0];
    setServiceLogs([
      {
        date: today,
        operator: `${activeCredential.holderName} (${activeCredential.did})`,
        action: "Diagnóstico preventivo de celdas y actualización firmware BMS v2.5",
      },
      ...serviceLogs,
    ]);
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

        {/* Cabecera del producto (Placa de características pública - Anexo XIII) */}
        <section className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {dppData.status}
            </span>
            <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
              ID: {dppData.battery_id}
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

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-2.5 text-xs font-mono text-slate-600 overflow-x-auto">
            <QrCode className="w-4 h-4 text-baidata-purple shrink-0" />
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
                {nameplate.nominal_voltage_v}V · {nameplate.weight_kg} kg
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
                Fabricación
              </p>
              <p className="text-sm font-bold text-slate-900 mt-1">
                {nameplate.manufacturing_date}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Categoría UE
              </p>
              <p className="text-sm font-bold text-slate-900 mt-1">
                {nameplate.battery_category}
              </p>
            </div>
          </div>
        </section>

        {/* SUBMODELO DESBLOQUEADO: Estado Dinámico BMS (Propietario / Taller / Autoridad) */}
        {canViewBms && (
          <section className="bg-white rounded-2xl border-2 border-baidata-purple/30 p-6 shadow-sm space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-baidata-lavenderSoft text-baidata-purple">
                  <BatteryCharging className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Estado de Salud y Telemetría BMS
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
                <p className="text-xs font-medium text-slate-600">Ciclos de carga</p>
                <p className="text-2xl font-extrabold text-slate-900 mt-1">
                  {bms.charge_cycles}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Rango operativo: {bms.operating_temp_range}
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

        {/* SUBMODELO DESBLOQUEADO: Reparabilidad y Despiece (Taller / Autoridad) */}
        {canViewRepair && (
          <section className="bg-white rounded-2xl border-2 border-amber-400/50 p-6 shadow-sm space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Información Técnica de Reparación y Despiece
                  </h2>
                  <p className="text-xs text-slate-500">
                    Arquitectura: {repair.cell_architecture} · Manual:{" "}
                    <span className="font-mono">{repair.disassembly_manual}</span>
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800">
                Acceso B2B · Taller Certificado
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

            <div className="space-y-2.5 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-700">
                  Historial federado de intervenciones (Trazabilidad AAS)
                </p>
                {role === "workshop" && (
                  <button
                    type="button"
                    onClick={handleAddServiceRecord}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-600 text-white hover:bg-amber-700 transition"
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

        {/* SECCIÓN PÚBLICA: Sostenibilidad y Circularidad (Anexo XIII.1) */}
        <section className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Sostenibilidad y Circularidad
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
                Los submodelos de telemetría BMS, despiece y química confidencial requieren credencial verificable.
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