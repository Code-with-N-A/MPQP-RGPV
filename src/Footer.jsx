import { FaLinkedin, FaYoutube, FaEnvelope, FaWhatsapp } from "react-icons/fa";
import { Link } from "react-router-dom";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#111827] text-gray-300 pt-12 pb-8 px-6 md:px-20 mt-16 relative border-t-4 border-[#003366]">
      {/* Subtle Texture for Official Feel */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 relative z-10">
        
        {/* Section 1: Official About */}
        <div className="space-y-5">
          <h2 className="text-white text-lg font-black uppercase tracking-tighter border-b-2 border-blue-600 pb-2 inline-block">
            About Portal
          </h2>
          <p className="text-[13px] leading-6 text-gray-400 font-medium">
            Hello, I’m <span className="text-blue-400 font-bold">MPQP</span>. 
            Official digital repository for <span className="text-white underline decoration-blue-900 underline-offset-4">RGPV & MP Polytechnic</span> diploma question papers. 
            Providing verified academic resources for students across Madhya Pradesh.
          </p>
          <div className="bg-[#1a2234] border-l-4 border-pink-600 p-3 shadow-inner">
            <p className="text-[11px] leading-5 text-pink-400 font-black uppercase tracking-wider">
              Note: 2023–26 edition papers are being updated.
            </p>
          </div>
        </div>

        {/* Section 2: Important Sitemap */}
        <div>
          <h2 className="text-white text-lg font-black uppercase tracking-tighter border-b-2 border-pink-600 pb-2 inline-block mb-6">
            Sitemap
          </h2>
          <ul className="space-y-3 text-[13px] font-bold uppercase tracking-tight">
            <li>
              <Link to="/" className="hover:text-blue-400 transition-colors flex items-center gap-3 group">
                <span className="h-[2px] w-4 bg-gray-700 group-hover:bg-blue-500 transition-all"></span> Home
              </Link>
            </li>
            <li>
              <Link to="/paper-upload" className="hover:text-blue-400 transition-colors flex items-center gap-3 group">
                <span className="h-[2px] w-4 bg-gray-700 group-hover:bg-blue-500 transition-all"></span> Paper Upload
              </Link>
            </li>
            <li>
              <Link to="/user-status" className="hover:text-blue-400 transition-colors flex items-center gap-3 group">
                <span className="h-[2px] w-4 bg-gray-700 group-hover:bg-blue-500 transition-all"></span> User Status
              </Link>
            </li>
            <li>
              <Link to="/PrivacyPolicy" className="hover:text-blue-400 transition-colors flex items-center gap-3 group">
                <span className="h-[2px] w-4 bg-gray-700 group-hover:bg-blue-500 transition-all"></span> Privacy Policy
              </Link>
            </li>
          </ul>
        </div>

        {/* Section 3: Official Correspondence */}
        <div>
          <h2 className="text-white text-lg font-black uppercase tracking-tighter border-b-2 border-green-600 pb-2 inline-block mb-6">
            Support
          </h2>
          <div className="space-y-4 text-[13px]">
            <div className="flex flex-col">
               <span className="text-[10px] text-gray-500 font-black uppercase mb-1">Current Jurisdiction</span>
               <span className="font-bold text-gray-300">Madhya Pradesh, India</span>
            </div>
            <div className="flex flex-col">
               <span className="text-[10px] text-gray-500 font-black uppercase mb-1">Official Email</span> 
               <a href="mailto:mpqp073@gmail.com" className="text-green-500 font-bold hover:text-green-400 break-words underline underline-offset-4">mpqp073@gmail.com</a>
            </div>
            <div className="flex flex-col">
               <span className="text-[10px] text-gray-500 font-black uppercase mb-1">Direct Helpline</span> 
               <a href="https://wa.me/919303546247" className="text-green-500 font-bold hover:text-green-400">+91 9303546247</a>
            </div>
          </div>
        </div>

        {/* Section 4: External Connect */}
        <div>
          <h2 className="text-white text-lg font-black uppercase tracking-tighter border-b-2 border-yellow-500 pb-2 inline-block mb-6">
            Connect
          </h2>
          <div className="flex flex-wrap gap-2 pt-1">
            <a href="https://www.linkedin.com/in/nitesh-amule-60223b34b/" target="_blank" rel="noreferrer" className="bg-[#1f2937] p-3 text-gray-400 hover:bg-[#0077b5] hover:text-white transition-all shadow-md border border-gray-700"><FaLinkedin size={20} /></a>
            <a href="https://www.youtube.com/@AmuleStack74" target="_blank" rel="noreferrer" className="bg-[#1f2937] p-3 text-gray-400 hover:bg-[#ff0000] hover:text-white transition-all shadow-md border border-gray-700"><FaYoutube size={20} /></a>
            <a href="mailto:mpqp073@gmail.com" className="bg-[#1f2937] p-3 text-gray-400 hover:bg-[#d44638] hover:text-white transition-all shadow-md border border-gray-700"><FaEnvelope size={20} /></a>
            <a href="https://wa.me/919303546247" target="_blank" rel="noopener noreferrer" className="bg-[#1f2937] p-3 text-gray-400 hover:bg-[#25d366] hover:text-white transition-all shadow-md border border-gray-700"><FaWhatsapp size={20} /></a>
          </div>
          <div className="mt-8 pt-5 border-t border-gray-800">
             <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Portal Administrator</p>
             <p className="text-sm font-black text-white tracking-tighter">NITESH AMULE</p>
          </div>
        </div>
      </div>

      {/* Official Bottom Bar */}
      <div className="mt-16 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 text-center md:text-left">
          © {currentYear} <span className="text-blue-500">MPQP Digital Repository</span>. All Content Rights Reserved.
        </div>
        
        <div className="flex items-center gap-4">
            <div className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-400 bg-[#1f2937] px-5 py-2.5 border border-gray-700 shadow-lg">
                Maintained by <span className="text-white">NITESH AMULE</span>
            </div>
        </div>
      </div>

      <style>{`
        /* 1. Global Reset to Strictly Sharp Corners (Govt Style) */
        .footer-official-mpqp * {
          border-radius: 0 !important;
        }

        /* 2. Responsive Text Tweak for Small Screens */
        @media (max-width: 640px) {
          footer {
            padding-left: 1.5rem;
            padding-right: 1.5rem;
            text-align: left;
          }
          h2 {
            display: block;
            width: 100%;
          }
          .mt-16 {
            margin-top: 2.5rem;
          }
        }

        /* 3. Subtle Entrance Animation */
        footer {
          animation: footerFadeIn 0.6s ease-out;
        }
        @keyframes footerFadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </footer>
  );
}