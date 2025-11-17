import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { LoginDialog } from './LoginDialog';
import { logout as authLogout, getCurrentUser, isAdmin } from '../lib/auth';
import { toast } from 'sonner@2.0.3';

interface TerminalLine {
  type: 'command' | 'output' | 'neofetch' | 'multiline';
  content: string | string[];
  timestamp: number;
}

interface InteractiveTerminalProps {
  onOpenAdmin?: () => void;
}

export function InteractiveTerminal({ onOpenAdmin }: InteractiveTerminalProps) {
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isTypingCommand, setIsTypingCommand] = useState(true);
  const [typedCommand, setTypedCommand] = useState('');
  const [initialAnimationDone, setInitialAnimationDone] = useState(false);
  const [showInitialCommand, setShowInitialCommand] = useState(true);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState('vossi');
  const [currentPath] = useState('~/setup');
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  // Auto-scroll to bottom
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [lines, currentInput]);

  // Initial neofetch typing animation
  useEffect(() => {
    const neofetchCommand = 'neofetch';
    let charIndex = 0;
    
    const startTyping = setTimeout(() => {
      const typeInterval = setInterval(() => {
        if (charIndex < neofetchCommand.length) {
          setTypedCommand(neofetchCommand.slice(0, charIndex + 1));
          charIndex++;
        } else {
          clearInterval(typeInterval);
          setIsTypingCommand(false);
          
          // Execute neofetch command after typing
          setTimeout(() => {
            processCommand('neofetch', false);
            setInitialAnimationDone(true);
          }, 200);
        }
      }, 80);
      
      return () => clearInterval(typeInterval);
    }, 1500);

    return () => {
      clearTimeout(startTyping);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  // Focus input when clicking terminal
  const handleTerminalClick = () => {
    if (initialAnimationDone && inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const command = currentInput.trim();
      
      if (command) {
        // Add command to history
        setLines(prev => [...prev, {
          type: 'command',
          content: command,
          timestamp: Date.now()
        }]);

        // Process command
        processCommand(command, true);
      } else {
        // Empty line
        setLines(prev => [...prev, {
          type: 'command',
          content: '',
          timestamp: Date.now()
        }]);
      }
      
      // Clear input
      setCurrentInput('');
    }
  };

  const processCommand = (command: string, addToHistory: boolean) => {
    const parts = command.trim().split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    switch (cmd) {
      case 'su':
        setLoginDialogOpen(true);
        break;
      
      case 'neofetch':
        setLines(prev => [...prev, {
          type: 'neofetch',
          content: '',
          timestamp: Date.now()
        }]);
        break;
      
      case 'clear':
        setLines([]);
        setShowInitialCommand(false);
        break;
      
      case 'whoami':
        setLines(prev => [...prev, {
          type: 'output',
          content: currentUser,
          timestamp: Date.now()
        }]);
        break;
      
      case 'pwd':
        setLines(prev => [...prev, {
          type: 'output',
          content: currentPath,
          timestamp: Date.now()
        }]);
        break;
      
      case 'date':
        setLines(prev => [...prev, {
          type: 'output',
          content: new Date().toString(),
          timestamp: Date.now()
        }]);
        break;
      
      case 'uptime':
        setLines(prev => [...prev, {
          type: 'output',
          content: 'up 42 days, 13:37, 1 user, load average: 0.42, 0.69, 1.33',
          timestamp: Date.now()
        }]);
        break;
      
      case 'uname':
        const flag = args[0];
        let output = 'Linux';
        if (flag === '-a') {
          output = 'Linux setup 5.15.0-91-generic #101-Ubuntu SMP x86_64 GNU/Linux';
        } else if (flag === '-r') {
          output = '5.15.0-91-generic';
        }
        setLines(prev => [...prev, {
          type: 'output',
          content: output,
          timestamp: Date.now()
        }]);
        break;
      
      case 'ls':
        const lsOutput = args.includes('-la') || args.includes('-l')
          ? [
              'total 64',
              'drwxr-xr-x  8 vossi vossi 4096 Nov  3 13:37 .',
              'drwxr-xr-x 24 vossi vossi 4096 Nov  3 12:00 ..',
              'drwxr-xr-x  2 vossi vossi 4096 Nov  3 13:37 Desktop',
              'drwxr-xr-x  5 vossi vossi 4096 Nov  3 13:37 Documents',
              'drwxr-xr-x  3 vossi vossi 4096 Nov  3 13:37 Downloads',
              'drwxr-xr-x  2 vossi vossi 4096 Nov  3 13:37 Projects'
            ]
          : 'Desktop  Documents  Downloads  Projects';
        setLines(prev => [...prev, {
          type: Array.isArray(lsOutput) ? 'multiline' : 'output',
          content: lsOutput,
          timestamp: Date.now()
        }]);
        break;
      
      case 'cat':
        if (args.length === 0) {
          setLines(prev => [...prev, {
            type: 'output',
            content: 'cat: missing file operand',
            timestamp: Date.now()
          }]);
        } else {
          setLines(prev => [...prev, {
            type: 'output',
            content: `cat: ${args[0]}: No such file or directory`,
            timestamp: Date.now()
          }]);
        }
        break;
      
      case 'echo':
        setLines(prev => [...prev, {
          type: 'output',
          content: args.join(' '),
          timestamp: Date.now()
        }]);
        break;
      
      case 'hostname':
        setLines(prev => [...prev, {
          type: 'output',
          content: 'setup',
          timestamp: Date.now()
        }]);
        break;
      
      case 'df':
        setLines(prev => [...prev, {
          type: 'multiline',
          content: [
            'Filesystem     1K-blocks      Used Available Use% Mounted on',
            '/dev/nvme0n1p2 976762584 234567890 692617920  26% /',
            '/dev/nvme0n1p1    523248    123456    399792  24% /boot/efi'
          ],
          timestamp: Date.now()
        }]);
        break;
      
      case 'free':
        setLines(prev => [...prev, {
          type: 'multiline',
          content: [
            '               total        used        free      shared  buff/cache   available',
            'Mem:        32874792     8234567    16234567      234567     8405658    23456789',
            'Swap:       16777216           0    16777216'
          ],
          timestamp: Date.now()
        }]);
        break;
      
      case 'help':
        setLines(prev => [...prev, {
          type: 'multiline',
          content: [
            'Available commands:',
            '  su         - Switch user (login)',
            '  neofetch   - Display system information',
            '  whoami     - Print current user',
            '  pwd        - Print working directory',
            '  ls [opts]  - List directory contents',
            '  cat [file] - Display file contents',
            '  echo [txt] - Print text',
            '  date       - Display current date/time',
            '  uptime     - Show system uptime',
            '  uname      - Print system information',
            '  hostname   - Show hostname',
            '  df         - Display disk usage',
            '  free       - Show memory usage',
            '  clear      - Clear terminal',
            '  help       - Show this help message'
          ],
          timestamp: Date.now()
        }]);
        break;
      
      default:
        if (command.trim()) {
          setLines(prev => [...prev, {
            type: 'output',
            content: `bash: ${command}: command not found`,
            timestamp: Date.now()
          }]);
        }
        break;
    }
  };

  const handleLoginSuccess = (username: string, role: 'admin' | 'user') => {
    setCurrentUser(username);
    setLines(prev => [...prev, {
      type: 'output',
      content: `Switched to user: ${username}`,
      timestamp: Date.now()
    }]);
    
    // If admin user, trigger the admin panel
    if (role === 'admin' && onOpenAdmin) {
      // Use a flag in localStorage to communicate with App.tsx
      localStorage.setItem('showAdminDashboard', 'true');
      // Trigger the storage event
      window.dispatchEvent(new Event('storage'));
      // Also directly call onOpenAdmin
      setTimeout(() => {
        onOpenAdmin();
      }, 500);
    } else {
      // For non-admin users, just trigger a re-render
      window.dispatchEvent(new Event('storage'));
    }
  };

  const renderNeofetch = () => (
    <div className="flex gap-6 flex-col sm:flex-row mt-1">
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
          <span className="text-blue-400">{currentUser}</span>
          @
          <span className="text-blue-400">setup</span>
        </div>
        <div className="text-slate-600">-----------------</div>
        <div>
          <span className="text-slate-500">OS:</span> Windows 11
        </div>
        <div>
          <span className="text-slate-500">Also:</span> Fedora KDE Plasma
        </div>
        <div>
          <span className="text-slate-500">Server:</span> Debian headless
        </div>
        <div>
          <span className="text-slate-500">CPU:</span> AMD Ryzen 5 5600X
        </div>
        <div>
          <span className="text-slate-500">Memory:</span> 32 GB DDR4 3600 MT/s
        </div>
        <div>
          <span className="text-slate-500">GPU:</span> NVIDIA RTX 4060 Ti 16GB
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div 
        className="bg-slate-900/50 backdrop-blur-xl rounded-lg border border-slate-700/50 overflow-hidden shadow-2xl cursor-text"
        onClick={handleTerminalClick}
      >
        <div className="bg-slate-800/80 px-4 py-3 flex items-center gap-2 border-b border-slate-700/50">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="ml-2 text-slate-400 text-sm">{currentPath}</span>
        </div>
        
        <div 
          ref={terminalRef}
          className="p-6 font-mono text-xs sm:text-sm overflow-x-auto max-h-[500px] overflow-y-auto"
        >
          {/* Initial neofetch typing animation */}
          {showInitialCommand && (
            <>
              <div className="text-green-400">
                <span className="text-slate-500">$</span>{' '}
                <span>{!initialAnimationDone ? typedCommand : 'neofetch'}</span>
                {isTypingCommand && !initialAnimationDone && (
                  <motion.span
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: 'linear'
                    }}
                    className="inline-block ml-0.5"
                  >
                    ▊
                  </motion.span>
                )}
              </div>
              {!isTypingCommand && lines.length > 0 && lines[0].type === 'neofetch' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {renderNeofetch()}
                </motion.div>
              )}
            </>
          )}

          {/* Command history */}
          {initialAnimationDone && lines.slice(1).map((line, index) => (
            <div key={`${line.timestamp}-${index}`}>
              {line.type === 'command' && (
                <div className="text-green-400 mt-3">
                  <span className="text-slate-500">$</span> {line.content}
                </div>
              )}
              {line.type === 'output' && (
                <div className="text-slate-300 mt-1">{line.content}</div>
              )}
              {line.type === 'multiline' && Array.isArray(line.content) && (
                <div className="text-slate-300 mt-1">
                  {line.content.map((l, i) => (
                    <div key={i}>{l}</div>
                  ))}
                </div>
              )}
              {line.type === 'neofetch' && (
                <div className="mt-1">{renderNeofetch()}</div>
              )}
            </div>
          ))}

          {/* Current input line */}
          {initialAnimationDone && (
            <div className="text-green-400 mt-3 flex items-center">
              <span className="text-slate-500">$</span>
              <div className="relative flex-1 ml-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full bg-transparent outline-none text-green-400 caret-transparent"
                  autoFocus
                  spellCheck={false}
                />
                {/* Custom terminal cursor */}
                <motion.span
                  animate={{ opacity: [1, 1, 0, 0] }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    ease: 'steps(1)'
                  }}
                  className="absolute inline-block bg-green-400 pointer-events-none"
                  style={{
                    left: `${currentInput.length * 0.6}em`,
                    top: '0',
                    width: '0.6em',
                    height: '1.2em',
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <LoginDialog 
        open={loginDialogOpen}
        onOpenChange={setLoginDialogOpen}
        onLoginSuccess={handleLoginSuccess}
      />
    </>
  );
}