import { useState, useEffect } from "react";
import { Link } from "wouter";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className={`bg-white shadow-sm fixed w-full top-0 z-50 transition-shadow ${scrolled ? 'shadow-md' : ''}`}>
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <a href="#hero" className="text-xl font-bold text-primary">
          Portfolio<span className="text-accent">.</span>
        </a>
        
        {/* Mobile menu button */}
        <button 
          id="menu-toggle" 
          className="lg:hidden text-dark focus:outline-none"
          onClick={toggleMobileMenu}
          aria-expanded={mobileMenuOpen}
          aria-label="Toggle navigation menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </button>
        
        {/* Desktop navigation */}
        <nav className="hidden lg:flex space-x-6">
          <a href="#about" className="text-dark hover:text-primary transition-colors">About</a>
          <a href="#skills" className="text-dark hover:text-primary transition-colors">Skills</a>
          <a href="#projects" className="text-dark hover:text-primary transition-colors">Projects</a>
          <a href="#contact" className="text-dark hover:text-primary transition-colors">Contact</a>
        </nav>
      </div>
      
      {/* Mobile navigation menu */}
      <nav 
        id="mobile-menu" 
        className={`${mobileMenuOpen ? 'block' : 'hidden'} bg-white lg:hidden w-full py-2 shadow-md`}
      >
        <div className="container mx-auto px-4 flex flex-col space-y-3">
          <a 
            href="#about" 
            className="text-dark hover:text-primary transition-colors py-2"
            onClick={closeMobileMenu}
          >
            About
          </a>
          <a 
            href="#skills" 
            className="text-dark hover:text-primary transition-colors py-2"
            onClick={closeMobileMenu}
          >
            Skills
          </a>
          <a 
            href="#projects" 
            className="text-dark hover:text-primary transition-colors py-2"
            onClick={closeMobileMenu}
          >
            Projects
          </a>
          <a 
            href="#contact" 
            className="text-dark hover:text-primary transition-colors py-2"
            onClick={closeMobileMenu}
          >
            Contact
          </a>
        </div>
      </nav>
    </header>
  );
}
