"use client"

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { motion } from "framer-motion";
import { Mail, Send, Sparkles, Heart, Coffee, MessageCircle } from "lucide-react";
import { useState } from "react";

export function Contact() {
  const [hoveredInput, setHoveredInput] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

  const emojis = ["👋", "🚀", "💡", "⚡", "✨", "🎯", "🔥", "💪"];
  const [currentEmoji, setCurrentEmoji] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          access_key: "a3730f90-28db-4cdc-8ca0-b5d4f00e2bcb",
          name: formData.name,
          email: formData.email,
          message: formData.message,
          subject: `New Portfolio Contact from ${formData.name}`,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSubmitStatus("success");
        setFormData({ name: "", email: "", message: "" });
        setCurrentEmoji((prev) => (prev + 1) % emojis.length);
      } else {
        setSubmitStatus("error");
      }
    } catch (error) {
      console.error("Form submission error:", error);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
      
      // Reset status after 5 seconds
      setTimeout(() => {
        setSubmitStatus("idle");
      }, 5000);
    }
  };

  return (
    <section id="contact" className="w-full py-16 md:py-24 relative overflow-hidden bg-gradient-to-b from-muted/30 to-background">
      {/* Animated Background */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 90, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute -bottom-1/2 -left-1/4 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-3xl -z-10"
      />
      
      {/* Floating particles */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.random() * 20 - 10, 0],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 3 + i,
            repeat: Infinity,
            delay: i * 0.5,
          }}
          className="absolute w-2 h-2 bg-primary/30 rounded-full blur-sm"
          style={{
            left: `${20 + i * 15}%`,
            top: `${30 + i * 10}%`,
          }}
        />
      ))}
      
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center justify-center space-y-4 text-center mb-12"
        >
          <motion.div 
            className="inline-flex items-center gap-2 rounded-lg bg-secondary px-4 py-2 text-sm font-semibold text-secondary-foreground"
            whileHover={{ scale: 1.05 }}
          >
            <Sparkles className="h-4 w-4" />
            Let's Connect
          </motion.div>
          
          <motion.h2 
            className="text-3xl font-bold tracking-tighter sm:text-5xl"
            animate={{ 
              backgroundImage: [
                "linear-gradient(90deg, #000 0%, #000 100%)",
                "linear-gradient(90deg, #60a5fa 0%, #000 50%, #60a5fa 100%)",
                "linear-gradient(90deg, #000 0%, #000 100%)"
              ]
            }}
            transition={{ duration: 3, repeat: Infinity }}
            style={{ 
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
            }}
          >
            Drop Me a Message!
          </motion.h2>
          
          <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed">
            Got an exciting project? Want to collaborate? Or just want to say hi? 
            <motion.span
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
              className="inline-block ml-2"
            >
              {emojis[currentEmoji]}
            </motion.span>
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mx-auto max-w-md"
        >
          <Card className="relative overflow-hidden border-2 border-primary/20 shadow-2xl">
            {/* Animated border gradient */}
            <motion.div
              animate={{
                rotate: 360,
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "linear"
              }}
              className="absolute inset-0 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 opacity-50 blur-xl -z-10"
            />
            
            <CardHeader className="text-center pb-4">
              <CardTitle className="flex items-center justify-center gap-2">
                <MessageCircle className="h-5 w-5 text-primary" />
                Send a message
              </CardTitle>
              <CardDescription>
                I typically respond within 24 hours <Coffee className="inline h-4 w-4" />
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="space-y-2"
                  onMouseEnter={() => setHoveredInput("name")}
                  onMouseLeave={() => setHoveredInput(null)}
                >
                  <label htmlFor="name" className="text-sm font-medium flex items-center gap-2">
                    Your Name
                    {hoveredInput === "name" && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="text-xs"
                      >
                        ✨
                      </motion.span>
                    )}
                  </label>
                  <motion.input
                    whileFocus={{ scale: 1.02, borderColor: "#60a5fa" }}
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="flex h-10 w-full rounded-md border-2 border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-all"
                    placeholder="John Doe"
                  />
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                  className="space-y-2"
                  onMouseEnter={() => setHoveredInput("email")}
                  onMouseLeave={() => setHoveredInput(null)}
                >
                  <label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                    Email Address
                    {hoveredInput === "email" && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                      >
                        <Mail className="h-3 w-3 text-primary" />
                      </motion.span>
                    )}
                  </label>
                  <motion.input
                    whileFocus={{ scale: 1.02, borderColor: "#60a5fa" }}
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="flex h-10 w-full rounded-md border-2 border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-all"
                    placeholder="john@example.com"
                  />
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 }}
                  className="space-y-2"
                  onMouseEnter={() => setHoveredInput("message")}
                  onMouseLeave={() => setHoveredInput(null)}
                >
                  <label htmlFor="message" className="text-sm font-medium flex items-center gap-2">
                    Your Message
                    {hoveredInput === "message" && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
                        transition={{ rotate: { duration: 0.5 } }}
                      >
                        💬
                      </motion.span>
                    )}
                  </label>
                  <motion.textarea
                    whileFocus={{ scale: 1.02, borderColor: "#60a5fa" }}
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="flex min-h-[120px] w-full rounded-md border-2 border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-all resize-none"
                    placeholder="Tell me about your awesome idea..."
                  />
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.6 }}
                >
                  <motion.div
                    whileHover={{ scale: isSubmitting ? 1 : 1.05 }}
                    whileTap={{ scale: isSubmitting ? 1 : 0.95 }}
                  >
                    <Button 
                      type="submit" 
                      className="w-full relative overflow-hidden group"
                      disabled={isSubmitting || !formData.name || !formData.email || !formData.message}
                    >
                      <motion.span
                        className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80"
                        animate={{
                          x: ["-100%", "100%"],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "linear"
                        }}
                      />
                      <span className="relative flex items-center justify-center gap-2">
                        {isSubmitting ? "Sending..." : submitStatus === "success" ? "Sent! ✓" : "Send Message"}
                        {!isSubmitting && submitStatus === "idle" && (
                          <motion.div
                            animate={{ x: [0, 5, 0] }}
                            transition={{ duration: 1, repeat: Infinity }}
                          >
                            <Send className="h-4 w-4" />
                          </motion.div>
                        )}
                      </span>
                    </Button>
                  </motion.div>
                  
                  {/* Success/Error Messages */}
                  {submitStatus === "success" && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-green-600 text-sm mt-2 text-center font-medium"
                    >
                      🎉 Message sent successfully! I'll get back to you soon.
                    </motion.p>
                  )}
                  {submitStatus === "error" && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-600 text-sm mt-2 text-center font-medium"
                    >
                      ❌ Oops! Something went wrong. Please try again.
                    </motion.p>
                  )}
                </motion.div>

                {/* Fun motivational messages */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="text-center text-xs text-muted-foreground space-y-1 pt-2"
                >
                  <motion.p
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="flex items-center justify-center gap-1"
                  >
                    <Heart className="h-3 w-3 text-red-500 fill-red-500" />
                    I read every message personally!
                  </motion.p>
                </motion.div>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Fun stats or social proof */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8 }}
          className="mt-12 flex justify-center gap-8 text-center"
        >
          <div className="space-y-1">
            <motion.div 
              className="text-2xl font-bold text-primary"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              &lt; 24h
            </motion.div>
            <div className="text-xs text-muted-foreground">Response Time</div>
          </div>
          <div className="space-y-1">
            <motion.div 
              className="text-2xl font-bold text-primary"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            >
              100%
            </motion.div>
            <div className="text-xs text-muted-foreground">Read Rate</div>
          </div>
          <div className="space-y-1">
            <motion.div 
              className="text-2xl font-bold text-primary"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 1 }}
            >
              ∞
            </motion.div>
            <div className="text-xs text-muted-foreground">Ideas Welcome</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
