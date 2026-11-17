import React from "react";
import HeaderActionsMenu from "./HeaderActionsMenu";
import { useTranslation } from "../hooks/useTranslation"; // Importa el hook

export default function BaidataHeader({
  activeCredential,
  onOpenWallet,
  onLogout,
  lang = "es",
  onChangeLang,
  batteryId
}) {
  const { t } = useTranslation(lang); // Inicializa

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/80 border-b border-slate-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        
        {/* Aquí tendrás tu logo de BAIDATA */}
        <div className="flex items-center gap-2">
            <img src="/logo.png" alt="BAIDATA" className="h-6 w-auto" /> {/* Ajustado a h-6 */}
           <span className="font-extrabold text-lg text-slate-800 ml-2 border-l border-slate-300 pl-2">
             {t("header.subtitle")} {/* Usa t() */}
           </span>
        </div>

        {/* Zona derecha de la cabecera */}
        <div className="flex items-center gap-3">
          <HeaderActionsMenu
            lang={lang}
            onChangeLang={onChangeLang}
            batteryId={batteryId}
            activeCredential={activeCredential}
            onOpenAuthModal={onOpenWallet}
            onLogout={onLogout}
          />
        </div>
      </div>
    </header>
  );
}