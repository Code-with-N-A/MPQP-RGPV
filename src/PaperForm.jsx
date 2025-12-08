import React, { useState } from "react";

export default function PaperForm() {
  const API_URL =
    "https://script.google.com/macros/s/AKfycbxOpOzjAQNEKfSfdpH6ifEExnuuyulNak_hAE1wMdJXfsJLiN2hQ8NWG8Ut8RwHxpon/exec";

  const [form, setForm] = useState({
    year: "",
    semester: "",
    paperCode: "",
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
  const [isRequesting, setIsRequesting] = useState(false); // To prevent concurrent requests

  const branches = ["CSE", "IT", "ECE", "EE", "ME", "CE", "AE"]

  // Enable verify checkbox only if all inputs filled
  const allFieldsFilled = form.year && form.semester && form.paperCode.trim() && form.subjectName.trim() && form.branch && form.type && form.pdfFile;

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "pdfFile") {
      const file = files[0];
      if (!file) return;

      if (file.type !== "application/pdf") {
        showToast("Only PDF files are allowed!", "error");
        setForm({ ...form, pdfFile: null });
        setIsVerified(false);
        setDisableSubmit(true);
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        showToast("PDF file size must not exceed 10MB!", "error");
        setForm({ ...form, pdfFile: null });
        setIsVerified(false);
        setDisableSubmit(true);
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
        paperCode: form.paperCode,
        type: form.type,
        branch: form.branch,
      });

      const res = await fetch(`${API_URL}?${params.toString()}`);
      const data = await res.json();

      setVerifyLoading(false);
      setIsRequesting(false);

      if (data.status === "success" && data.exists) {
        showToast("This paper already exists!", "error");
        setIsVerified(false);
        setDisableSubmit(true);
        return true;
      } else {
        setIsVerified(true);
        setDisableSubmit(false);
        return false;
      }
    } catch (err) {
      console.error("Duplicate check failed", err);
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
      showToast("Please verify the data before submitting!", "error");
      return;
    }

    setIsRequesting(true);
    setLoading(true);

    try {
      const base64PDF = await fileToBase64(form.pdfFile);

      const payload = {
        id: genID(),
        ...form,
        filename: form.pdfFile.name,
        pdfBase64: base64PDF,
      };

      const addRes = await fetch(API_URL, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const addData = await addRes.json();

      if (addData.status === "success") {
        showToast("Paper successfully added!", "success");
        setForm({
          year: "",
          semester: "",
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
        showToast("Error: " + (addData.message || "Unknown"), "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Server Error!", "error");
    }

    setLoading(false);
    setIsRequesting(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4 mt-15">
      <style>
        {`
          @keyframes progress {
            from { width: 100%; }
            to { width: 0%; }
          }
        `}
      </style>
      {/* Toast Notification - Centered at top with decreasing progress bar */}
      {toast.show && (
        <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 p-4 rounded-lg shadow-lg text-white font-semibold transition-all duration-300 ease-in-out ${
          toast.type === "success" ? "bg-green-500" : "bg-red-500"
        }`}>
          {toast.message}
          <div className="w-full bg-white bg-opacity-30 rounded-full h-1 mt-2">
            <div className="bg-white h-1 rounded-full" style={{ width: '100%', animation: 'progress 4s linear forwards' }}></div>
          </div>
        </div>
      )}

      <div className="max-w-[600px] w-full bg-white  shadow-2xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-600 to-gray-700 p-4 text-center">
          <h1 className="text-2xl font-bold text-white">Paper Upload Portal</h1>
          <p className="text-gray-200 mt-2">Securely upload and verify your academic papers</p>
        </div>

        {/* Form */}
        <div className="p-4">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Year and Semester in one row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                <select 
                  name="year" 
                  value={form.year} 
                  onChange={handleChange} 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm hover:shadow-md cursor-pointer"
                >
                  <option value="">Select Year</option>
                  <option>2023</option>
                  <option>2024</option>
                  <option>2025</option>
                  <option>2026</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                <select 
                  name="semester" 
                  value={form.semester} 
                  onChange={handleChange} 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm hover:shadow-md cursor-pointer"
                >
                  <option value="">Select Semester</option>
                  <option>1</option>
                  <option>2</option>
                  <option>3</option>
                  <option>4</option>
                  <option>5</option>
                  <option>6</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Paper Code</label>
              <input 
                type="text" 
                name="paperCode" 
                value={form.paperCode} 
                onChange={handleChange} 
                placeholder="Enter Paper Code" 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject Name</label>
              <input 
                type="text" 
                name="subjectName" 
                value={form.subjectName} 
                onChange={handleChange} 
                placeholder="Enter Subject Name" 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
              <select 
                name="branch" 
                value={form.branch} 
                onChange={handleChange} 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm hover:shadow-md cursor-pointer"
              >
                <option value="">Select Branch</option>
                {branches.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <div className="flex gap-6 justify-center">
                <label className="flex items-center cursor-pointer">
                  <input 
                    type="radio" 
                    name="type" 
                    value="Regular" 
                    checked={form.type === "Regular"} 
                    onChange={handleChange} 
                    className="mr-2 text-gray-600 focus:ring-gray-500 cursor-pointer" 
                  />
                  <span className="text-gray-700 font-medium">Regular</span>
                </label>

                <label className="flex items-center cursor-pointer">
                  <input 
                    type="radio" 
                    name="type" 
                    value="Ex" 
                    checked={form.type === "Ex"} 
                    onChange={handleChange} 
                    className="mr-2 text-gray-600 focus:ring-gray-500 cursor-pointer" 
                  />
                  <span className="text-gray-700 font-medium">Ex</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Upload PDF</label>
              <input 
                type="file" 
                name="pdfFile" 
                accept="application/pdf" 
                onChange={handleChange} 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200 bg-gray-50 shadow-sm hover:shadow-md file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100 cursor-pointer" 
              />
            </div>

            {/* Verification Checkbox with Loader and Icon - Always visible */}
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <input
                type="checkbox"
                checked={isVerified}
                onChange={checkDuplicate}
                disabled={verifyLoading || isVerified || !allFieldsFilled || isRequesting}
                className="w-5 h-5 text-gray-600 bg-gray-100 border-gray-300 rounded focus:ring-gray-500 disabled:opacity-50 cursor-pointer"
              />
              {isVerified && !verifyLoading && (
                <span className="text-green-600 text-lg">✓</span>
              )}
              <span className="text-gray-700 font-medium">
                {verifyLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                    Verifying...
                  </div>
                ) : isVerified ? (
                  "Verified Successfully"
                ) : (
                  "Check if paper already exists"
                )}
              </span>
            </div>

            <button 
              type="submit" 
              disabled={loading || disableSubmit || isRequesting} 
              className={`w-full p-4 rounded-lg text-white font-bold text-lg transition-all duration-200 transform ${
                loading || disableSubmit || isRequesting
                  ? "bg-gray-400 cursor-not-allowed" 
                  : "bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 hover:scale-105 shadow-lg hover:shadow-xl"
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Uploading...
                </div>
              ) : (
                "Submit"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
