import React, { useEffect, useMemo, useState } from "react";
import SelectField from "./SelectField";
import api from "../lib/api";

const TYPE_BUTTONS = [
  { label: "School", canonical: "SCHOOL" },
  { label: "University", canonical: "UNIVERSITY" },
  { label: "Family", canonical: "FAMILY" },
  { label: "General", canonical: "GENERAL" },
];

const AGE_RANGES = ["CHILD", "TEENAGER", "ADULT", "SENIOR"];
const SEX = ["MALE", "FEMALE", "OTHER"];

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
  const [groupSize, setGroupSize] = useState(1);

  const [done, setDone] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (canonicalType === "SCHOOL") {
      api.provinces().then(setProvinces).catch(() => setProvinces([]));
    } else if (canonicalType === "UNIVERSITY") {
      api.universities().then(setUniversities).catch(() => setUniversities([]));
    }
  }, [canonicalType]);

  useEffect(() => {
    if (canonicalType === "SCHOOL" && province) {
      api.districts(province).then(setDistricts).catch(() => setDistricts([]));
    }
  }, [province, canonicalType]);

  useEffect(() => {
    if (canonicalType === "SCHOOL" && province && district) {
      api.schools(province, district).then(setSchools).catch(() => setSchools([]));
    }
  }, [province, district, canonicalType]);

  useEffect(() => {
    if (canonicalType === "UNIVERSITY" && university) {
      api.departments(university).then(setDepartments).catch(() => setDepartments([]));
    }
  }, [university, canonicalType]);

  const canSubmit = useMemo(() => {
    if (canonicalType === "SCHOOL") return province && district && schoolName && groupSize > 0;
    if (canonicalType === "UNIVERSITY") return university && department && groupSize > 0;
    if (canonicalType === "GENERAL") return ageRange && sex && groupSize > 0;
    if (canonicalType === "FAMILY") return groupSize > 0;
    return false;
  }, [canonicalType, province, district, schoolName, university, department, ageRange, sex, groupSize]);

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      let payload = { type: canonicalType, group_size: groupSize };
      if (canonicalType === "SCHOOL") payload = { ...payload, province, district, schoolName };
      if (canonicalType === "UNIVERSITY") payload = { ...payload, university, department };
      if (canonicalType === "GENERAL") payload = { ...payload, ageRange, sex };
      if (canonicalType === "FAMILY") payload = { ...payload };

      const res = await api.register(payload);
      setDone(res);
      setError("");
    } catch (err) {
      setError("Registration failed");
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <h2>Register Visitor</h2>

      {/* Type selection */}
      <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
        {TYPE_BUTTONS.map((btn) => (
          <button
            key={btn.label}
            type="button"
            onClick={() => setSelectedTypeLabel(btn.label)}
            style={{
              padding: "6px 12px",
              borderRadius: 6,
              border: selectedTypeLabel === btn.label ? "2px solid blue" : "1px solid gray",
            }}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* SCHOOL */}
      {canonicalType === "SCHOOL" && (
        <>
          <SelectField id="province" label="Province" value={province} onChange={setProvince} options={provinces} placeholder="Select province" />
          <SelectField id="district" label="District" value={district} onChange={setDistrict} options={districts} placeholder="Select district" disabled={!province} />
          <SelectField id="school" label="School" value={schoolName} onChange={setSchoolName} options={schools} placeholder="Select school" disabled={!district} />
        </>
      )}

      {/* UNIVERSITY */}
      {canonicalType === "UNIVERSITY" && (
        <>
          <SelectField id="university" label="University" value={university} onChange={setUniversity} options={universities} placeholder="Select university" />
          <SelectField id="department" label="Department" value={department} onChange={setDepartment} options={departments} placeholder="Select department" disabled={!university} />
        </>
      )}

      {/* GENERAL */}
      {canonicalType === "GENERAL" && (
        <>
          <SelectField id="ageRange" label="Age range" value={ageRange} onChange={setAgeRange} options={AGE_RANGES} placeholder="Select age range" />
          <SelectField id="sex" label="Sex" value={sex} onChange={setSex} options={SEX} placeholder="Select sex" />
        </>
      )}

      {/* FAMILY */}
      {canonicalType === "FAMILY" && (
        <>
          <label>Family Group</label>
          <p>Register family members together</p>
        </>
      )}

      {/* Group Size */}
      {canonicalType && (
        <div>
          <label>Group Size</label>
          <input type="number" min="1" value={groupSize} onChange={(e) => setGroupSize(Number(e.target.value))} />
        </div>
      )}

      <button type="submit" disabled={!canSubmit}>Submit</button>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {done && <p style={{ color: "green" }}>✅ Registered!</p>}
    </form>
  );
}
