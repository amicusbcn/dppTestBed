import React from 'react';
import { X, Server, FileCode2 } from 'lucide-react';

export default function EdcTraceModal({ isOpen, onClose, role, data }) {
  if (!isOpen) return null;

  const contractPreview = {
    '@context': 'https://w3id.org/edc/v0.0.1/ns/',
    '@type': 'ContractAgreement',
    assetId: `dpp-battery-${data.battery_id}`,
    consumerRole: role.toUpperCase(),
    channel:
      role === 'public'
        ? 'HTTP_PUBLIC_PORTAL'
        : role === 'owner'
        ? 'B2B2C_DELEGATED_PROXY'
        : 'EDC_TO_EDC_DSP',
    odrlPolicy: {
      permission:
        role === 'public'
          ? ['READ:public_nameplate', 'READ:carbon_circularity']
          : role === 'owner'
          ? ['READ:public_nameplate', 'READ:carbon_circularity', 'READ:dynamic_bms', 'SHARE:data_act_art5']
          : role === 'workshop'
          ? ['READ:dynamic_bms', 'READ:workshop_repair', 'WRITE:service_log']
          : role === 'recycler'
          ? ['READ:carbon_circularity', 'READ:recycler_chemistry', 'WRITE:end_of_life_status']
          : ['READ:ALL_SUBMODELS', 'AUDIT:regulatory_compliance'],
      prohibition: ['COMMERCIAL_RESALE', 'UNAUTHORIZED_RETENTION'],
    },
  };

  return (
    <div className="fixed inset-0 z-50 bg-baidata-ink/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-baidata-ink text-slate-100 rounded-3xl max-w-xl w-full shadow-2xl border border-baidata-purple/40 overflow-hidden">
        <div className="px-5 py-3.5 bg-baidata-purple flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono text-white font-semibold">
            <Server className="w-4 h-4" />
            <span>INSPECTOR DE ARQUITECTURA FEDERADA · BAIDATA</span>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-3 text-xs">
          <p className="text-slate-300 leading-relaxed">
            En la <strong className="text-white">Fase 2</strong>, cada tarjeta de la interfaz
            consulta un submodelo{' '}
            <span className="font-mono text-baidata-lavender">Asset Administration Shell (AAS)</span>{' '}
            alojado en el nodo EDC del actor que genera el dato, gobernado por esta política ODRL:
          </p>

          <div className="bg-black/60 border border-slate-800 rounded-2xl p-3.5 font-mono text-[11px] text-baidata-lavender overflow-x-auto">
            <div className="flex items-center gap-1.5 text-slate-400 mb-2 pb-1.5 border-b border-slate-800">
              <FileCode2 className="w-3.5 h-3.5" />
              <span>Política activa para rol: {role}</span>
            </div>
            <pre>{JSON.stringify(contractPreview, null, 2)}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}