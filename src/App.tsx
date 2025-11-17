import { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  Mail,
  Plane,
  Cpu,
  Flag,
  GraduationCap,
  CarFront,
  MessageCircle,
  Music,
  Settings,
} from "lucide-react";
import { FontCycler } from "./components/FontCycler";
import { InteractiveTerminal } from "./components/InteractiveTerminal";
import { AdminDashboard } from "./components/AdminDashboard";
import { Badge } from "./components/ui/badge";
import { Button } from "./components/ui/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "./components/ui/avatar";
import { Toaster } from "./components/ui/sonner";
import profileImage from "figma:asset/4bc64df884a940c39a286da197b1cf59a5684086.png";
import { getProfile, incrementProfileViews, initializeAuth, getCurrentUser, isAdmin } from "./lib/auth";

// Icon mapping
const iconMap: Record<string, any> = {
  Mail,
  Plane,
  Cpu,
  Flag,
  GraduationCap,
  CarFront,
  MessageCircle,
  Music,
};

export default function App() {
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  const [profile, setProfile] = useState(getProfile());
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  useEffect(() => {
    // Initialize auth system
    const init = async () => {
      await initializeAuth();
      
      // Track profile views
      incrementProfileViews();

      // Check if user is logged in
      const user = getCurrentUser();
      setCurrentUser(user);
      
      // Log credential setup instructions
      console.log('%c🔐 Credential Setup', 'font-size: 16px; font-weight: bold; color: #8b5cf6;');
      console.log('%cTo configure custom credentials:', 'font-size: 12px; color: #a78bfa;');
      console.log('%c1. Go to Supabase Dashboard → Secrets', 'font-size: 12px; color: #c4b5fd;');
      console.log('%c2. Create secret: ADMIN_CREDENTIALS', 'font-size: 12px; color: #c4b5fd;');
      console.log('%c3. Format: username:password:role,username2:password2:role2', 'font-size: 12px; color: #c4b5fd;');
      console.log('%c4. Example: hannes:1511:user,vossi:password:admin', 'font-size: 12px; color: #c4b5fd;');
      console.log('%c\nDefault credentials:', 'font-size: 12px; color: #a78bfa;');
      console.log('%c  - vossi / password (admin)', 'font-size: 12px; color: #c4b5fd;');
      console.log('%c  - hannes / 1511 (user)', 'font-size: 12px; color: #c4b5fd;');
      console.log('%c\n⚙️ Admin Interface Access:', 'font-size: 14px; font-weight: bold; color: #10b981;');
      console.log('%c1. Type "su" in the terminal and login with admin credentials', 'font-size: 12px; color: #34d399;');
      console.log('%c2. Click the "Admin Panel" button (top right after login)', 'font-size: 12px; color: #34d399;');
      console.log('%c3. Or use keyboard shortcut: Ctrl+Shift+A', 'font-size: 12px; color: #34d399;');
      console.log('%c\n📝 Admin Features:', 'font-size: 14px; font-weight: bold; color: #f59e0b;');
      console.log('%c  • Change profile picture', 'font-size: 12px; color: #fbbf24;');
      console.log('%c  • Add/remove connection methods (social links)', 'font-size: 12px; color: #fbbf24;');
      console.log('%c  • Add/remove hobby tags', 'font-size: 12px; color: #fbbf24;');
      console.log('%c  • Edit all profile information', 'font-size: 12px; color: #fbbf24;');
    };
    
    init();

    // Listen for profile updates and login events
    const handleStorageChange = () => {
      setProfile(getProfile());
      const updatedUser = getCurrentUser();
      setCurrentUser(updatedUser);
      
      // Check if admin and show dashboard if needed
      if (updatedUser && isAdmin(updatedUser)) {
        const shouldShowDashboard = localStorage.getItem('showAdminDashboard');
        if (shouldShowDashboard === 'true') {
          setShowAdminDashboard(true);
          localStorage.removeItem('showAdminDashboard');
        }
      }
    };
    
    // Keyboard shortcut: Ctrl+Shift+A to open admin panel
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        const user = getCurrentUser();
        if (user && isAdmin(user)) {
          setShowAdminDashboard(true);
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Refresh profile when closing admin dashboard
  const handleCloseAdminDashboard = () => {
    setShowAdminDashboard(false);
    setProfile(getProfile());
  };

  const handleAdminAccess = () => {
    const user = getCurrentUser();
    if (user && isAdmin(user)) {
      setShowAdminDashboard(true);
    }
  };

  // Use profile image if available, otherwise fallback to default
  const displayImage = profile.profileImage || profileImage;

  // Map hobbies and badges with proper icon components
  const mappedHobbies = profile.hobbies.map(hobby => ({
    ...hobby,
    icon: iconMap[hobby.icon] || CarFront,
  }));

  const mappedBadges = profile.badges.map(badge => ({
    ...badge,
    icon: badge.icon === 'GraduationCap' ? GraduationCap : Flag,
  }));

  const mappedSocialLinks = profile.socialLinks.map(link => ({
    ...link,
    icon: iconMap[link.icon] || Mail,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden">
      {/* Admin Dashboard Overlay */}
      {showAdminDashboard && (
        <AdminDashboard onClose={handleCloseAdminDashboard} />
      )}

      {/* Admin Access Button */}
      {currentUser && isAdmin(currentUser) && !showAdminDashboard && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed top-6 right-6 z-40"
        >
          <Button
            onClick={handleAdminAccess}
            className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg"
          >
            <Settings className="w-4 h-4 mr-2" />
            Admin Panel
          </Button>
        </motion.div>
      )}

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
              <AvatarImage src={displayImage} />
              <AvatarFallback>{profile.name[0]}</AvatarFallback>
            </Avatar>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <h1 className="text-4xl sm:text-5xl mb-3 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              <FontCycler text={profile.name} delay={800} duration={3000} />
            </h1>
            <div className="flex items-center justify-center gap-2 mb-4 flex-wrap">
              {mappedBadges.map((badge, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className={`${badge.color} flex items-center h-7`}
                >
                  {badge.icon === GraduationCap ? (
                    <GraduationCap className="w-3.5 h-3.5 mr-1" />
                  ) : (
                    <span className="text-lg mr-1">{badge.label.includes('🇩🇪') ? '🇩🇪' : ''}</span>
                  )}
                  {badge.label.replace('🇩🇪 ', '')}
                </Badge>
              ))}
            </div>
            <p className="text-slate-400 mb-4">
              aka{" "}
              {profile.alternateNames.map((name, i) => (
                <span key={name}>
                  <span className="text-slate-300 font-mono">
                    {name}
                  </span>
                  {i < profile.alternateNames.length - 1 && (
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
              <InteractiveTerminal onOpenAdmin={handleAdminAccess} />
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
                    "{profile.quote.text}"
                  </p>
                  <p className="text-slate-500 text-sm">
                    - {profile.quote.author}
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
                {mappedSocialLinks.map((social, index) => (
                  <motion.div
                    key={social.label}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      duration: 0.3,
                      delay: 1.1 + index * 0.05,
                    }}
                    whileHover={{ scale: 1.03, x: 5 }}
                    whileTap={{ scale: 0.95 }}
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
                {mappedHobbies.map((hobby, index) => (
                  <motion.div
                    key={hobby.label}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      duration: 0.3,
                      delay: 1.4 + index * 0.05,
                    }}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.9 }}
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
      <Toaster />
    </div>
  );
}