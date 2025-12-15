import { FaGithub, FaLinkedin, FaYoutube, FaEnvelope, FaWhatsapp } from "react-icons/fa";
import { Link } from "react-router-dom";


export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-gray-900 via-gray-800 to-black text-gray-300 pt-12 pb-6 px-6 md:px-20 mt-10 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05),transparent_70%)] pointer-events-none"></div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-10 relative z-10">
        <div>
          <h2 className="text-white text-xl font-semibold mb-4 border-l-4 border-blue-500 pl-3">About</h2>
          <p className="text-sm leading-6">
            Hello I’m <span className="text-blue-400 font-medium">MPQP</span>, Access all old and new diploma papers of RGPV, MP Polytechnic. Only question papers available here.
            <span className="text-pink-400">2023-24-25</span> edition papers will be available soon.
          </p>
        </div>

        <div>
          <h2 className="text-white text-xl font-semibold mb-4 border-l-4 border-pink-500 pl-3">
            Quick Links
          </h2>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/" className="hover:text-blue-400 transition">
                Home
              </Link>
            </li>
            <li>
              <Link to="/Paper Upload" className="hover:text-blue-400 transition">
                Paper Upload
              </Link>
            </li>
          </ul>
        </div>


        <div>
          <h2 className="text-white text-xl font-semibold mb-4 border-l-4 border-green-500 pl-3">Contact Info</h2>
          <ul className="space-y-2 text-sm">
            <li> Madhya Pradesh, India</li>
            <li><a href="mailto:mpqp073@gmail.com" className="hover:text-green-400">mpqp073@gmail.com</a></li>
            <li><a href="https://wa.me/919303546247" className="hover:text-green-400">+91 9303546247</a></li>
          </ul>
        </div>

        <div>
          <h2 className="text-white text-xl font-semibold mb-4 border-l-4 border-yellow-500 pl-3">Follow Me</h2>
          <div className="flex space-x-4 text-2xl">
            <a href="https://github.com/Code-with-N-A" target="_blank" rel="noreferrer" className="hover:text-white transition transform hover:scale-125"><FaGithub /></a>
            <a href="https://www.linkedin.com/in/nitesh-amule-60223b34b/" target="_blank" rel="noreferrer" className="hover:text-blue-400 transition transform hover:scale-125"><FaLinkedin /></a>
            <a href="https://www.youtube.com/@AmuleStack74" target="_blank" rel="noreferrer" className="hover:text-red-500 transition transform hover:scale-125"><FaYoutube /></a>
            <a href="mailto:mpqp073@gmail.com" className="hover:text-yellow-400 transition transform hover:scale-125"><FaEnvelope /></a>
            <a
              href="https://wa.me/919303546247"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-green-400 transition transform hover:scale-125"
            >
              <FaWhatsapp />
            </a>          </div>
        </div>
      </div>

      <div className="my-8 border-t border-gray-700"></div>

      <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
        <p>© {new Date().getFullYear()} <span className="text-blue-400 font-medium">MPQP</span>. All rights reserved.</p>
        <p>Designed & Built with  using React & Tailwind CSS</p>
      </div>

      {/*  Floating Animation */}
      <style>{`
        footer {
          animation: fadeInUp 1s ease-in-out;
        }
        @keyframes fadeInUp {
          from {opacity: 0; transform: translateY(20px);}
          to {opacity: 1; transform: translateY(0);}
        }
      `}</style>
    </footer>
  );
}
