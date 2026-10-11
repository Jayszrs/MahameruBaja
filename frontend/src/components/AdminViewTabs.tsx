"use client";
export default function AdminViewTabs<T extends string>({ value, onChange, options, label, disabled = false }: { value: T; onChange: (value: T) => void; options: { value: T; label: string }[]; label: string; disabled?: boolean }) {
  return <nav className="admin-view-tabs" aria-label={label}>{options.map(option => <button type="button" key={option.value} disabled={disabled} aria-pressed={value === option.value} onClick={() => onChange(option.value)}>{option.label}</button>)}</nav>;
}
