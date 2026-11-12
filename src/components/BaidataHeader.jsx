import React from 'react';
import { Globe, User, Wrench, Recycle, Landmark, Code2, ChevronRight } from 'lucide-react';

export default function BaidataHeader({ role, onSelectRole, onOpenTrace }) {
  const roles = [
    { id: 'public', label: 'Público (QR)', icon: Globe },
    { id: 'owner', label: 'Propietario', icon: User },
    { id: 'workshop', label: 'Taller (EDC)', icon: Wrench },
    { id: 'recycler', label: 'Reciclador (EDC)', icon: Recycle },
    { id: 'authority', label: 'Autoridad (B2G)', icon: Landmark },
  ];

  return (
    <header className="sticky top-0 z-40 shadow-sm">
      {/* Cabecera blanca fiel a baidata.eu */}
      <div className="bg-white text-baidata-ink border-b border-slate-200 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
          {/* Lockup BAIDATA | INTERNATIONAL DATA SPACES ASSOCIATION | */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <svg
              viewBox="0 0 154 28"
              className="h-6 sm:h-7 w-auto shrink-0"
              aria-label="BAIDATA"
            >
              {/* BAI */}
              <text
                x="0"
                y="22"
                fill="#1A1A1E"
                fontFamily="Plus Jakarta Sans, sans-serif"
                fontWeight="800"
                fontSize="24"
                letterSpacing="1"
              >
                BAI
              </text>
              {/* Punto rojo característico */}
              <circle cx="48" cy="6" r="2.2" fill="#E63946" />
              {/* DATA */}
              <text
                x="53"
                y="22"
                fill="#1A1A1E"
                fontFamily="Plus Jakarta Sans, sans-serif"
                fontWeight="800"
                fontSize="24"
                letterSpacing="1"
              >
                DATA
              </text>
              {/* Cortes horizontales sobre la D */}
              <rect x="51" y="10" width="12" height="2" fill="#FFFFFF" />
              <rect x="51" y="15" width="10" height="2" fill="#FFFFFF" />
              <rect x="46" y="12.5" width="6" height="1.8" fill="#E63946" />
            </svg>

            <span className="h-6 w-[1.5px] bg-baidata-ink/80 shrink-0" />

            <div className="leading-[1.05] text-[8.5px] sm:text-[9.5px] font-bold tracking-tight uppercase">
              <div className="text-baidata-ink">INTERNATIONAL DATA</div>
              <div className="text-baidata-ink">
                SPACES <span className="text-baidata-idsaBlue">ASSOCIATION</span>
              </div>
              <div className="w-7 h-[1.5px] bg-baidata-ink/60 mt-0.5" />
            </div>

            <span className="h-6 w-[1.5px] bg-baidata-ink/80 shrink-0" />
          </div>

          <button
            onClick={onOpenTrace}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-baidata-lavenderSoft hover:bg-baidata-lavender/50 text-baidata-purple text-xs font-bold transition shrink-0"
            title="Inspeccionar arquitectura EDC / ODRL"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Traza EDC / AAS</span>
            <span className="sm:hidden">EDC</span>
          </button>
        </div>
      </div>

      {/* Barra morada corporativa con selector de rol */}
      <div className="bg-baidata-purple text-white px-4 py-2.5">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span className="text-[11px] font-semibold tracking-wide text-white/90 flex items-center gap-1">
            Demostrador DPP · Simular actor <ChevronRight className="w-3.5 h-3.5" />
          </span>
          <div className="flex flex-wrap gap-1.5">
            {roles.map((r) => {
              const Icon = r.icon;
              const isActive = role === r.id;
              return (
                <button
                  key={r.id}
                  onClick={() => onSelectRole(r.id)}
                  className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 transition ${
                    isActive
                      ? 'bg-white text-baidata-purple shadow-sm'
                      : 'bg-baidata-purpleDark/60 text-white/90 hover:bg-baidata-purpleDark'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {r.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
}