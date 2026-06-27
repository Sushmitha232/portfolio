import { useState } from "react";
import { FaBars, FaTimes } from "react-icons/fa";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const links = [
    "Home",
    "About",
    "Skills",
    "Projects",
    "Experience",
    "Certifications",
    "Contact",
  ];

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-5">
        <a href="#home" className="text-3xl font-bold text-blue-500">
          Sushmitha
        </a>

        <ul className="hidden md:flex gap-8 text-gray-300">
          {links.map((item) => (
            <li key={item}>
              <a
                href={`#${item.toLowerCase()}`}
                className="hover:text-blue-500 transition"
              >
                {item}
              </a>
            </li>
          ))}
        </ul>

        <button className="md:hidden" onClick={() => setOpen(!open)}>
          {open ? <FaTimes size={25} /> : <FaBars size={25} />}
        </button>
      </div>

      {open && (
        <div className="bg-slate-900 md:hidden flex flex-col">
          {links.map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              onClick={() => setOpen(false)}
              className="py-4 text-center border-b border-slate-800 hover:bg-slate-800"
            >
              {item}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
}