import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SelectField from "./SelectField";
import api from "../lib/api";
import "../form.css";

const BATCH_OPTIONS = [
  { value: "school", label: "School" },
  { value: "university", label: "University" },
  { value: "family", label: "Family" },
  { value: "general", label: "General People" },
];

export default function BatchRegistration() {
  const navigate = useNavigate();
  const [type, setType] = useState("");
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [schools, setSchools] = useState([]);
  const [universities, setUniversities] = useState([]);

  // Selected values
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedSchool, setSelectedSchool] = useState("");
  const [selectedUniversity, setSelectedUniversity] = useState("");
  const [ageRange, setAgeRange] = useState("");
  const [sex, setSex] = useState("");
  const [count, setCount] = useState("");

  // Load provinces + universities
  useEffect(() => {
    api.provinces().then(setProvinces);
    api.universities().then(setUniversities);
  }, []);

  // Load districts on province
  useEffect(() => {
    if (selectedProvince) {
      api.districts(selectedProvince).then(setDistricts);
    } else {
      setDistricts([]);
    }
  }, [selectedProvince]);

  // Load schools on province + district
  useEffect(() => {
    if (selectedProvince && selectedDistrict) {
      api.schools(selectedProvince, selectedDistrict).then(setSchools);
    } else {
      setSchools([]);
    }
  }, [selectedProvince, selectedDistrict]);

  const handleSubmit = (e) => {
    e.preventDefault();

    let payload = { type, count: parseInt(count, 10) };

    if (type === "school") {
      payload = {
        ...payload,
        province: selectedProvince,
        district: selectedDistrict,
        school: selectedSchool,
      };
    } else if (type === "university") {
      payload = { ...payload, university: selectedUniversity };
    } else if (type === "family") {
      payload = {
        ...payload,
        province: selectedProvince,
        district: selectedDistrict,
      };
    } else if (type === "general") {
      payload = { ...payload, ageRange, sex };
    }

    api.batchRegister(payload).then(() => {
      alert("Batch registration successful!");
      navigate("/");
    });
  };

  return (
    <div className="form-container">
      <h2>Batch Registration</h2>
      <button type="button" className="back-btn" onClick={() => navigate("/")}>Back</button>

      <form onSubmit={handleSubmit}>
        <SelectField
          label="Select Type"
          options={BATCH_OPTIONS}
          value={type}
          onChange={setType}
        />

        {type === "school" && (
          <>
            <SelectField
              label="Province"
              options={provinces.map((p) => ({ value: p, label: p }))}
              value={selectedProvince}
              onChange={setSelectedProvince}
            />
            <SelectField
              label="District"
              options={districts.map((d) => ({ value: d, label: d }))}
              value={selectedDistrict}
              onChange={setSelectedDistrict}
              disabled={!selectedProvince}
            />
            <SelectField
              label="School"
              options={schools.map((s) => ({ value: s, label: s }))}
              value={selectedSchool}
              onChange={setSelectedSchool}
              disabled={!selectedDistrict}
            />
          </>
        )}

        {type === "university" && (
          <SelectField
            label="University"
            options={universities.map((u) => ({ value: u, label: u }))}
            value={selectedUniversity}
            onChange={setSelectedUniversity}
          />
        )}

        {type === "family" && (
          <>
            <SelectField
              label="Province"
              options={provinces.map((p) => ({ value: p, label: p }))}
              value={selectedProvince}
              onChange={setSelectedProvince}
            />
            <SelectField
              label="District"
              options={districts.map((d) => ({ value: d, label: d }))}
              value={selectedDistrict}
              onChange={setSelectedDistrict}
              disabled={!selectedProvince}
            />
          </>
        )}

        {type === "general" && (
          <>
            <SelectField
              label="Age Range"
              options={[
                { value: "under18", label: "Under 18" },
                { value: "18-25", label: "18-25" },
                { value: "26-40", label: "26-40" },
                { value: "40+", label: "40+" },
              ]}
              value={ageRange}
              onChange={setAgeRange}
            />
            <SelectField
              label="Sex"
              options={[
                { value: "male", label: "Male" },
                { value: "female", label: "Female" },
                { value: "other", label: "Other" },
              ]}
              value={sex}
              onChange={setSex}
            />
          </>
        )}

        {type && (
          <div className="form-group">
            <label>Count</label>
            <input
              type="number"
              value={count}
              onChange={(e) => setCount(e.target.value)}
              min="1"
              required
            />
          </div>
        )}

        <button type="submit" className="submit-btn">
          Register Batch
        </button>
      </form>
    </div>
  );
}
