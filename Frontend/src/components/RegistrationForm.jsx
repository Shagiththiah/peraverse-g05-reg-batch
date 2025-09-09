import React, { useEffect, useMemo, useState } from 'react';
import SelectField from './SelectField.jsx';
import { api } from '../lib/api.js';

// at the top with your other constants, replace TYPE_BUTTONS with icons
const TYPE_BUTTONS = [
  { label: 'School',     canonical: 'SCHOOL',     icon: '🏫' },
  { label: 'University', canonical: 'UNIVERSITY', icon: '🎓' },
  { label: 'General',    canonical: 'GENERAL',    icon: '👤' },
  { label: 'Company',    canonical: 'GENERAL',    icon: '🏢' },
  { label: 'Government', canonical: 'GENERAL',    icon: '🏛️' },
  { label: 'NGO',        canonical: 'GENERAL',    icon: '🤝' },
  { label: 'Club',       canonical: 'GENERAL',    icon: '🎯' },
  { label: 'Other',      canonical: 'GENERAL',    icon: '➕' }
];

const AGE_RANGES = ['CHILD', 'TEENAGER', 'ADULT', 'SENIOR'];
const SEX = ['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY'];

export default function RegistrationForm() {
  // Default to School so the form is ready immediately
  const [selectedTypeLabel, setSelectedTypeLabel] = useState('School');
  const canonicalType = TYPE_BUTTONS.find(b => b.label === selectedTypeLabel)?.canonical || '';

  // lookup lists
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [schools, setSchools] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [departments, setDepartments] = useState([]);

  // selections
  const [province, setProvince] = useState('');
  const [district, setDistrict] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [university, setUniversity] = useState('');
  const [department, setDepartment] = useState('');
  const [ageRange, setAgeRange] = useState('');
  const [sex, setSex] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(null);
  const [error, setError] = useState('');

  // reset state when type changes + prefetch lists
  useEffect(() => {
    setProvince(''); setDistrict(''); setSchoolName('');
    setUniversity(''); setDepartment('');
    setAgeRange(''); setSex('');
    setError(''); setDone(null);

    if (canonicalType === 'SCHOOL') {
      api.provinces()
        .then(list => {
          const arr = Array.isArray(list) ? list : [];
          setProvinces(arr);
          if (!province && arr.length) setProvince(arr[0]); // auto-pick first
        })
        .catch(() => setProvinces([]));
    } else if (canonicalType === 'UNIVERSITY') {
      api.universities()
        .then(list => {
          const arr = Array.isArray(list) ? list : [];
          setUniversities(arr);
          if (!university && arr.length) setUniversity(arr[0]); // auto-pick first
        })
        .catch(() => setUniversities([]));
    } else if (canonicalType === 'GENERAL') {
      // sensible defaults to reduce clicks
      if (!ageRange) setAgeRange('ADULT');
      if (!sex) setSex('PREFER_NOT_TO_SAY');
    } else {
      setProvinces([]); setUniversities([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canonicalType]);

  // districts after province
  useEffect(() => {
    setDistrict(''); setSchoolName(''); setDistricts([]); setSchools([]);
    if (canonicalType === 'SCHOOL' && province) {
      api.districts(province)
        .then(list => {
          const arr = Array.isArray(list) ? list : [];
          setDistricts(arr);
          if (!district && arr.length) setDistrict(arr[0]); // auto-pick first
        })
        .catch(() => setDistricts([]));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [province, canonicalType]);

  // schools after district
  useEffect(() => {
    setSchoolName(''); setSchools([]);
    if (canonicalType === 'SCHOOL' && province && district) {
      api.schools(province, district)
        .then(list => {
          const arr = Array.isArray(list) ? list : [];
          setSchools(arr);
          if (!schoolName && arr.length) setSchoolName(arr[0]); // auto-pick first
        })
        .catch(() => setSchools([]));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [province, district, canonicalType]);

  // departments after university
  useEffect(() => {
    setDepartment(''); setDepartments([]);
    if (canonicalType === 'UNIVERSITY' && university) {
      api.departments(university)
        .then(list => {
          const arr = Array.isArray(list) ? list : [];
          setDepartments(arr);
          if (!department && arr.length) setDepartment(arr[0]); // auto-pick first
        })
        .catch(() => setDepartments([]));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [university, canonicalType]);

  const canSubmit = useMemo(() => {
    if (submitting) return false;
    if (canonicalType === 'SCHOOL') return !!(province && district && schoolName);
    if (canonicalType === 'UNIVERSITY') return !!(university && department);
    if (canonicalType === 'GENERAL') return !!(ageRange && sex);
    return false;
  }, [canonicalType, province, district, schoolName, university, department, ageRange, sex, submitting]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true); setError('');
    try {
      let payload = { type: canonicalType };
      if (canonicalType === 'SCHOOL') payload = { ...payload, province, district, schoolName };
      if (canonicalType === 'UNIVERSITY') payload = { ...payload, university, department };
      if (canonicalType === 'GENERAL') payload = { ...payload, ageRange, sex };
      const res = await api.register(payload);
      setDone(res.summary);
    } catch (err) {
      setError(err?.response?.data?.error || 'failed to register');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} style={{ marginTop: 16 }}>
      <h1 style={{ marginBottom: 16 }}>Register Visitor</h1>

      {/* Type pills */}
      {/* Type pills — REPLACE your current pills block with this */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
        {TYPE_BUTTONS.map(btn => {
          const active = selectedTypeLabel === btn.label;
          return (
            <button
              key={btn.label}
              type="button"
              onClick={() => setSelectedTypeLabel(btn.label)}
              style={{
                padding: '8px 14px',
                borderRadius: 12,
                border: active ? '1px solid #1e88e5' : '1px solid #CBD5E1',
                background: active ? '#1e88e5' : '#fff',
                color: active ? '#fff' : '#111',        // <-- force visible text color
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                minWidth: 120,                          // give room so text doesn’t clip
                justifyContent: 'center',
                lineHeight: 1,
                cursor: 'pointer'
              }}
            >
              <span aria-hidden="true">{btn.icon}</span>
              <span style={{ whiteSpace: 'nowrap' }}>{btn.label}</span>
            </button>
          );
        })}
      </div>

      {/* SCHOOL */}
      {canonicalType === 'SCHOOL' && (
        <>
          <SelectField id="province" label="Province" value={province} onChange={setProvince}
            options={provinces} placeholder="Select province" />
          <SelectField id="district" label="District" value={district} onChange={setDistrict}
            options={districts} placeholder={province ? 'Select district' : 'Pick province first'} disabled={!province} />
          <SelectField id="school" label="School" value={schoolName} onChange={setSchoolName}
            options={schools} placeholder={district ? 'Select school' : 'Pick district first'} disabled={!district} />
        </>
      )}

      {/* UNIVERSITY */}
      {canonicalType === 'UNIVERSITY' && (
        <>
          <SelectField id="university" label="University" value={university} onChange={setUniversity}
            options={universities} placeholder="Select university" />
          <SelectField id="department" label="Department" value={department} onChange={setDepartment}
            options={departments} placeholder={university ? 'Select department' : 'Pick university first'} disabled={!university} />
        </>
      )}

      {/* GENERAL */}
      {canonicalType === 'GENERAL' && (
        <>
          <SelectField id="ageRange" label="Age range" value={ageRange} onChange={setAgeRange}
            options={AGE_RANGES} placeholder="Select age range" />
          <SelectField id="sex" label="Sex" value={sex} onChange={setSex}
            options={SEX} placeholder="Select sex" />
        </>
      )}

      <button
        type="submit"
        disabled={!canSubmit}
        style={{
          marginTop: 12, padding: '10px 16px', borderRadius: 10, border: 'none',
          background: canSubmit ? '#1e88e5' : '#9dbbe0', color: '#fff', fontWeight: 700
        }}
      >
        Submit
      </button>

      {error && <div role="alert" style={{ marginTop: 12, color: '#b00020' }}>{error}</div>}
      {done && (
        <div style={{ marginTop: 12, background: '#f2fbf4', border: '1px solid #cfe9d6', padding: 12, borderRadius: 10 }}>
          <strong>Done!</strong>
          <div style={{ fontSize: 14, color: '#225b2a' }}>
            Registered: {done.type}. {done.organization ? `Org: ${done.organization}` : ''}
          </div>
        </div>
      )}
    </form>
  );
}
