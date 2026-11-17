import React, { useState, useRef, useEffect } from "react";
import { buildPassportPath } from "../services/aasClient";
import { useTranslation } from "../hooks/useTranslation";

export default function HeaderActionsMenu({
  lang = "es",
  onChangeLang,
  batteryId,
  activeCredential,
  onOpenAuthModal,
  onLogout,
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const { t } = useTranslation(lang);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggleLanguage = () => {
    const nextLang = lang === "es" ? "en" : "es";
    const nextPath = buildPassportPath(nextLang, batteryId);
    window.history.pushState({}, "", nextPath);
    onChangeLang(nextLang);
    setOpen(false);
  };

  const activeRole = activeCredential?.id;

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label={lang === "en" ? "Options menu" : "Menú de opciones"}
        className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm font-medium text-slate-700 shadow-xs transition hover:bg-slate-50"
      >
        {activeRole && activeRole !== "public" && (
          <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700 uppercase">
            {activeRole}
          </span>
        )}
        <span className="text-xs font-semibold text-slate-500 uppercase">
          {lang}
        </span>
        <svg className="h-5 w-5 text-slate-600" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10 6a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm0 5.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm0 5.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-60 origin-top-right rounded-xl border border-slate-200 bg-white py-1.5 shadow-lg">
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onOpenAuthModal();
            }}
            className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50"
          >
            <span className="font-medium">
              {t("header.authProfile")}
            </span>
            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-semibold text-slate-600 uppercase">
              {activeRole || t("header.public")}
            </span>
          </button>

          {activeCredential && onLogout && (
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onLogout();
              }}
              className="flex w-full items-center justify-between px-4 py-2 text-left text-xs font-medium text-rose-600 hover:bg-rose-50"
            >
              <span>{t("header.signOut")}</span>
            </button>
          )}

          <div className="my-1 border-t border-slate-100" />

          <button
            type="button"
            onClick={handleToggleLanguage}
            className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50"
          >
            <span className="font-medium">
              {lang === "en" ? t("header.switchToEs") : t("header.switchToEn")}
            </span>
            <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[11px] font-bold text-blue-700">
              {lang === "en" ? "ES" : "EN"}
            </span>
          </button>
        </div>
      )}
    </div>
  );
}