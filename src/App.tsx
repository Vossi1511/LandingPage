import { motion } from "motion/react";
import { useState, useEffect } from "react";
import {
  Mail,
  Plane,
  Cpu,
  Flag,
  GraduationCap,
  CarFront,
  MessageCircle,
  Music,
} from "lucide-react";
import { TerminalText } from "./components/TerminalText";
import { FontCycler } from "./components/FontCycler";
import { Badge } from "./components/ui/badge";
import { Button } from "./components/ui/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "./components/ui/avatar";
import profileImage from "figma:asset/4bc64df884a940c39a286da197b1cf59a5684086.png";

const socialLinks = [
  {
    icon: Mail,
    label: "Email",
    href: "mailto:vossi@vossi.qzz.io",
    color:
      "hover:bg-red-500/20 hover:border-red-500/40 hover:text-red-300",
  },
  {
    icon: MessageCircle,
    label: "Discord",
    href: "https://discord.com/users/vossi1511",
    color:
      "hover:bg-indigo-500/20 hover:border-indigo-500/40 hover:text-indigo-300",
  },
];

const hobbies = [
  {
    icon: CarFront,
    label: "Sim Racing",
    color: "bg-red-500/20 text-red-300 border-red-500/40",
  },
  {
    icon: Plane,
    label: "Flight Simming",
    color: "bg-blue-500/20 text-blue-300 border-blue-500/40",
  },
  {
    icon: Cpu,
    label: "Tech",
    color:
      "bg-purple-500/20 text-purple-300 border-purple-500/40",
  },
  {
    icon: Flag,
    label: "F1",
    color:
      "bg-orange-500/20 text-orange-300 border-orange-500/40",
  },
  {
    icon: Music,
    label: "Techno",
    color:
      "bg-pink-500/20 text-pink-300 border-pink-500/40",
  },
];

const alternateNames = [
  "vossi1511",
  "vxssi",
  "vxssi_",
  "vxssi1511",
];

export default function App() {
  const [showNeofetch, setShowNeofetch] = useState(false);

  useEffect(() => {
    // Show neofetch output after command is typed (1500ms delay + 8 chars * 80ms + 200ms buffer)
    const timer = setTimeout(
      () => {
        setShowNeofetch(true);
      },
      1500 + 8 * 80 + 200,
    );
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden">
      {/* Animated background grid */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_110%)] opacity-30" />

      {/* Floating particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="fixed w-1 h-1 bg-blue-400/30 rounded-full"
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
          }}
          animate={{
            y: [null, Math.random() * window.innerHeight],
            x: [null, Math.random() * window.innerWidth],
          }}
          transition={{
            duration: Math.random() * 10 + 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        {/* Profile Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              duration: 0.5,
              delay: 0.6,
              type: "spring",
              stiffness: 200,
            }}
            className="relative inline-block mb-6"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full blur-xl opacity-50 animate-pulse" />
            <Avatar className="w-32 h-32 border-4 border-slate-800 relative">
              <AvatarImage src={profileImage} />
              <AvatarFallback>V</AvatarFallback>
            </Avatar>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <h1 className="text-4xl sm:text-5xl mb-3 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              <FontCycler text="Vossi" delay={800} duration={3000} />
            </h1>
            <div className="flex items-center justify-center gap-2 mb-4 flex-wrap">
              <Badge
                variant="outline"
                className="bg-blue-500/20 text-blue-300 border-blue-500/40 flex items-center h-7"
              >
                <GraduationCap className="w-3.5 h-3.5 mr-1" />
                Student
              </Badge>
              <Badge
                variant="outline"
                className="bg-slate-700/50 text-slate-200 border-slate-600 flex items-center h-7"
              >
                <span className="text-lg mr-1">🇩🇪</span> Germany
              </Badge>
            </div>
            <p className="text-slate-400 mb-4">
              aka{" "}
              {alternateNames.map((name, i) => (
                <span key={name}>
                  <span className="text-slate-300 font-mono">
                    {name}
                  </span>
                  {i < alternateNames.length - 1 && (
                    <span className="text-slate-600"> • </span>
                  )}
                </span>
              ))}
            </p>
          </motion.div>
        </motion.div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Left Column - Terminal */}
          <div className="space-y-6">
            {/* Terminal */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
            >
              <div className="bg-slate-900/50 backdrop-blur-xl rounded-lg border border-slate-700/50 overflow-hidden shadow-2xl">
                <div className="bg-slate-800/80 px-4 py-3 flex items-center gap-2 border-b border-slate-700/50">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="ml-2 text-slate-400 text-sm">
                    ~/setup
                  </span>
                </div>
                <div className="p-6 font-mono text-xs sm:text-sm overflow-x-auto">
                  <div className="text-green-400">
                    <span className="text-slate-500">$</span>{" "}
                    <TerminalText
                      text="neofetch"
                      delay={1500}
                      speed={80}
                      hideCursor={showNeofetch}
                    />
                  </div>
                  {showNeofetch && (
                    <>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="flex gap-6 flex-col sm:flex-row mt-3"
                      >
                        <div className="text-blue-400 whitespace-pre leading-tight text-[10px] sm:text-xs">
                          {`################  ################
################  ################
################  ################
################  ################
################  ################
################  ################
################  ################

################  ################
################  ################
################  ################
################  ################
################  ################
################  ################
################  ################`}
                        </div>
                        <div className="text-slate-300 space-y-1">
                          <div>
                            <span className="text-blue-400">
                              vossi
                            </span>
                            @
                            <span className="text-blue-400">
                              setup
                            </span>
                          </div>
                          <div className="text-slate-600">
                            -----------------
                          </div>
                          <div>
                            <span className="text-slate-500">
                              OS:
                            </span>{" "}
                            Windows 11
                          </div>
                          <div>
                            <span className="text-slate-500">
                              Also:
                            </span>{" "}
                            Fedora KDE Plasma
                          </div>
                          <div>
                            <span className="text-slate-500">
                              Server:
                            </span>{" "}
                            Debian headless
                          </div>
                          <div>
                            <span className="text-slate-500">
                              CPU:
                            </span>{" "}
                            AMD Ryzen 5 5600X
                          </div>
                          <div>
                            <span className="text-slate-500">
                              Memory:
                            </span>{" "}
                            32 GB DDR4 3600 MT/s
                          </div>
                          <div>
                            <span className="text-slate-500">
                              GPU:
                            </span>{" "}
                            NVIDIA RTX 4060 Ti 16GB
                          </div>
                        </div>
                      </motion.div>
                      <div className="text-green-400 mt-3">
                        <span className="text-slate-500">
                          $
                        </span>{" "}
                        <motion.span
                          animate={{ opacity: [1, 0, 1] }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear"
                          }}
                          className="inline-block"
                        >
                          ▊
                        </motion.span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Quote, Links and Interests */}
          <div className="space-y-6">
            {/* Quote Section */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 1 }}
              className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-sm rounded-lg border border-blue-500/20 p-6"
            >
              <div className="flex items-start gap-3">
                <Plane className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-slate-300 italic mb-2">
                    "Wer lesen kann ist klar im vorteil"
                  </p>
                  <p className="text-slate-500 text-sm">
                    - T.G.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Social Links */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 1.1 }}
              className="bg-slate-900/30 backdrop-blur-sm rounded-lg border border-slate-700/50 p-6"
            >
              <h2 className="text-2xl mb-6 text-slate-300 flex items-center gap-2">
                <MessageCircle className="w-6 h-6 text-indigo-400" />
                Connect With Me
              </h2>
              <div className="flex flex-col gap-3">
                {socialLinks.map((social, index) => (
                  <motion.div
                    key={social.label}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      duration: 0.4,
                      delay: 1.2 + index * 0.1,
                    }}
                    whileHover={{ scale: 1.03, x: 5 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.1 }}
                  >
                    <Button
                      variant="outline"
                      size="lg"
                      className={`w-full bg-slate-800/70 backdrop-blur-sm border-slate-500 hover:bg-slate-700 ${social.color} transition-all duration-300 justify-start text-base group shadow-lg hover:shadow-xl text-slate-100 hover:text-white`}
                      asChild
                    >
                      <a
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={social.label}
                      >
                        <social.icon className="w-5 h-5 mr-3 text-slate-200" />
                        {social.label}
                      </a>
                    </Button>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Hobbies Section */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 1.4 }}
              className="bg-slate-900/30 backdrop-blur-sm rounded-lg border border-slate-700/50 p-6"
            >
              <h2 className="text-2xl mb-6 text-slate-300 flex items-center gap-2">
                <CarFront className="w-6 h-6 text-red-400" />
                Interests & Hobbies
              </h2>
              <div className="flex flex-wrap gap-3">
                {hobbies.map((hobby, index) => (
                  <motion.div
                    key={hobby.label}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      duration: 0.4,
                      delay: 1.5 + index * 0.1,
                    }}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.9 }}
                    transition={{ duration: 0.1 }}
                  >
                    <Badge
                      variant="outline"
                      className={`${hobby.color} px-4 py-2.5 border cursor-pointer transition-all duration-300 hover:shadow-lg text-base`}
                    >
                      <hobby.icon className="w-4 h-4 mr-2" />
                      {hobby.label}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 2 }}
          className="text-center mt-12 text-slate-500 text-sm"
        >
          <p className="font-mono">
            Made with{" "}
            <span className="text-red-500 animate-pulse">
              React & Motion
            </span>{" "}
          </p>
        </motion.div>
      </div>
    </div>
  );
}