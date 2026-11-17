import React from "react";

export default function AuditField({ isFromAas, value, suffix = "" }) {
  return (
    <span
      className={
        isFromAas
          ? ""
          : "text-rose-600 font-semibold border-b border-dotted border-rose-400"
      }
    >
      {value}
      {suffix}
    </span>
  );
}