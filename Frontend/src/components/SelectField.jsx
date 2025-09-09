import React from 'react';
export default function SelectField({ label, value, onChange, options, placeholder='Select...', disabled=false, id }) {
  return (
    <label style={{ display: 'block', marginBottom: 12 }}>
      <span style={{ display: 'block', marginBottom: 6, fontWeight: 600 }}>{label}</span>
      <select
        id={id} aria-label={label} value={value}
        onChange={e => onChange(e.target.value)} disabled={disabled}
        style={{ width:'100%', padding:'10px 12px', borderRadius:10, border:'1px solid #ccc', outline:'none' }}>
        <option value="" disabled>{placeholder}</option>
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </label>
  );
}
