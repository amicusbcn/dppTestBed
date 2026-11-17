import React from "react";
import { Wallet, ShieldCheck, LogOut } from "lucide-react";
import HeaderActionsMenu from "./HeaderActionsMenu";

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

        <HeaderActionsMenu
          lang={lang}
          onChangeLang={onChangeLang}
          batteryId={batteryId}
          activeCredential={activeCredential}
          onOpenAuthModal={onOpenWallet}
          onLogout={onLogout}
        />      </div>
    </header>
  );
}