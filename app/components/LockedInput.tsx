"use client";

import { LockKeyhole } from "lucide-react";

interface LockedInputProps {
  value: number | string;
  onChange: (value: number) => void;
  isLocked: boolean;
  lockReason?: string;
  placeholder?: string;
}

export default function LockedInput({
  value,
  onChange,
  isLocked,
  lockReason,
  placeholder,
}: LockedInputProps) {
  // Versão bloqueada
  if (isLocked) {
    return (
      <div className="relative">
        <input
          type="text"
          value={value}
          disabled
          className="w-20 mx-auto mt-2 text-center text-2xl font-bold bg-slate-700 border-2 border-slate-600 rounded-lg p-2 cursor-not-allowed opacity-60"
          placeholder={placeholder}
        />
        {lockReason && (
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-4">
            <div className="bg-red-500 text-white text-xs p-1 flex gap-2 rounded whitespace-nowrap">
              <LockKeyhole size={14} /> <span>{lockReason}</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Converte o valor para string com segurança - NUNCA retorna NaN
  const safeValue = (() => {
    if (value === undefined || value === null) return "";
    const num = Number(value);
    if (isNaN(num)) return "";
    if (num === 0) return "";
    return String(num);
  })();

  return (
    <input
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      value={safeValue}
      onClick={(e) => {
        e.currentTarget.select();
      }}
      onChange={(e) => {
        const rawValue = e.target.value;

        if (rawValue === "") {
          onChange(0);
          return;
        }

        const numValue = parseInt(rawValue, 10);

        if (!isNaN(numValue) && numValue >= 0 && numValue <= 20) {
          onChange(numValue);
        }
      }}
      className="w-20 mx-auto mt-2 text-center text-2xl font-bold bg-slate-100 text-slate-950 border-2 border-slate-600 focus:border-green-500 focus:outline-none rounded-lg p-2 hover:border-slate-500 transition cursor-pointer"
      placeholder={placeholder}
    />
  );
}
