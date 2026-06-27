import { motion } from "framer-motion";
import {
  FaBriefcase,
  FaCloud,
  FaCode,
  FaDatabase,
  FaEnvelope,
  FaGithub,
  FaLinkedin,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaProjectDiagram,
  FaRocket,
  FaUserGraduate,
  FaAward,
} from "react-icons/fa";
import Navbar from "./Navbar";
import Hero from "./Hero";

const skills = [
  {
    title: "Languages",
    items: ["Java", "Python", "JavaScript", "HTML5", "CSS3"],
    icon: <FaCode />,
  },
  {
    title: "Web & Backend",
    items: ["React.js", "Node.js", "REST APIs", "Full Stack Development"],
    icon: <FaRocket />,
  },
  {
    title: "Data & Cloud",
    items: ["SQL", "DBMS", "Cloud Computing", "AWS Basics"],
    icon: <FaCloud />,
  },
  {
    title: "Tools & Practices",
    items: ["Git & GitHub", "Debugging", "Testing", "VS Code"],
    icon: <FaDatabase />,
  },
];

const projects = [
  {
    title: "Voting Management System",
    description:
      "Built a secure web application with authentication, workflow handling, and real-time processing for transparent voting operations.",
  },
  {
    title: "AI Chatbot for Classroom Monitoring",
    description:
      "Designed an AI-driven assistant that automates classroom monitoring tasks and improves daily operational efficiency.",
  },
  {
    title: "Decentralized Voting Platform",
    description:
      "Created a blockchain-based voting solution focused on transparency, security, and accountability.",
  },
  {
    title: "Heart Disease Prediction",
    description:
      "Developed a machine learning model using healthcare datasets to analyze risk factors and improve predictions.",
  },
];

const experience = [
  {
    title: "Full Stack Development Intern",
    company: "Recent Tech Solutions, Bengaluru",
    period: "Feb 2026 – May 2026",
    points: [
      "Contributed to responsive web applications using modern frontend and backend technologies.",
      "Supported feature implementation, debugging, testing, and workflow maintenance in a collaborative team environment.",
    ],
  },
];

const certifications = [
  {
    title: "Explore Machine Learning Using Python",
    issuer: "Infosys",
  },
  {
    title: "AWS Cloud Practitioner",
    issuer: "AWS",
  },
  {
    title: "Introduction to Cloud Computing",
    issuer: "IBM (Coursera)",
  },
  {
    title: "Introduction to Networking and Cloud Computing",
    issuer: "Microsoft (Coursera)",
  },
];

function App() {
  return (
    <div className="bg-slate-950 text-slate-100">
      <Navbar />
      <Hero />

      <main>
        <section id="about" className="py-24">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6 }}
              className="grid lg:grid-cols-[1.2fr_0.8fr] gap-10"
            >
              <div>
                <p className="text-blue-400 font-semibold uppercase tracking-[0.3em] text-sm">
                  About Me
                </p>
                <h2 className="text-3xl md:text-4xl font-bold mt-3">
                  Building reliable web experiences with a strong foundation in software engineering.
                </h2>
                <p className="text-slate-400 mt-6 leading-8">
                  I am a motivated Computer Science Engineering student with a solid grasp of web development, problem-solving, and collaborative software delivery. My background includes full-stack development work, academic projects in AI and blockchain, and hands-on experience with Java, Python, React, Node.js, and cloud technologies.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800/80 bg-slate-900/70 p-8 shadow-[0_20px_60px_rgba(2,6,23,0.35)] backdrop-blur-xl">
                <h3 className="text-xl font-semibold">Quick Highlights</h3>
                <ul className="mt-6 space-y-4 text-slate-300">
                  <li className="flex items-start gap-3">
                    <FaUserGraduate className="mt-1 text-blue-400" />
                    <span>B.E. Computer Science & Engineering, CGPA 9.0</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <FaBriefcase className="mt-1 text-blue-400" />
                    <span>Intern experience in full-stack web development</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <FaProjectDiagram className="mt-1 text-blue-400" />
                    <span>Projects spanning AI, blockchain, and secure systems</span>
                  </li>
                </ul>
              </div>
            </motion.div>
          </div>
        </section>

        <section id="skills" className="py-24 bg-slate-900/60">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-blue-400 font-semibold uppercase tracking-[0.3em] text-sm">
                Skills
              </p>
              <h2 className="text-3xl md:text-4xl font-bold mt-3">
                Technologies I work with
              </h2>
              <div className="mt-12 grid md:grid-cols-2 xl:grid-cols-4 gap-6">
                {skills.map((skill) => (
                  <div key={skill.title} className="rounded-2xl border border-slate-800/80 bg-slate-950/70 p-6 shadow-[0_10px_40px_rgba(2,6,23,0.25)] backdrop-blur">
                    <div className="text-blue-400 text-2xl">{skill.icon}</div>
                    <h3 className="text-xl font-semibold mt-4">{skill.title}</h3>
                    <ul className="mt-4 space-y-2 text-slate-400">
                      {skill.items.map((item) => (
                        <li key={item}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        <section id="projects" className="py-24">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-blue-400 font-semibold uppercase tracking-[0.3em] text-sm">
                Projects
              </p>
              <h2 className="text-3xl md:text-4xl font-bold mt-3">
                Selected work that reflects my skills
              </h2>
              <div className="mt-12 grid md:grid-cols-2 gap-6">
                {projects.map((project) => (
                  <div key={project.title} className="rounded-2xl border border-slate-800/80 bg-slate-900/70 p-7 hover:border-blue-500/60 hover:-translate-y-1 transition-all duration-300 shadow-[0_10px_35px_rgba(2,6,23,0.25)] backdrop-blur">
                    <h3 className="text-xl font-semibold">{project.title}</h3>
                    <p className="text-slate-400 mt-3 leading-7">{project.description}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        <section id="experience" className="py-24 bg-slate-900/60">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-blue-400 font-semibold uppercase tracking-[0.3em] text-sm">
                Experience & Education
              </p>
              <h2 className="text-3xl md:text-4xl font-bold mt-3">
                Professional growth and academic excellence
              </h2>

              <div className="mt-12 grid lg:grid-cols-[1fr_0.9fr] gap-8">
                <div className="rounded-2xl border border-slate-800/80 bg-slate-950/70 p-8 shadow-[0_10px_35px_rgba(2,6,23,0.25)] backdrop-blur">
                  <h3 className="text-xl font-semibold">Internship</h3>
                  {experience.map((item) => (
                    <div key={item.title} className="mt-6">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <h4 className="text-lg font-semibold">{item.title}</h4>
                        <span className="text-sm text-blue-400">{item.period}</span>
                      </div>
                      <p className="text-slate-400 mt-2">{item.company}</p>
                      <ul className="mt-4 space-y-2 text-slate-300">
                        {item.points.map((point) => (
                          <li key={point} className="flex gap-2">
                            <span className="text-blue-400">•</span>
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                <div className="rounded-2xl border border-slate-800/80 bg-slate-950/70 p-8 shadow-[0_10px_35px_rgba(2,6,23,0.25)] backdrop-blur">
                  <h3 className="text-xl font-semibold">Education</h3>
                  <div className="mt-6 space-y-5 text-slate-300">
                    <div>
                      <p className="font-semibold">B.E. Computer Science & Engineering</p>
                      <p className="text-slate-400 mt-1">Sri Venkateshwara College of Engineering, Bengaluru</p>
                      <p className="text-blue-400 mt-1">CGPA: 9.0</p>
                    </div>
                    <div>
                      <p className="font-semibold">PUC</p>
                      <p className="text-slate-400 mt-1">Vikram Independent PU College</p>
                      <p className="text-blue-400 mt-1">Score: 96%</p>
                    </div>
                    <div>
                      <p className="font-semibold">SSLC</p>
                      <p className="text-slate-400 mt-1">Vikram English Medium High School</p>
                      <p className="text-blue-400 mt-1">Score: 93%</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section id="certifications" className="py-24">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-blue-400 font-semibold uppercase tracking-[0.3em] text-sm">
                Certifications
              </p>
              <h2 className="text-3xl md:text-4xl font-bold mt-3">
                Recognized credentials and professional training
              </h2>
              <div className="mt-12 grid sm:grid-cols-2 gap-6">
                {certifications.map((cert) => (
                  <div key={cert.title} className="rounded-2xl border border-slate-800/80 bg-slate-900/70 p-7 hover:border-blue-500/60 hover:-translate-y-1 transition-all duration-300 shadow-[0_10px_35px_rgba(2,6,23,0.25)] backdrop-blur">
                    <div className="flex items-center gap-3 text-blue-400">
                      <FaAward />
                      <h3 className="text-xl font-semibold">{cert.title}</h3>
                    </div>
                    <p className="text-slate-400 mt-4">{cert.issuer}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        <section id="contact" className="py-24">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6 }}
              className="rounded-3xl border border-blue-500/30 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-8 lg:p-10 shadow-[0_20px_80px_rgba(2,6,23,0.45)] backdrop-blur-xl"
            >
              <p className="text-blue-400 font-semibold uppercase tracking-[0.3em] text-sm">
                Contact
              </p>
              <h2 className="text-3xl md:text-4xl font-bold mt-3">
                Let’s connect and build something meaningful.
              </h2>
              <div className="mt-10 grid md:grid-cols-2 gap-8">
                <div className="space-y-4 text-slate-300">
                  <p className="flex items-center gap-3"><FaEnvelope className="text-blue-400" /> sushmitha748313@gmail.com</p>
                  <p className="flex items-center gap-3"><FaPhoneAlt className="text-blue-400" /> +91-7483137255</p>
                  <p className="flex items-center gap-3"><FaMapMarkerAlt className="text-blue-400" /> Bengaluru, Karnataka</p>
                </div>
                <div className="flex gap-4">
                  <a href="https://github.com/Sushmitha232" target="_blank" rel="noreferrer" className="rounded-full border border-slate-700 p-4 hover:border-blue-500 transition">
                    <FaGithub size={24} />
                  </a>
                  <a href="https://linkedin.com/in/sushmitha-r-30a275297" target="_blank" rel="noreferrer" className="rounded-full border border-slate-700 p-4 hover:border-blue-500 transition">
                    <FaLinkedin size={24} />
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-800 py-6 text-center text-slate-500">
        © 2026 Sushmitha R. All rights reserved.
      </footer>
    </div>
  );
}

export default App;