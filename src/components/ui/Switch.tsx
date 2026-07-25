import React from "react";

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export function Switch({ checked, onChange, label, disabled = false }: SwitchProps) {
  return (
    <label className="flex items-center justify-between gap-4 cursor-pointer group min-h-[44px]">
      {label && (
        <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">
          {label}
        </span>
      )}
      <div className="relative inline-flex items-center group">
        <input
          type="checkbox"
          className="sr-only peer"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
        />
        <div
          className={`
            w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer 
            peer-checked:after:translate-x-full peer-checked:after:border-white 
            after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
            after:bg-white after:border-gray-300 after:border after:rounded-full 
            after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-500
            ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          `}
        ></div>
      </div>
    </label>
  );
}
