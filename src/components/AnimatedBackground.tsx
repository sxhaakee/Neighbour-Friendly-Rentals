import { motion } from 'framer-motion';

export const AnimatedBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Animated Circles - Large & More Visible */}
      <motion.div
        className="absolute -top-20 -left-20 w-96 h-96 border-4 border-white/30 rounded-full shadow-[0_0_50px_rgba(255,255,255,0.2)]"
        animate={{
          scale: [1, 1.3, 1],
          rotate: [0, 180, 360],
          opacity: [0.4, 0.7, 0.4],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      <motion.div
        className="absolute top-1/4 -right-32 w-80 h-80 border-4 border-secondary/40 rounded-full shadow-[0_0_60px_rgba(251,191,36,0.3)]"
        animate={{
          scale: [1, 1.4, 1],
          rotate: [360, 180, 0],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      <motion.div
        className="absolute -bottom-32 left-1/3 w-72 h-72 border-4 border-white/25 rounded-full shadow-[0_0_40px_rgba(255,255,255,0.15)]"
        animate={{
          scale: [1, 1.25, 1],
          rotate: [0, -180, -360],
          opacity: [0.35, 0.65, 0.35],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Floating Squares - More Visible */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={`square-${i}`}
          className="absolute w-4 h-4 border-2 border-white/40 rotate-45 shadow-[0_0_20px_rgba(255,255,255,0.3)]"
          style={{
            left: `${5 + i * 8}%`,
            top: `${15 + (i % 4) * 20}%`,
          }}
          animate={{
            y: [0, -60, 0],
            rotate: [45, 405, 45],
            opacity: [0.3, 0.8, 0.3],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 3 + i * 0.4,
            repeat: Infinity,
            delay: i * 0.2,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Floating Dots - Brighter */}
      {[...Array(30)].map((_, i) => (
        <motion.div
          key={`dot-${i}`}
          className="absolute w-2 h-2 bg-white/50 rounded-full shadow-[0_0_15px_rgba(255,255,255,0.5)]"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -70, 0],
            x: [0, Math.random() * 30 - 15, 0],
            opacity: [0.3, 1, 0.3],
            scale: [1, 2, 1],
          }}
          transition={{
            duration: 2.5 + Math.random() * 4,
            repeat: Infinity,
            delay: Math.random() * 2,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Wavy Lines - More Visible */}
      <svg className="absolute inset-0 w-full h-full opacity-25">
        <motion.path
          d="M0,100 Q250,50 500,100 T1000,100"
          stroke="white"
          strokeWidth="3"
          fill="none"
          animate={{
            d: [
              "M0,100 Q250,50 500,100 T1000,100",
              "M0,100 Q250,150 500,100 T1000,100",
              "M0,100 Q250,50 500,100 T1000,100",
            ],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.path
          d="M0,200 Q250,250 500,200 T1000,200"
          stroke="rgba(251,191,36,0.6)"
          strokeWidth="3"
          fill="none"
          animate={{
            d: [
              "M0,200 Q250,250 500,200 T1000,200",
              "M0,200 Q250,150 500,200 T1000,200",
              "M0,200 Q250,250 500,200 T1000,200",
            ],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5,
          }}
        />
        <motion.path
          d="M0,300 Q250,350 500,300 T1000,300"
          stroke="white"
          strokeWidth="3"
          fill="none"
          animate={{
            d: [
              "M0,300 Q250,350 500,300 T1000,300",
              "M0,300 Q250,250 500,300 T1000,300",
              "M0,300 Q250,350 500,300 T1000,300",
            ],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
      </svg>

      {/* Radial Pulse Effect - More Visible */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border-2 border-white/15 rounded-full shadow-[0_0_80px_rgba(255,255,255,0.2)]"
        animate={{
          scale: [1, 2.5, 1],
          opacity: [0.6, 0, 0.6],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeOut",
        }}
      />
      
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border-2 border-secondary/20 rounded-full shadow-[0_0_80px_rgba(251,191,36,0.2)]"
        animate={{
          scale: [1, 2.5, 1],
          opacity: [0.6, 0, 0.6],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeOut",
          delay: 1.7,
        }}
      />
      
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border-2 border-white/15 rounded-full shadow-[0_0_80px_rgba(255,255,255,0.2)]"
        animate={{
          scale: [1, 2.5, 1],
          opacity: [0.6, 0, 0.6],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeOut",
          delay: 3.4,
        }}
      />

      {/* Enhanced Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff15_1px,transparent_1px),linear-gradient(to_bottom,#ffffff15_1px,transparent_1px)] bg-[size:40px_40px]" />
    </div>
  );
};
