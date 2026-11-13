import React from "react";
import { Wallet, ShieldCheck, LogOut } from "lucide-react";

export default function BaidataHeader({ activeCredential, onOpenWallet, onLogout }) {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <img
            src="/logo.png"
            alt="BAIDATA · International Data Spaces Association"
            className="h-8 sm:h-9 w-auto object-contain shrink-0"
          />
          <span className="hidden md:inline-block h-5 w-px bg-slate-200" />
          <span className="hidden md:inline-block text-xs font-medium text-slate-500 truncate">
            Pasaporte Digital de Producto · Reglamento (UE) 2023/1542
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {!activeCredential ? (
            <button
              onClick={onOpenWallet}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold bg-baidata-purple text-white hover:bg-baidata-purpleDark transition shadow-sm"
            >
              <Wallet className="w-4 h-4" />
              <span>Identificarse (Wallet / VC)</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="max-w-[140px] sm:max-w-[210px] truncate">
                  {activeCredential.holderName}
                </span>
              </div>
              <button
                onClick={onLogout}
                title="Cerrar sesión de Wallet"
                className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}