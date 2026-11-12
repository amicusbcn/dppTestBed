import React, { useState } from 'react';
import dppData from './data/batteryDpp.json';
import BaidataHeader from './components/BaidataHeader';
import OwnerAuthModal from './components/OwnerAuthModal';
import EdcTraceModal from './components/EdcTraceModal';
import {
  BatteryCharging,
  Leaf,
  Wrench,
  Recycle,
  Landmark,
  Lock,
  Server,
  Share2,
  CheckCircle2,
  AlertTriangle,
  FileText,
  PlusCircle,
  QrCode,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';

export default function App() {
  const [role, setRole] = useState('public');
  const [ownerAuthMethod, setOwnerAuthMethod] = useState(null);
  const [showOwnerModal, setShowOwnerModal] = useState(false);
  const [showTraceModal, setShowTraceModal] = useState(false);
  const [appraiserLink, setAppraiserLink] = useState(null);
  const [serviceLog, setServiceLog] = useState(dppData.submodels.workshop_repair.service_log);

  const { submodels } = dppData;
  const isEdcB2B = role === 'workshop' || role === 'recycler' || role === 'authority';

  const handleSelectRole = (nextRole) => {
    if (nextRole === 'owner' && !ownerAuthMethod) {
      setShowOwnerModal(true);
      return;
    }
    setRole(nextRole);
  };

  const handleOwnerAuthenticated = (method) => {
    setOwnerAuthMethod(method);
    setShowOwnerModal(false);
    setRole('owner');
  };

  const handleGenerateDataActToken = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setAppraiserLink(`https://dpp.baidata.eu/api/v1/share/SOH-${code}?scope=anexoXIII.4&ttl=24h`);
  };

  const handleAddServiceEntry = () => {
    const entry = {
      date: new Date().toISOString().split('T')[0],
      operator: 'Nodo EDC Taller Demo BAIDATA (DID:web:taller-demo.baidata.eu)',
      action: 'Diagnóstico preventivo de celdas y actualización de firmware BMS',
    };
    setServiceLog([entry, ...serviceLog]);
  };

  return (
    <div className="min-h-screen bg-baidata-bg text-baidata-ink pb-16 flex flex-col">
      <BaidataHeader
        role={role}
        onSelectRole={handleSelectRole}
        onOpenTrace={() => setShowTraceModal(true)}
      />

      {/* FRANJA DE CONTEXTO DE CANAL */}
      <div
        className={`border-b px-4 py-2.5 text-xs ${
          isEdcB2B
            ? 'bg-baidata-ink text-white border-slate-800'
            : role === 'owner'
            ? 'bg-baidata-lavender/50 text-baidata-ink border-baidata-lavender'
            : 'bg-white text-slate-700 border-slate-200'
        }`}
      >
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          {role === 'public' && (
            <span>
              <strong className="text-baidata-purple">Vista Pública B2C (Portal DPPSP):</strong>{' '}
              Aterrizaje tras escaneo de código QR GS1 Digital Link. Acceso abierto sin autenticación.
            </span>
          )}
          {role === 'owner' && (
            <span>
              <strong className="text-baidata-purple">Canal B2B2C Propietario:</strong> Autenticado
              vía <span className="underline font-semibold">{ownerAuthMethod}</span>. El portal
              consulta el SoH al espacio de datos en tu nombre.
            </span>
          )}
          {role === 'workshop' && (
            <span className="font-mono text-baidata-lavender">
              ⚡ CONEXIÓN EDC-A-EDC · Rol: Taller Reparación · Contrato ODRL: Lectura [BMS +
              Despiece] + Escritura [Historial]
            </span>
          )}
          {role === 'recycler' && (
            <span className="font-mono text-baidata-lavender">
              ⚡ CONEXIÓN EDC-A-EDC · Rol: Gestor Residuos · Contrato ODRL: Lectura [Química
              Confidencial] (Principio minimización)
            </span>
          )}
          {role === 'authority' && (
            <span className="font-mono text-baidata-lavender">
              ⚡ CONEXIÓN EDC-A-EDC (B2G) · Sello eIDAS Autoridad Vigilancia · Acceso total a todos
              los submodelos
            </span>
          )}
        </div>
      </div>

      {/* CONTENIDO DEL PASAPORTE */}
      <main className="max-w-3xl w-full mx-auto px-4 pt-6 space-y-5 flex-1">
        {/* TARJETA 1: IDENTIFICACIÓN GENERAL */}
        <section className="bg-white rounded-2xl border border-slate-200 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-baidata-purple mb-2">
                <CheckCircle2 className="w-4 h-4 text-baidata-purple" />
                {dppData.status}
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-baidata-ink tracking-tight">
                {submodels.public_nameplate.product_name}
              </h1>
              <p className="text-sm text-slate-600 mt-0.5">
                {submodels.public_nameplate.manufacturer} ·{' '}
                {submodels.public_nameplate.manufacturing_plant}
              </p>
              <div className="mt-3 inline-flex items-center gap-1.5 bg-baidata-bg px-3 py-1.5 rounded-lg text-[11px] font-mono text-slate-600 break-all border border-slate-200/70">
                <QrCode className="w-3.5 h-3.5 text-baidata-purple shrink-0" />
                {dppData.gs1_digital_link}
              </div>
            </div>

            <div className="bg-baidata-purple text-white rounded-2xl p-4 text-right shrink-0">
              <div className="text-[11px] text-white/80 font-semibold">Capacidad Nominal</div>
              <div className="text-2xl font-extrabold mt-0.5">
                {submodels.public_nameplate.nominal_capacity_wh} Wh
              </div>
              <div className="text-xs text-white/85">
                {submodels.public_nameplate.nominal_voltage_v}V ·{' '}
                {submodels.public_nameplate.weight_kg} kg
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-5 pt-4 border-t border-slate-100 text-xs">
            <div>
              <span className="text-slate-400 block">Química de celda</span>
              <span className="font-bold text-baidata-ink">
                {submodels.public_nameplate.chemistry}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">Fecha de fabricación</span>
              <span className="font-bold text-baidata-ink">
                {submodels.public_nameplate.manufacturing_date}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">Categoría UE</span>
              <span className="font-bold text-baidata-ink">
                {submodels.public_nameplate.battery_category}
              </span>
            </div>
          </div>

          <FederatedSourceFooter
            source={submodels.public_nameplate.source_node}
            aasId={submodels.public_nameplate.aas_submodel_id}
          />
        </section>

        {/* TARJETA 2: HUELLA DE CARBONO Y CIRCULARIDAD */}
        <section className="bg-white rounded-2xl border border-slate-200 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
          <div className="flex items-center gap-2 mb-4">
            <Leaf className="w-4 h-4 text-baidata-purple" />
            <span className="text-xs font-bold text-baidata-purple">
              Sostenibilidad y Circularidad · Anexo XIII.1 (Acceso Público)
            </span>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 items-center">
            <div className="bg-baidata-lavenderSoft border border-baidata-lavender/60 rounded-2xl p-4">
              <div className="text-xs text-baidata-purple font-bold">
                Huella de Carbono Declarada
              </div>
              <div className="text-3xl font-extrabold text-baidata-ink my-1">
                {submodels.carbon_circularity.carbon_footprint_kg_kwh}{' '}
                <span className="text-xs font-semibold text-slate-600">kg CO₂e/kWh</span>
              </div>
              <div className="inline-block text-[11px] bg-white text-baidata-purple px-2.5 py-0.5 rounded-full font-bold border border-baidata-lavender">
                {submodels.carbon_circularity.performance_class}
              </div>
            </div>

            <div className="space-y-2.5">
              <div className="text-xs font-bold text-baidata-ink">
                Contenido Reciclado Certificado
              </div>
              {submodels.carbon_circularity.recycled_content.map((item, idx) => (
                <div key={idx}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-700">{item.material}</span>
                    <span className="font-mono text-slate-600">
                      {item.actual}%{' '}
                      <span className="text-slate-400">(Meta UE: {item.target_2031}%)</span>
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className="bg-baidata-purple h-2 rounded-full"
                      style={{ width: `${Math.min(item.actual * 4, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-slate-600 mt-4 bg-baidata-bg p-3 rounded-xl">
            <strong className="text-baidata-ink">Recogida y reciclaje:</strong>{' '}
            {submodels.carbon_circularity.end_of_life_info}
          </p>

          <FederatedSourceFooter
            source={submodels.carbon_circularity.source_node}
            aasId={submodels.carbon_circularity.aas_submodel_id}
          />
        </section>

        {/* BLOQUE LAVANDA DE ACCESOS (INSPIRADO EN LAS SECCIONES DE BAIDATA.EU) */}
        {role === 'public' && (
          <section className="bg-baidata-lavender/55 rounded-3xl p-5 sm:p-6">
            <div className="flex items-start gap-3 mb-4">
              <Lock className="w-5 h-5 text-baidata-purple shrink-0 mt-0.5" />
              <div>
                <h3 className="text-base font-extrabold text-baidata-ink">
                  Capas de Datos Restringidas
                </h3>
                <p className="text-xs text-slate-700 mt-0.5">
                  El Estado de Salud (SoH), el despiece técnico y la composición química están
                  protegidos por políticas de acceso. Elige tu canal:
                </p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <button
                onClick={() => setShowOwnerModal(true)}
                className="p-4 rounded-2xl bg-white hover:shadow-md text-left transition flex items-center justify-between group"
              >
                <div>
                  <div className="text-sm font-extrabold text-baidata-ink">
                    Soy el Propietario
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Canal B2B2C · Ver SoH y compartir vía Data Act
                  </div>
                  <div className="mt-2.5 inline-flex items-center gap-1 text-xs font-bold text-baidata-purple">
                    Autenticarme <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </button>

              <button
                onClick={() => setRole('workshop')}
                className="p-4 rounded-2xl bg-white hover:shadow-md text-left transition flex items-center justify-between group"
              >
                <div>
                  <div className="text-sm font-extrabold text-baidata-ink">
                    Acceso Profesional (EDC)
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Canal B2B · Taller, Reciclador o Autoridad
                  </div>
                  <div className="mt-2.5 inline-flex items-center gap-1 text-xs font-bold text-baidata-purple">
                    Simular túnel EDC <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </button>
            </div>
          </section>
        )}

        {/* TARJETA 3: ESTADO DE SALUD Y USO DINÁMICO */}
        {(role === 'owner' || role === 'workshop' || role === 'authority') && (
          <section className="bg-white rounded-2xl border-2 border-baidata-purple/40 p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <BatteryCharging className="w-4 h-4 text-baidata-purple" />
                <span className="text-xs font-bold text-baidata-purple">
                  Estado de Salud (SoH) y Telemetría BMS · Anexo XIII.4
                </span>
              </div>
              <span className="text-[11px] font-mono bg-baidata-bg text-slate-600 px-2.5 py-1 rounded-full">
                {submodels.dynamic_bms.last_sync}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center mb-4">
              <div className="bg-baidata-lavenderSoft border border-baidata-lavender/60 rounded-2xl p-3">
                <div className="text-[11px] font-bold text-baidata-purple">Estado de Salud</div>
                <div className="text-2xl font-extrabold text-baidata-ink">
                  {submodels.dynamic_bms.state_of_health_soh}%
                </div>
              </div>
              <div className="bg-baidata-bg rounded-2xl p-3">
                <div className="text-[11px] text-slate-500">Ciclos de Carga</div>
                <div className="text-2xl font-extrabold text-baidata-ink">
                  {submodels.dynamic_bms.charge_cycles}
                </div>
              </div>
              <div className="bg-baidata-bg rounded-2xl p-3">
                <div className="text-[11px] text-slate-500">Capacidad Útil</div>
                <div className="text-2xl font-extrabold text-baidata-ink">
                  {submodels.dynamic_bms.remaining_capacity_wh} Wh
                </div>
              </div>
            </div>

            {submodels.dynamic_bms.extreme_events.map((ev, i) => (
              <div
                key={i}
                className="flex items-center gap-2 text-xs bg-amber-50 text-amber-950 border border-amber-200 p-3 rounded-xl"
              >
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  <strong>{ev.date}:</strong> {ev.event} ({ev.impact})
                </span>
              </div>
            ))}

            {/* DELEGACIÓN EU DATA ACT */}
            {role === 'owner' && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-xs font-extrabold text-baidata-ink">
                      Delegación a Tasador / Comprador 2ª Mano (EU Data Act Art. 5)
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Genera un acceso temporal vía API del DPPSP para acreditar el SoH sin ceder
                      tu cuenta.
                    </p>
                  </div>
                  <button
                    onClick={handleGenerateDataActToken}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-baidata-purple hover:bg-baidata-purpleDark text-white text-xs font-bold rounded-full shrink-0 transition"
                  >
                    <Share2 className="w-3.5 h-3.5" /> Autorizar consulta (24h)
                  </button>
                </div>
                {appraiserLink && (
                  <div className="mt-2.5 p-3 bg-baidata-ink text-baidata-lavender font-mono text-[11px] rounded-xl flex items-center justify-between gap-2 break-all">
                    <span>{appraiserLink}</span>
                    <span className="text-[10px] bg-baidata-purple text-white px-2 py-0.5 rounded-full shrink-0">
                      OAuth2 Token
                    </span>
                  </div>
                )}
              </div>
            )}

            <FederatedSourceFooter
              source={submodels.dynamic_bms.source_node}
              aasId={submodels.dynamic_bms.aas_submodel_id}
            />
          </section>
        )}

        {/* TARJETA 4: REPARACIÓN Y DESPIECE (TALLER Y AUTORIDAD) */}
        {(role === 'workshop' || role === 'authority') && (
          <section className="bg-white rounded-2xl border-2 border-baidata-purple/50 p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-baidata-purple" />
                <span className="text-xs font-bold text-baidata-purple">
                  Manual de Desmontaje y Reparación · Anexo XIII.2 (Taller)
                </span>
              </div>
              {role === 'workshop' && (
                <button
                  onClick={handleAddServiceEntry}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-baidata-purple hover:bg-baidata-purpleDark text-white text-xs font-bold rounded-full transition"
                >
                  <PlusCircle className="w-3.5 h-3.5" /> Escribir intervención en EDC
                </button>
              )}
            </div>

            <div className="grid sm:grid-cols-2 gap-3 text-xs mb-4">
              <div className="bg-baidata-bg p-3 rounded-xl">
                <span className="text-slate-400 block">Arquitectura de celdas</span>
                <span className="font-bold text-baidata-ink">
                  {submodels.workshop_repair.cell_architecture}
                </span>
              </div>
              <div className="bg-baidata-bg p-3 rounded-xl">
                <span className="text-slate-400 block">Documentación técnica OEM</span>
                <span className="font-bold text-baidata-purple flex items-center gap-1 mt-0.5">
                  <FileText className="w-3.5 h-3.5" /> {submodels.workshop_repair.disassembly_manual}
                </span>
              </div>
            </div>

            <div className="text-xs font-bold text-baidata-ink mb-2">
              Bitácora Federada de Mantenimiento (Datos escritos en origen por talleres):
            </div>
            <div className="space-y-2">
              {serviceLog.map((item, idx) => (
                <div
                  key={idx}
                  className="text-xs bg-baidata-bg p-3 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-1"
                >
                  <div>
                    <div className="font-bold text-baidata-ink">{item.action}</div>
                    <div className="text-[11px] text-slate-500 font-mono">{item.operator}</div>
                  </div>
                  <span className="font-mono text-[11px] text-slate-400 shrink-0">{item.date}</span>
                </div>
              ))}
            </div>

            <FederatedSourceFooter
              source={submodels.workshop_repair.source_node}
              aasId={submodels.workshop_repair.aas_submodel_id}
            />
          </section>
        )}

        {/* TARJETA 5: COMPOSICIÓN QUÍMICA DETALLADA (RECICLADOR Y AUTORIDAD) */}
        {(role === 'recycler' || role === 'authority') && (
          <section className="bg-white rounded-2xl border-2 border-baidata-purple/50 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Recycle className="w-4 h-4 text-baidata-purple" />
              <span className="text-xs font-bold text-baidata-purple">
                Composición Química y Seguridad · Anexo XIII.2 (Reciclador)
              </span>
            </div>

            <div className="grid sm:grid-cols-2 gap-2.5 text-xs mb-3">
              <div className="p-3 bg-baidata-lavenderSoft/60 rounded-xl">
                <span className="text-slate-500 block">Cátodo</span>
                <strong className="text-baidata-ink">{submodels.recycler_chemistry.cathode}</strong>
              </div>
              <div className="p-3 bg-baidata-lavenderSoft/60 rounded-xl">
                <span className="text-slate-500 block">Ánodo</span>
                <strong className="text-baidata-ink">{submodels.recycler_chemistry.anode}</strong>
              </div>
              <div className="p-3 bg-baidata-lavenderSoft/60 rounded-xl">
                <span className="text-slate-500 block">Electrolito</span>
                <strong className="text-baidata-ink">
                  {submodels.recycler_chemistry.electrolyte}
                </strong>
              </div>
              <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-red-950">
                <span className="text-red-700 font-bold flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" /> Sustancias peligrosas
                </span>
                <strong className="block mt-0.5">
                  {submodels.recycler_chemistry.hazardous_substances.join(' · ')}
                </strong>
              </div>
            </div>

            <FederatedSourceFooter
              source={submodels.recycler_chemistry.source_node}
              aasId={submodels.recycler_chemistry.aas_submodel_id}
            />
          </section>
        )}

        {/* TARJETA 6: CONFORMIDAD REGULATORIA (SOLO AUTORIDAD B2G) */}
        {role === 'authority' && (
          <section className="bg-white rounded-2xl border-2 border-baidata-purple/50 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Landmark className="w-4 h-4 text-baidata-purple" />
              <span className="text-xs font-bold text-baidata-purple">
                Documentación de Conformidad UE · Anexo XIII.3 (Acceso B2G)
              </span>
            </div>

            <div className="grid sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-baidata-lavenderSoft/60 rounded-xl">
                <span className="text-slate-500 block">Declaración UE de Conformidad</span>
                <strong className="font-mono text-baidata-ink">
                  {submodels.regulatory_compliance.eu_declaration_id}
                </strong>
              </div>
              <div className="p-3 bg-baidata-lavenderSoft/60 rounded-xl">
                <span className="text-slate-500 block">Organismo Notificado</span>
                <strong className="text-baidata-ink">
                  {submodels.regulatory_compliance.notified_body}
                </strong>
              </div>
            </div>

            <FederatedSourceFooter
              source={submodels.regulatory_compliance.source_node}
              aasId={submodels.regulatory_compliance.aas_submodel_id}
            />
          </section>
        )}
      </main>

      {/* PIE INSTITUCIONAL */}
      <footer className="max-w-3xl w-full mx-auto px-4 mt-10 text-center text-[11px] text-slate-500">
        Recursos, formación y comunidad para acelerar la adopción de estándares y buenas prácticas
        en espacios de datos ·{' '}
        <a
          href="https://baidata.eu"
          target="_blank"
          rel="noreferrer"
          className="text-baidata-purple font-bold hover:underline"
        >
          baidata.eu
        </a>
      </footer>

      {/* MODALES */}
      <OwnerAuthModal
        isOpen={showOwnerModal}
        onClose={() => setShowOwnerModal(false)}
        onAuthenticated={handleOwnerAuthenticated}
      />

      <EdcTraceModal
        isOpen={showTraceModal}
        onClose={() => setShowTraceModal(false)}
        role={role}
        data={dppData}
      />
    </div>
  );
}

function FederatedSourceFooter({ source, aasId }) {
  return (
    <div className="mt-4 pt-2.5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] text-slate-400">
      <div className="flex items-center gap-1.5">
        <Server className="w-3 h-3 text-baidata-purple shrink-0" />
        <span>
          Origen federado: <strong className="font-semibold text-slate-600">{source}</strong>
        </span>
      </div>
      <span className="font-mono text-[10px] text-slate-400 truncate">{aasId}</span>
    </div>
  );
}