import { motion } from 'framer-motion';

export const AnimatedBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Subtle animated grid */}
      <motion.div 
        className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:60px_60px]"
        animate={{
          backgroundPosition: ['0px 0px', '60px 60px'],
        }}
        transition={{
          duration: 60,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      
      {/* Animated gradient overlay */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-secondary/10"
        animate={{
          opacity: [0.6, 0.7, 0.6],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      {/* Large Animated Circles with more contrast */}
      <motion.div
        className="absolute -top-20 -left-20 w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.08, 1],
          opacity: [0.3, 0.4, 0.3],
          x: [0, 20, 0],
          y: [0, 15, 0],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      <motion.div
        className="absolute top-1/4 -right-32 w-[400px] h-[400px] bg-secondary/12 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.25, 0.35, 0.25],
          x: [0, -20, 0],
          y: [0, 20, 0],
        }}
        transition={{
          duration: 35,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute bottom-0 left-1/3 w-[450px] h-[450px] bg-white/8 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.06, 1],
          opacity: [0.25, 0.32, 0.25],
          x: [0, 18, 0],
          y: [0, -18, 0],
        }}
        transition={{
          duration: 32,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Floating Orbs with more visibility */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={`orb-${i}`}
          className="absolute w-2 h-2 bg-white/20 rounded-full blur-sm"
          style={{
            left: `${15 + i * 18}%`,
            top: `${25 + (i % 3) * 20}%`,
          }}
          animate={{
            y: [0, -35, 0],
            x: [0, Math.sin(i) * 10, 0],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 15 + i * 2,
            repeat: Infinity,
            delay: i * 1,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Radial Pulse with more visibility */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-white/8 rounded-full"
        animate={{
          scale: [1, 1.8, 1],
          opacity: [0.3, 0, 0.3],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeOut",
        }}
      />
    </div>
  );
};
