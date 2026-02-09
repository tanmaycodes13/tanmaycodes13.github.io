"use client"

import * as React from "react"
import Link from "next/link"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Modal } from "@/components/ui/Modal"
import { cn } from "@/lib/utils"

const navItems = [
  { name: "Home", href: "/" },
  { name: "Journey", href: "#journey" },
  { name: "Contact", href: "#contact" },
]

export function Navbar() {
  const [isScrolled, setIsScrolled] = React.useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)
  const [isResumeOpen, setIsResumeOpen] = React.useState(false)
  
  // Typewriter effect state
  const [logoText, setLogoText] = React.useState("")
  const words = ["DEVOPS", "PLATFORM", "BACKEND", "ENGINEER"]

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Typewriter effect logic
  React.useEffect(() => {
    let currentWordIndex = 0
    let currentTextIndex = 0
    let isDeleting = false
    let timeoutId: NodeJS.Timeout

    const type = () => {
      const currentWord = words[currentWordIndex]
      setLogoText(currentWord.slice(0, currentTextIndex))

      if (!isDeleting && currentTextIndex < currentWord.length) {
        currentTextIndex++
        timeoutId = setTimeout(type, 150)
      } else if (isDeleting && currentTextIndex > 0) {
        currentTextIndex--
        timeoutId = setTimeout(type, 100)
      } else if (!isDeleting && currentTextIndex === currentWord.length) {
        isDeleting = true
        timeoutId = setTimeout(type, 2000) // Pause at end of word
      } else if (isDeleting && currentTextIndex === 0) {
        isDeleting = false
        currentWordIndex = (currentWordIndex + 1) % words.length // Move to next word
        timeoutId = setTimeout(type, 500) // Pause before starting next word
      }
    }

    type()
    return () => clearTimeout(timeoutId)
  }, [])

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isScrolled
            ? "bg-background/80 backdrop-blur-md border-b shadow-sm py-4"
            : "bg-transparent py-6"
        )}
      >
        <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
          <Link href="/" className="text-3xl font-black tracking-[0.2em] text-primary min-w-[180px]">
            {logoText}
            <span className="animate-pulse ml-1">|</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                {item.name}
              </Link>
            ))}
            <Button variant="default" size="sm" onClick={() => setIsResumeOpen(true)}>
              Resume
            </Button>
          </nav>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {/* Mobile Nav */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-background border-b shadow-lg p-4 flex flex-col gap-4">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm font-medium hover:text-primary transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <Button variant="default" size="sm" className="w-full" onClick={() => {
              setIsMobileMenuOpen(false)
              setIsResumeOpen(true)
            }}>
              Resume
            </Button>
          </div>
        )}
      </header>

      {/* Resume Modal */}
      <Modal isOpen={isResumeOpen} onClose={() => setIsResumeOpen(false)} title="Resume">
        <div className="w-full h-[80vh]">
          <iframe 
            src="https://drive.google.com/file/d/1TUznJupEjuBJRqT7WtsOsBUnwGY170da/preview" 
            className="w-full h-full border-0"
            title="Resume"
          />
        </div>
      </Modal>
    </>
  )
}
