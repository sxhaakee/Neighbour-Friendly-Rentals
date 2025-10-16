import { motion } from 'framer-motion';

export const AnimatedBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Animated Circles - Large */}
      <motion.div
        className="absolute -top-20 -left-20 w-96 h-96 border-2 border-white/10 rounded-full"
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 180, 360],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      
      <motion.div
        className="absolute top-1/4 -right-32 w-80 h-80 border-2 border-white/10 rounded-full"
        animate={{
          scale: [1, 1.3, 1],
          rotate: [360, 180, 0],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      
      <motion.div
        className="absolute -bottom-32 left-1/3 w-72 h-72 border-2 border-white/10 rounded-full"
        animate={{
          scale: [1, 1.15, 1],
          rotate: [0, -180, -360],
          opacity: [0.25, 0.45, 0.25],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Floating Squares */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={`square-${i}`}
          className="absolute w-3 h-3 border border-white/20 rotate-45"
          style={{
            left: `${10 + i * 12}%`,
            top: `${20 + (i % 3) * 25}%`,
          }}
          animate={{
            y: [0, -40, 0],
            rotate: [45, 225, 45],
            opacity: [0.2, 0.6, 0.2],
          }}
          transition={{
            duration: 4 + i * 0.5,
            repeat: Infinity,
            delay: i * 0.3,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Floating Dots */}
      {[...Array(25)].map((_, i) => (
        <motion.div
          key={`dot-${i}`}
          className="absolute w-1.5 h-1.5 bg-white/30 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -50, 0],
            x: [0, Math.random() * 20 - 10, 0],
            opacity: [0.2, 0.8, 0.2],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 3 + Math.random() * 5,
            repeat: Infinity,
            delay: Math.random() * 3,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Wavy Lines */}
      <svg className="absolute inset-0 w-full h-full opacity-10">
        <motion.path
          d="M0,100 Q250,50 500,100 T1000,100"
          stroke="white"
          strokeWidth="2"
          fill="none"
          animate={{
            d: [
              "M0,100 Q250,50 500,100 T1000,100",
              "M0,100 Q250,150 500,100 T1000,100",
              "M0,100 Q250,50 500,100 T1000,100",
            ],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.path
          d="M0,200 Q250,250 500,200 T1000,200"
          stroke="white"
          strokeWidth="2"
          fill="none"
          animate={{
            d: [
              "M0,200 Q250,250 500,200 T1000,200",
              "M0,200 Q250,150 500,200 T1000,200",
              "M0,200 Q250,250 500,200 T1000,200",
            ],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
        <motion.path
          d="M0,300 Q250,350 500,300 T1000,300"
          stroke="white"
          strokeWidth="2"
          fill="none"
          animate={{
            d: [
              "M0,300 Q250,350 500,300 T1000,300",
              "M0,300 Q250,250 500,300 T1000,300",
              "M0,300 Q250,350 500,300 T1000,300",
            ],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />
      </svg>

      {/* Radial Pulse Effect */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-white/5 rounded-full"
        animate={{
          scale: [1, 2, 1],
          opacity: [0.5, 0, 0.5],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeOut",
        }}
      />
      
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-white/5 rounded-full"
        animate={{
          scale: [1, 2, 1],
          opacity: [0.5, 0, 0.5],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeOut",
          delay: 2,
        }}
      />
      
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-white/5 rounded-full"
        animate={{
          scale: [1, 2, 1],
          opacity: [0.5, 0, 0.5],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeOut",
          delay: 4,
        }}
      />

      {/* Subtle Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:40px_40px]" />
    </div>
  );
};
