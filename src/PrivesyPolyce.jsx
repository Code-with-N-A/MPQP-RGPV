import React from "react";
import { useEffect } from "react";

export default function PrivacyPolicyPortal() {

  // --- SEO & Title Logic Googel Sarche ---
  useEffect(() => {
    document.title = "Privacy Policy | MPQP Digital Repository";
    let metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", "Official privacy protocol for MPQP. Learn how we protect your academic data and ensure secure document repository access.");
    }
  }, []);
  // -------------------------

  // Current Date for Professional Look
  const publishDate = "January 03, 2026";

  return (
    <div className="mpqp-policy-main bg-[#f4f7f9] min-h-screen px-4 sm:px-6 lg:px-8">
      {/* Responsive Margin Top: 
          - mt-20 on mobile (to give enough gap for fixed headers)
          - mt-10 on PC (for a subtle formal gap)
      */}
      <div className="max-w-5xl mx-auto bg-white shadow-sm border border-gray-200 overflow-hidden mt-20 md:mt-10 mb-20">
        
        {/* Official Header Section - Government Blue Theme */}
        <div className="bg-[#003366] p-6 sm:p-10 border-b-4 border-[#c5a059]">
          <h1 className="text-white text-3xl sm:text-5xl font-black uppercase tracking-tighter">
            Privacy Policy
          </h1>
          <p className="text-blue-100 text-xs sm:text-sm mt-2 font-bold uppercase tracking-[0.2em]">
            MPQP Digital Repository - Official Privacy Protocol
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
            <span className="bg-white/10 text-white text-[10px] px-3 py-1 font-bold">DOCUMENT REF: MPQP-PL-2026</span>
            <span className="bg-white/10 text-white text-[10px] px-3 py-1 font-bold uppercase">Effective: {publishDate}</span>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6 sm:p-12 lg:p-16">
          
          <div className="space-y-12 text-gray-800">
            
            {/* Clause 1: Consent */}
            <section className="relative">
              <h2 className="text-[#003366] text-xl font-black uppercase tracking-tight mb-4 border-l-4 border-[#003366] pl-4">
                01. General Consent
              </h2>
              <p className="text-sm sm:text-base leading-relaxed text-justify">
                By accessing the <b>MPQP Digital Repository</b>, you acknowledge that you have read and understood this Privacy Policy. You hereby consent to the collection and processing of your information as described herein for academic and authentication purposes.
              </p>
            </section>

            {/* Clause 2: Data Collection Categories */}
            <section className="relative">
              <h2 className="text-[#003366] text-xl font-black uppercase tracking-tight mb-4 border-l-4 border-[#003366] pl-4">
                02. Information Taxonomy
              </h2>
              <p className="text-sm sm:text-base mb-6">
                Our repository collects specific data points to maintain the integrity of academic records:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-gray-200 p-5 bg-gray-50/50">
                  <h4 className="font-black text-[#003366] text-xs uppercase mb-3 tracking-widest">Authentication Data</h4>
                  <ul className="text-[13px] space-y-2 font-medium">
                    <li className="flex items-center gap-2">▪ Primary Email Address</li>
                    <li className="flex items-center gap-2">▪ Verified Display Name</li>
                    <li className="flex items-center gap-2">▪ Account Profile Reference</li>
                  </ul>
                </div>
                <div className="border border-gray-200 p-5 bg-gray-50/50">
                  <h4 className="font-black text-[#003366] text-xs uppercase mb-3 tracking-widest">Academic Metadata</h4>
                  <ul className="text-[13px] space-y-2 font-medium">
                    <li className="flex items-center gap-2">▪ Branch & Department Info</li>
                    <li className="flex items-center gap-2">▪ Semester & Scheme Details</li>
                    <li className="flex items-center gap-2">▪ Examination Year Reference</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Clause 3: Email Usage & Security */}
            <section className="bg-blue-50/80 p-6 sm:p-8 border-l-8 border-[#003366]">
              <h2 className="text-[#003366] text-xl font-black uppercase tracking-tight mb-4 flex items-center gap-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                03. Email Privacy & Communication
              </h2>
              <p className="text-sm sm:text-base font-bold text-[#003366] mb-4">
                We maintain a strict zero-compromise policy regarding your contact information:
              </p>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="mt-1 flex-shrink-0 w-5 h-5 bg-[#003366] text-white flex items-center justify-center text-[10px] font-bold">A</div>
                  <p className="text-sm sm:text-base leading-relaxed">
                    <b>Latest Academic Updates:</b> Your email is used exclusively to send notifications regarding newly uploaded question papers, syllabus changes, and critical MPQP portal updates to keep you informed.
                  </p>
                </div>
                <div className="flex gap-4">
                  <div className="mt-1 flex-shrink-0 w-5 h-5 bg-[#003366] text-white flex items-center justify-center text-[10px] font-bold">B</div>
                  <p className="text-sm sm:text-base leading-relaxed">
                    <b>No Third-Party Disclosure:</b> We guarantee that your email address will never be sold, leased, or shared with marketing agencies or any external third parties for commercial use.
                  </p>
                </div>
              </div>
            </section>

            {/* Clause 4: Data Security Infrastructure */}
            <section className="relative">
              <h2 className="text-[#003366] text-xl font-black uppercase tracking-tight mb-4 border-l-4 border-[#003366] pl-4">
                04. Technical Safeguards
              </h2>
              <p className="text-sm sm:text-base leading-relaxed text-justify">
                All data collected by MPQP is stored in encrypted environments. We employ industry-standard technical measures (including AES-256 protocols) to prevent unauthorized access, maintain data accuracy, and ensure the appropriate use of information. Your identity is strictly shielded behind our secure firewall infrastructure.
              </p>
            </section>

            {/* Clause 5: Repository Integrity */}
            <section className="relative">
              <h2 className="text-[#003366] text-xl font-black uppercase tracking-tight mb-4 border-l-4 border-[#003366] pl-4">
                05. Document Submission
              </h2>
              <p className="text-sm sm:text-base leading-relaxed">
                Information provided during the paper upload process is used to categorize the repository for the student community. While the academic document becomes public, the personal email of the contributor remains private and is only used for internal verification and system logs.
              </p>
            </section>

            {/* Official Certification Footer */}
            <div className="pt-10 flex flex-col items-center">
              <div className="w-full h-px bg-gray-100 mb-10"></div>
              <div className="border-[3px] border-[#003366] px-10 py-5 text-center max-w-sm rotate-1 bg-white shadow-md">
                <p className="text-[#003366] font-black text-2xl tracking-tighter uppercase leading-none">MPQP SECURE</p>
                <p className="text-[9px] text-gray-400 font-bold tracking-[0.3em] mt-2 uppercase">Verified Digital Infrastructure</p>
              </div>
              <p className="mt-12 text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] text-center">
                For Legal Inquiries: mpqp073@gmail.com
              </p>
            </div>

          </div>
        </div>
      </div>

      <style>{`
        /* Global Design System - Strictly Sharp Corners */
        .mpqp-policy-main * {
          border-radius: 0 !important;
          box-sizing: border-box;
        }

        .mpqp-policy-main {
          font-family: 'Inter', -apple-system, system-ui, sans-serif;
          scroll-behavior: smooth;
        }

        /* Mobile Optimization for Handheld Devices */
        @media (max-width: 640px) {
          .mpqp-policy-main {
            padding-bottom: 2rem;
            background: #ffffff;
          }
          /* Larger margin on mobile for header clearance */
          .mt-20 {
            margin-top: 5rem !important; 
          }
          .max-w-5xl {
            border: none;
            box-shadow: none;
          }
          .p-6, .p-12 {
            padding: 1rem;
          }
          h1 {
            font-size: 2.2rem;
            line-height: 1.1;
          }
        }

        /* Custom Scrollbar for Official Look */
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #f8fafc; }
        ::-webkit-scrollbar-thumb { background: #003366; }
      `}</style>
    </div>
  );
}