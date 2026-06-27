import { motion } from "framer-motion";
import Typed from "typed.js";
import { useEffect, useRef } from "react";

import profile from "./assets/profile.jpg";
import resume from "./assets/resume.pdf";

import {
  FaGithub,
  FaLinkedin,
  FaDownload,
} from "react-icons/fa";

export default function Hero() {

  const typedRef = useRef(null);

  useEffect(() => {

    const typed = new Typed(typedRef.current,{

      strings:[
        "Full Stack Developer",
        "Java Developer",
        "Software Engineer",
        "React Developer"
      ],

      typeSpeed:70,
      backSpeed:40,
      loop:true

    });

    return ()=>typed.destroy();

  },[]);

  return(

<section
id="home"
className="relative min-h-screen pt-24 pb-16 flex items-center overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.28),_transparent_35%),linear-gradient(135deg,_#020617_0%,_#07111f_45%,_#020617_100%)]"
>

<div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_rgba(34,211,238,0.16),_transparent_24%)]" />
<div className="absolute top-20 left-10 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl" />
<div className="absolute bottom-10 right-10 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />

<div className="relative max-w-7xl mx-auto grid md:grid-cols-[1.1fr_0.9fr] items-center gap-20 px-6 lg:px-10">

<motion.div
className="rounded-[2rem] border border-blue-500/20 bg-slate-950/80 p-8 md:p-10 shadow-[0_20px_90px_rgba(2,6,23,0.55)] backdrop-blur-xl"
initial={{ opacity: 0, x: -80 }}
animate={{ opacity: 1, x: 0 }}
transition={{ duration: 0.8 }}
>

<p className="text-blue-400 text-lg font-semibold uppercase tracking-[0.3em]">
Hello 👋 I'm
</p>

<h1 className="text-5xl md:text-6xl font-bold mt-3 leading-tight text-white">
Sushmitha R
</h1>

<h2 className="text-2xl md:text-3xl mt-6 text-cyan-400 font-medium">
<span ref={typedRef}></span>
</h2>

<p className="text-slate-300 mt-8 leading-8 max-w-2xl text-lg">
Passionate Computer Science Engineering student with hands-on experience building scalable web applications using Java, React, Python, Node.js, and cloud technologies.
</p>

<div className="flex flex-wrap gap-5 mt-10">

<a
href={resume}
download
className="bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-3 rounded-xl font-semibold shadow-lg shadow-blue-500/20 hover:scale-[1.02] transition-all duration-300 flex items-center gap-2"
>

<FaDownload/>

Resume

</a>

<a
href="https://github.com/Sushmitha232"
target="_blank"
rel="noreferrer"
className="rounded-full border border-slate-700 bg-slate-900/70 p-3 text-slate-200 hover:border-blue-400 hover:text-blue-400 transition"
>
<FaGithub size={24} />
</a>

<a
href="https://linkedin.com/in/sushmitha-r-30a275297"
target="_blank"
rel="noreferrer"
className="rounded-full border border-slate-700 bg-slate-900/70 p-3 text-slate-200 hover:border-blue-400 hover:text-blue-400 transition"
>
<FaLinkedin size={24} />
</a>

</div>

</motion.div>

<motion.div
className="flex justify-center md:justify-end"
initial={{ opacity: 0, x: 80 }}
animate={{ opacity: 1, x: 0 }}
transition={{ duration: 0.8 }}
>

<img
src={profile}
alt="profile"
className="max-w-[420px] w-full h-auto rounded-[2rem] object-cover border-4 border-blue-400/80 shadow-[0_0_90px_rgba(59,130,246,.42)]"
/>

</motion.div>

</div>

</section>

  )

}