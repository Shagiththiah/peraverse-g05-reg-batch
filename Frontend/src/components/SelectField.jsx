import React from "react";

export default function SelectField({ id, label, value, onChange, options, placeholder, disabled }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <label htmlFor={id} style={{ display: "block", marginBottom: 4 }}>
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        style={{ width: "100%", padding: 8, borderRadius: 6 }}
      >
        <option value="">{placeholder}</option>
        {options.map((opt, i) => (
          <option key={i} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}
