import React, { useState } from "react";
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
    branch: "",
  });

  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [loading, setLoading] = useState(false);
  const [disableSubmit, setDisableSubmit] = useState(true);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);

  const branches = [
    "CSE", "CE", "ME", "EE", "EC", "CH", "PE", "IC", "CTM", "IT", "MS", "OE", "MOM", "BCC"
  ];

  const isPaperCodeValid = /^[0-9]{4}$/.test(form.paperCode.trim());

  const getFullPaperCode = () => {
    if (!form.paperPrefix || !form.paperCode) return "";
    return `${form.paperPrefix}-${form.paperCode.trim()}`;
  };

  const allFieldsFilled = form.year && form.semester && form.paperPrefix && isPaperCodeValid && form.subjectName.trim() && form.branch && form.type && form.pdfFile;

  const handleChange = (e) => {
    const { name, value, files } = e.target;

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
      setIsVerified(false);
      setDisableSubmit(true);
      return;
    }

    setForm({ ...form, [name]: value });
    setIsVerified(false);
    setDisableSubmit(true);
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
    if (!allFieldsFilled || isRequesting) return false;

    setIsRequesting(true);
    setVerifyLoading(true);
    try {
      const params = new URLSearchParams({
        action: "check",
        year: form.year,
        semester: form.semester,
        paperCode: getFullPaperCode(),
        type: form.type,
        branch: form.branch,
      });

      const res = await fetch(`${API_URL}?${params.toString()}`);
      const data = await res.json();

      setVerifyLoading(false);
      setIsRequesting(false);

      if (data.status === "success" && data.exists) {
        showToast("Paper already exists in records!", "error");
        setIsVerified(false);
        setDisableSubmit(true);
        return true;
      } else {
        showToast("No duplicates found. Ready!", "success");
        setIsVerified(true);
        setDisableSubmit(false);
        return false;
      }
    } catch (err) {
      showToast("Verification failed!", "error");
      setVerifyLoading(false);
      setIsVerified(false);
      setDisableSubmit(true);
      setIsRequesting(false);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isVerified || isRequesting) {
      showToast("Verification required!", "error");
      return;
    }

    setIsRequesting(true);
    setLoading(true);

    try {
      const base64PDF = await fileToBase64(form.pdfFile);
      const safeSubject = form.subjectName.trim().replace(/\s+/g, "_");

      const customFileName = `${getFullPaperCode()}_${safeSubject}_${form.type}.pdf`;

      const payload = {
        id: genID(),
        year: form.year,
        semester: form.semester,
        paperCode: getFullPaperCode(),
        subjectName: form.subjectName,
        type: form.type,
        status: form.status,
        branch: form.branch,
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
        showToast("Paper uploaded successfully!", "success");
        setForm({
          year: "",
          semester: "",
          paperPrefix: "",
          paperCode: "",
          subjectName: "",
          type: "",
          status: "Disabled",
          pdfFile: null,
          branch: "",
        });
        setIsVerified(false);
        setDisableSubmit(true);
      } else {
        showToast("Upload failed: " + (addData.message || "Error"), "error");
      }
    } catch (err) {
      showToast("Server Error!", "error");
    }

    setLoading(false);
    setIsRequesting(false);
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4 mt-15">
        <style>
          {`
  @keyframes progress { from { width: 100%; } to { width: 0%; } } 
  @keyframes slideDown { 
    from { transform: translateY(-100%); opacity: 0; } 
    to { transform: translateY(0); opacity: 1; } 
  }
  .animate-slideDown { animation: slideDown 0.4s ease-out forwards; }
`}
        </style>

        {toast.show && (
          <div className="fixed top-18 left-1/2 -translate-x-1/2 z-[500] w-[85%] max-w-[450px] animate-slideDown">
            <div className={`${toast.type === "success" ? "bg-emerald-600 shadow-emerald-500/20" : "bg-rose-600 shadow-rose-500/20"} p-3 sm:p-4 rounded-xl shadow-2xl flex items-center justify-center gap-3 text-white border border-white/10`}>
              {toast.type === "success" ? (
                <svg className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              <p className="font-bold tracking-wide text-xs sm:text-sm md:text-base text-center leading-tight">
                {toast.message}
              </p>
            </div>
            <div className="w-full h-1 bg-black/20 rounded-b-xl overflow-hidden mt-[-4px]">
              <div className="h-full bg-white/50" style={{ animation: 'progress 4s linear forwards' }}></div>
            </div>
          </div>
        )}


        <div className="max-w-[600px] w-full bg-white shadow-2xl border border-gray-200 overflow-hidden rounded-xl">
          <div className="bg-gradient-to-r from-gray-600 to-gray-700 p-4 text-center">
            <h1 className="text-2xl font-bold text-white uppercase tracking-wider">MPQP Admin</h1>
            <p className="text-gray-200 text-sm mt-1">Academic Paper Management System</p>
          </div>

          <div className="p-4">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                  <select name="year" value={form.year} onChange={handleChange} disabled={loading || isRequesting} className="w-full p-3 border border-gray-300 rounded-lg bg-white shadow-sm outline-none focus:ring-2 focus:ring-gray-400">
                    <option value="">Select Year</option>
                    <option>2023</option><option>2024</option><option>2025</option><option>2026</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                  <select name="semester" value={form.semester} onChange={handleChange} disabled={loading || isRequesting} className="w-full p-3 border border-gray-300 rounded-lg bg-white shadow-sm outline-none focus:ring-2 focus:ring-gray-400">
                    <option value="">Select Semester</option>
                    {[1, 2, 3, 4, 5, 6].map(num => <option key={num}>{num}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Paper Code</label>
                <div className="flex">
                  <select
                    name="paperPrefix"
                    value={form.paperPrefix}
                    onChange={handleChange}
                    disabled={loading || isRequesting}
                    className="p-3 border border-r-0 border-gray-300 rounded-l-lg bg-gray-50 font-bold text-gray-700 focus:outline-none"
                  >
                    <option value="">-</option>
                    <option value="S">S</option>
                    <option value="W">W</option>
                    <option value="F">F</option>
                  </select>
                  <input
                    type="text"
                    name="paperCode"
                    value={form.paperCode}
                    onChange={handleChange}
                    maxLength="4"
                    placeholder="7482"
                    disabled={loading || isRequesting}
                    className={`flex-1 p-3 border rounded-r-lg focus:ring-2 focus:ring-gray-500 shadow-sm disabled:opacity-50 ${!isPaperCodeValid && form.paperCode.trim() ? 'border-red-500' : 'border-gray-300'}`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject Name</label>
                <input type="text" name="subjectName" value={form.subjectName} onChange={handleChange} placeholder="Enter Subject Name" disabled={loading || isRequesting} className="w-full p-3 border border-gray-300 rounded-lg shadow-sm outline-none focus:ring-2 focus:ring-gray-400" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
                <select name="branch" value={form.branch} onChange={handleChange} disabled={loading || isRequesting} className="w-full p-3 border border-gray-300 rounded-lg bg-white shadow-sm outline-none focus:ring-2 focus:ring-gray-400">
                  <option value="">Select Branch</option>
                  {branches.map((b) => (<option key={b} value={b}>{b}</option>))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-bold">Type</label>
                <div className="flex gap-6 justify-center bg-gray-50 p-2 rounded-lg border border-dashed border-gray-300">
                  <label className="flex items-center cursor-pointer group">
                    <input type="radio" name="type" value="Regular" checked={form.type === "Regular"} onChange={handleChange} disabled={loading || isRequesting} className="mr-2 w-4 h-4 accent-gray-700" />
                    <span className="text-gray-700 font-medium group-hover:text-gray-900">Regular</span>
                  </label>
                  <label className="flex items-center cursor-pointer group">
                    <input type="radio" name="type" value="Ex" checked={form.type === "Ex"} onChange={handleChange} disabled={loading || isRequesting} className="mr-2 w-4 h-4 accent-gray-700" />
                    <span className="text-gray-700 font-medium group-hover:text-gray-900">Ex</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Upload PDF</label>
                <input type="file" name="pdfFile" accept="application/pdf" onChange={handleChange} disabled={loading || isRequesting} className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-gray-700 file:text-white file:font-bold hover:file:bg-gray-800" />
              </div>

              <div className={`flex items-center gap-3 p-4 rounded-lg border transition-all ${isVerified ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"}`}>
                <div className="relative flex items-center justify-center w-6 h-6">
                  {verifyLoading ? (
                    <svg className="animate-spin h-5 w-5 text-gray-600" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  ) : (
                    <input type="checkbox" checked={isVerified} onChange={checkDuplicate} disabled={isVerified || !allFieldsFilled || isRequesting || loading} className="w-5 h-5 accent-green-600 cursor-pointer disabled:opacity-50" />
                  )}
                </div>
                <span className={`text-sm font-bold ${isVerified ? "text-green-600" : "text-gray-700"}`}>
                  {verifyLoading ? "Checking database..." : isVerified ? "Verification Complete ✓" : "Verify details before upload"}
                </span>
              </div>

              <button
                type="submit"
                disabled={loading || disableSubmit || isRequesting}
                className={`w-full p-4 rounded-lg text-white font-bold text-lg transition-all flex items-center justify-center gap-3 ${loading || disableSubmit || isRequesting ? "bg-gray-400 cursor-not-allowed" : "bg-gray-700 hover:bg-gray-800 active:scale-[0.98] shadow-lg"}`}
              >
                {loading && (
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                )}
                {loading ? "Submitting..." : "Submit Paper"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}