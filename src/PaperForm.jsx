import React, { useState, useRef, useEffect } from "react";
import { useApiData } from "./ContextAPI";
import { auth } from './firebase'; // Firebase auth instance

export default function PaperForm() {
  const { API_URL } = useApiData();
  const [form, setForm] = useState({
    year: "",
    semester: "",
    paperPrefix: "", // S, W, F ke liye
    paperCode: "",   // 4 digits ke liye
    subjectName: "",
    type: "",
    status: "Disabled",
    pdfFile: null,
    branches: [], // Now an array for multiple branches
  });

  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [loading, setLoading] = useState(false);
  const [disableSubmit, setDisableSubmit] = useState(true);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [existingBranches, setExistingBranches] = useState([]); // Duplicates track karne ke liye
  const [isOpen, setIsOpen] = useState(false); // Dropdown toggle
  const dropdownRef = useRef(null);

  // Mapping Object
  const branchesMap = {
   "All_Branches ":" 1 & 2 Sem",
    "CSE": "Computer Science Engineering",
    "CE": "Civil Engineering",
    "ME": "Mechanical Engineering",
    "EE": "Electrical Engineering",
    "EC": "Electronics Engineering",
    "CH": "Chemical Engineering",
    "PE": "Production Engineering",
    "IC": "Instrumentation & Control Engineering",
    "CTM": "Construction Technology & Management",
    "CT": "Cement Technology & Management",
    "IT": "Information Technology",
    "MS": "Metallurgical Engineering",
    "OE": "Office Engineering",
    "MOM": "Modern Office Management",
    "BCC": "Bachelor of Computer Applications",
    "AE": "Automobile Engineering",
    "MIN": "Mining Engineering",
    "TX": "Textile Engineering",
    "IP": "Industrial & Production Engineering",
    "AR": "Architecture Assistantship",
    "EI": "Electronics & Instrumentation Engineering",
    "PET": "Petrochemical Engineering"
  };

  // Click outside dropdown to close logic
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isPaperCodeValid = /^[0-9]{4}$/.test(form.paperCode.trim());

  const getFullPaperCode = () => {
    if (!form.paperPrefix || !form.paperCode) return "";
    return `${form.paperPrefix}-${form.paperCode.trim()}`;
  };

  const allFieldsFilled = form.year && form.semester && form.paperPrefix && isPaperCodeValid && form.subjectName.trim() && form.branches.length > 0 && form.type && form.pdfFile;

  const handleChange = (e) => {
    const { name, value, files, checked } = e.target;

    setIsVerified(false);
    setDisableSubmit(true);
    setExistingBranches([]); 

    if (name === "pdfFile") {
      const file = files[0];
      if (!file) return;
      if (file.type !== "application/pdf") {
        showToast("Invalid format. PDF only!", "error");
        setForm({ ...form, pdfFile: null });
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        showToast("File size too large (Max 10MB)", "error");
        setForm({ ...form, pdfFile: null });
        return;
      }
      setForm({ ...form, pdfFile: file });
      return;
    }

    if (name === "branchCheckbox") {
      let updatedBranches = [...form.branches];
      if (checked) {
        updatedBranches.push(value);
      } else {
        updatedBranches = updatedBranches.filter(b => b !== value);
      }
      setForm({ ...form, branches: updatedBranches });
      return;
    }

    setForm({ ...form, [name]: value });
  };

  const fileToBase64 = (file) =>
    new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.readAsDataURL(file);
    });

  const genID = () => "PID-" + Date.now() + "-" + Math.floor(Math.random() * 9999);

  const showToast = (message, type) => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 4000);
  };

  const checkDuplicate = async () => {
    if (!allFieldsFilled || isRequesting) return;

    setIsRequesting(true);
    setVerifyLoading(true);
    setExistingBranches([]);

    try {
      const params = new URLSearchParams({
        action: "check",
        year: form.year,
        semester: form.semester,
        paperCode: getFullPaperCode(),
        type: form.type,
        branches: form.branches.join(","), 
      });

      const res = await fetch(`${API_URL}?${params.toString()}`);
      const data = await res.json();

      setVerifyLoading(false);
      setIsRequesting(false);

      if (data.status === "success" && data.exists) {
        setExistingBranches(data.existingBranches || []); 
        showToast(`Already exists in: ${data.existingBranches.join(", ")}`, "error");
        setIsVerified(false);
        setDisableSubmit(true);
        setIsOpen(true); // Taaki user dekh sake konsi branch red hai
      } else {
        showToast("No duplicates found. Ready!", "success");
        setIsVerified(true);
        setDisableSubmit(false);
      }
    } catch (err) {
      showToast("Verification failed!", "error");
      setVerifyLoading(false);
      setIsVerified(false);
      setDisableSubmit(true);
      setIsRequesting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isVerified || isRequesting) return;

    setIsRequesting(true);
    setLoading(true);

    try {
      const base64PDF = await fileToBase64(form.pdfFile);
      const safeSubject = form.subjectName.trim().replace(/\s+/g, "_");
      const customFileName = `${form.year}_${getFullPaperCode()}_${safeSubject}_${form.type}.pdf`;

      const payload = {
        action: "save",
        id: genID(),
        year: form.year,
        semester: form.semester,
        paperCode: getFullPaperCode(),
        subjectName: form.subjectName,
        type: form.type,
        status: form.status,
        branches: form.branches, 
        email: auth.currentUser?.email || "",
        filename: customFileName,
        pdfBase64: base64PDF,
      };

      const addRes = await fetch(API_URL, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const addData = await addRes.json();

      if (addData.status === "success") {
        showToast("Paper uploaded for all selected branches!", "success");
        setForm({
          year: "", semester: "", paperPrefix: "", paperCode: "",
          subjectName: "", type: "", status: "Disabled", pdfFile: null, branches: [],
        });
        setIsVerified(false);
        setDisableSubmit(true);
        setExistingBranches([]);
      } else {
        showToast("Upload failed!", "error");
      }
    } catch (err) {
      showToast("Server Error!", "error");
    } finally {
      setLoading(false);
      setIsRequesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4 mt-15">
      <style>{`
        @keyframes progress { from { width: 100%; } to { width: 0%; } } 
        @keyframes slideDown { from { transform: translateY(-100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .animate-slideDown { animation: slideDown 0.4s ease-out forwards; }
      `}</style>

      {toast.show && (
        <div className="fixed top-18 left-1/2 -translate-x-1/2 z-[500] w-[85%] max-w-[450px] animate-slideDown">
          <div className={`${toast.type === "success" ? "bg-emerald-600 shadow-emerald-500/20" : "bg-rose-600 shadow-rose-500/20"} p-3 rounded-xl shadow-2xl flex items-center justify-center gap-3 text-white border border-white/10`}>
            <p className="font-bold text-sm text-center">{toast.message}</p>
          </div>
          <div className="w-full h-1 bg-black/20 rounded-b-xl overflow-hidden mt-[-4px]">
            <div className="h-full bg-white/50" style={{ animation: 'progress 4s linear forwards' }}></div>
          </div>
        </div>
      )}

      <div className="max-w-[600px] w-full bg-white shadow-2xl border border-gray-200 overflow-hidden rounded-xl">
        <div className="bg-gradient-to-r from-gray-600 to-gray-700 p-4 text-center">
          <h1 className="text-2xl font-bold text-white tracking-wider">MPQP Admin</h1>
          <p className="text-gray-200 text-sm mt-1">Academic Paper Management System</p>
        </div>

        <div className="p-4">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                <select name="year" value={form.year} onChange={handleChange} disabled={loading} className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-gray-400">
                  <option value="">Select Year</option>
                  <option>2023</option><option>2024</option><option>2025</option><option>2026</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                <select name="semester" value={form.semester} onChange={handleChange} disabled={loading} className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-gray-400">
                  <option value="">Select Semester</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(num => <option key={num}>{num}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Paper Code</label>
              <div className="flex">
                <select name="paperPrefix" value={form.paperPrefix} onChange={handleChange} className="p-3 border border-r-0 border-gray-300 rounded-l-lg bg-gray-50 font-bold">
                  <option value="">-</option><option value="S">S</option><option value="W">W</option><option value="F">F</option>
                </select>
                <input type="text" name="paperCode" value={form.paperCode} onChange={handleChange} maxLength="4" placeholder="7482" className={`flex-1 p-3 border rounded-r-lg outline-none focus:ring-2 focus:ring-gray-500 ${!isPaperCodeValid && form.paperCode ? 'border-red-500' : 'border-gray-300'}`} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject Name</label>
              <input type="text" name="subjectName" value={form.subjectName} onChange={handleChange} placeholder="Enter Subject Name" className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-gray-400" />
            </div>

            {/* CUSTOM DROPDOWN WITH CHECKBOXES */}
            <div className="relative" ref={dropdownRef}>
              <label className="block text-sm font-medium text-gray-700 mb-1">Branches (Select Multiple)</label>
              <div 
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full p-3 border rounded-lg bg-white flex justify-between items-center cursor-pointer shadow-sm ${existingBranches.length > 0 ? 'border-red-500 ring-1 ring-red-200' : 'border-gray-300'}`}
              >
                <span className="text-gray-600 truncate">
                  {form.branches.length > 0 ? form.branches.join(", ") : "Select Branches"}
                </span>
                <svg className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>

              {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto p-2">
                  {Object.entries(branchesMap).map(([short, full]) => {
                    const isDuplicate = existingBranches.includes(short);
                    return (
                      <label key={short} className={`flex items-start gap-3 p-2.5 rounded-md cursor-pointer transition-all ${isDuplicate ? "bg-red-50 border border-red-200 mb-1" : "hover:bg-gray-50"}`}>
                        <input
                          type="checkbox"
                          name="branchCheckbox"
                          value={short}
                          checked={form.branches.includes(short)}
                          onChange={handleChange}
                          className="mt-1 w-4 h-4 accent-gray-700"
                        />
                        <div className="flex flex-col leading-tight">
                          <span className={`text-sm font-bold ${isDuplicate ? "text-red-700" : "text-gray-800"}`}>{short}</span>
                          <span className="text-[11px] text-gray-500">{full}</span>
                          {isDuplicate && <span className="text-[10px] text-red-600 font-bold mt-1 uppercase">Duplicate! Uncheck this.</span>}
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 font-bold text-center">Type</label>
              <div className="flex gap-6 justify-center bg-gray-50 p-2 rounded-lg border border-dashed border-gray-300">
                {["Regular", "Ex"].map(type => (
                  <label key={type} className="flex items-center cursor-pointer group">
                    <input type="radio" name="type" value={type} checked={form.type === type} onChange={handleChange} className="mr-2 w-4 h-4 accent-gray-700" />
                    <span className="text-gray-700 font-medium">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Upload PDF</label>
              <input type="file" name="pdfFile" accept="application/pdf" onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-gray-700 file:text-white file:font-bold" />
            </div>

            <div className={`flex items-center gap-3 p-4 rounded-lg border transition-all ${isVerified ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"}`}>
              {verifyLoading ? (
                <svg className="animate-spin h-5 w-5 text-gray-600" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              ) : (
                <input type="checkbox" checked={isVerified} onChange={checkDuplicate} disabled={isVerified || !allFieldsFilled || isRequesting} className="w-5 h-5 accent-green-600 cursor-pointer" />
              )}
              <span className={`text-sm font-bold ${isVerified ? "text-green-600" : "text-gray-700"}`}>
                {verifyLoading ? "Checking database..." : isVerified ? "Verification Complete ✓" : "Verify details before upload"}
              </span>
            </div>

            <button
              type="submit"
              disabled={loading || disableSubmit || existingBranches.length > 0}
              className={`w-full p-4 rounded-lg text-white font-bold text-lg transition-all flex items-center justify-center gap-3 ${loading || disableSubmit || existingBranches.length > 0 ? "bg-gray-400" : "bg-gray-700 hover:bg-gray-800 active:scale-[0.98] shadow-lg"}`}
            >
              {loading && <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
              {loading ? "Submitting..." : "Submit Paper"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}