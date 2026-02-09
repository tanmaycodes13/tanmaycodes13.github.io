"use client"

import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { CareerTimeline } from "@/components/sections/CareerTimeline";
import { Contact } from "@/components/sections/Contact";
import { Github, Linkedin } from "lucide-react";
import { motion } from "framer-motion";
import { TechStack } from "@/components/sections/TechStack";

// Import Google Font for cursive style
import { Dancing_Script } from "next/font/google";

const dancingScript = Dancing_Script({ subsets: ["latin"] });

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden">
      {/* Hero Section */}
      <section className="min-h-screen flex flex-col justify-center items-start container mx-auto px-4 md:px-6 relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="z-10 max-w-2xl space-y-8"
        >
          {/* Simple greeting */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="flex items-center gap-3"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              className="text-4xl"
            >
              👋
            </motion.div>
            <span className="text-lg text-muted-foreground">Hi, I'm</span>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-6xl font-black tracking-tight sm:text-7xl md:text-8xl leading-none text-foreground"
          >
            Tanmay
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="text-lg text-muted-foreground md:text-xl max-w-[600px] leading-relaxed"
          >
            I build and automate scalable cloud infrastructure.
            <br />
            Specializing in <span className="text-primary font-semibold">Platform Engineering</span>, <span className="text-primary font-semibold">Backend Systems</span>, and <span className="text-primary font-semibold">DevOps</span>.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            className="flex flex-wrap items-center gap-4"
          >
            <Link href="#journey">
              <Button size="lg" className="group">
                View Journey
                <motion.span
                  className="ml-1 inline-block"
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  →
                </motion.span>
              </Button>
            </Link>
            <Link href="#contact">
              <Button variant="outline" size="lg">
                Get in Touch
              </Button>
            </Link>
            
            {/* Inline social icons */}
            <div className="flex items-center gap-2 ml-2">
              <Link href="https://github.com/tanmaycodes13" target="_blank" rel="noopener noreferrer">
                <motion.div whileHover={{ y: -3 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="ghost" size="icon" className="h-10 w-10">
                    <Github className="h-5 w-5" />
                  </Button>
                </motion.div>
              </Link>
              <Link href="https://www.linkedin.com/in/tanmay-7a0806173/" target="_blank" rel="noopener noreferrer">
                <motion.div whileHover={{ y: -3 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="ghost" size="icon" className="h-10 w-10">
                    <Linkedin className="h-5 w-5" />
                  </Button>
                </motion.div>
              </Link>
            </div>
          </motion.div>

          {/* Quick stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            className="flex flex-wrap gap-6 pt-4 border-t border-border/40"
          >
            <div className="space-y-1">
              <div className="text-2xl font-bold text-primary">3+</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider">Years Exp</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-primary">0→1</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider">Products Built</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-primary">∞</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider">Problems Solved</div>
            </div>
          </motion.div>
        </motion.div>
        
        {/* Animated Background Shapes with Parallax */}
        <motion.div
          animate={{
            y: [0, -20, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl -z-10 pointer-events-none"
        />
        <motion.div
          animate={{
            y: [0, 20, 0],
            rotate: [0, -180, -360],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-[300px] h-[300px] bg-secondary/30 rounded-full blur-3xl -z-10 pointer-events-none"
        />
        
        {/* Tech Stack Icons */}
        <TechStack />
      </section>

      {/* Career Timeline Section */}
      <CareerTimeline />

      {/* Contact Section */}
      <Contact />
    </div>
  );
}
