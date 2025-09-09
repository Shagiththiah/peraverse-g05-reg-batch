import React, { useEffect, useMemo, useState } from "react";
import SelectField from "./SelectField.jsx";
import { api } from "../lib/api.js";

const TYPE_BUTTONS = [
  { label: "School", canonical: "SCHOOL" },
  { label: "University", canonical: "UNIVERSITY" },
  { label: "Family", canonical: "FAMILY" },
  { label: "General", canonical: "GENERAL" },
  { label: "Company", canonical: "GENERAL" },
  { label: "Government", canonical: "GENERAL" },
  { label: "NGO", canonical: "GENERAL" },
  { label: "Club", canonical: "GENERAL" },
  { label: "Other", canonical: "GENERAL" }
];

const AGE_RANGES = ["CHILD", "TEENAGER", "ADULT", "SENIOR"];
const SEX = ["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"];
const FAMILY_TYPES = ["NUCLEAR", "EXTENDED", "SINGLE_PARENT", "OTHER"];

export default function RegistrationForm() {
  const [selectedTypeLabel, setSelectedTypeLabel] = useState("");
  const canonicalType =
    TYPE_BUTTONS.find((b) => b.label === selectedTypeLabel)?.canonical || "";

  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [schools, setSchools] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [university, setUniversity] = useState("");
  const [department, setDepartment] = useState("");
  const [ageRange, setAgeRange] = useState("");
  const [sex, setSex] = useState("");
  const [familyType, setFamilyType] = useState("");
  const [groupSize, setGroupSize] = useState(1);

  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setProvince("");
    setDistrict("");
    setSchoolName("");
    setUniversity("");
    setDepartment("");
    setAgeRange("");
    setSex("");
    setFamilyType("");
    setGroupSize(1);
    setError("");
    setDone(null);

    if (canonicalType === "SCHOOL") {
      api.provinces()
        .then((list) => setProvinces(Array.isArray(list) ? list : []))
        .catch(() => setProvinces([]));
    } else if (canonicalType === "UNIVERSITY") {
      api.universities()
        .then((list) => setUniversities(Array.isArray(list) ? list : []))
        .catch(() => setUniversities([]));
    } else {
      setProvinces([]);
      setUniversities([]);
    }
  }, [canonicalType]);

  const canSubmit = useMemo(() => {
    if (submitting) return false;
    if (canonicalType === "SCHOOL")
      return !!(province && district && schoolName && groupSize > 0);
    if (canonicalType === "UNIVERSITY")
      return !!(university && department && groupSize > 0);
    if (canonicalType === "FAMILY")
      return !!(familyType && groupSize > 0);
    if (canonicalType === "GENERAL")
      return !!(ageRange && sex && groupSize > 0);
    return false;
  }, [
    canonicalType,
    province,
    district,
    schoolName,
    university,
    department,
    ageRange,
    sex,
    familyType,
    groupSize,
    submitting
  ]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError("");

    try {
      let payload = { type: canonicalType, group_size: groupSize };
      if (canonicalType === "SCHOOL")
        payload = { ...payload, province, district, schoolName };
      if (canonicalType === "UNIVERSITY")
        payload = { ...payload, university, department };
      if (canonicalType === "FAMILY")
        payload = { ...payload, group_meta: { familyType } };
      if (canonicalType === "GENERAL")
        payload = { ...payload, ageRange, sex };

      const res = await api.register(payload);
      setDone(res.summary);
    } catch (err) {
      setError(err?.response?.data?.error || "failed to register");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} style={{ marginTop: 16 }}>
      <h1>Register Visitor</h1>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
        {TYPE_BUTTONS.map((btn) => (
          <button
            key={btn.label}
            type="button"
            onClick={() => setSelectedTypeLabel(btn.label)}
            style={{
              padding: "8px 14px",
              borderRadius: 10,
              border: selectedTypeLabel === btn.label ? "2px solid #1e88e5" : "1px solid #ccc",
              background: selectedTypeLabel === btn.label ? "#e8f2fd" : "#fff",
              cursor: "pointer",
            }}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {canonicalType === "SCHOOL" && (
        <>
          <SelectField id="province" label="Province" value={province} onChange={setProvince} options={provinces} />
          <SelectField id="district" label="District" value={district} onChange={setDistrict} options={districts} />
          <SelectField id="school" label="School" value={schoolName} onChange={setSchoolName} options={schools} />
          <label>Group Size:</label>
          <input type="number" value={groupSize} onChange={(e) => setGroupSize(Number(e.target.value))} min="1" />
        </>
      )}

      {canonicalType === "UNIVERSITY" && (
        <>
          <SelectField id="university" label="University" value={university} onChange={setUniversity} options={universities} />
          <SelectField id="department" label="Department" value={department} onChange={setDepartment} options={departments} />
          <label>Group Size:</label>
          <input type="number" value={groupSize} onChange={(e) => setGroupSize(Number(e.target.value))} min="1" />
        </>
      )}

      {canonicalType === "FAMILY" && (
        <>
          <SelectField id="familyType" label="Family Type" value={familyType} onChange={setFamilyType} options={FAMILY_TYPES} />
          <label>Family Size:</label>
          <input type="number" value={groupSize} onChange={(e) => setGroupSize(Number(e.target.value))} min="1" />
        </>
      )}

      {canonicalType === "GENERAL" && (
        <>
          <SelectField id="ageRange" label="Age Range" value={ageRange} onChange={setAgeRange} options={AGE_RANGES} />
          <SelectField id="sex" label="Sex" value={sex} onChange={setSex} options={SEX} />
          <label>Group Size:</label>
          <input type="number" value={groupSize} onChange={(e) => setGroupSize(Number(e.target.value))} min="1" />
        </>
      )}

      <button type="submit" disabled={!canSubmit}>Submit</button>

      {error && <div style={{ color: "red" }}>{error}</div>}
      {done && <div style={{ color: "green" }}>✅ Registered successfully</div>}
    </form>
  );
}
