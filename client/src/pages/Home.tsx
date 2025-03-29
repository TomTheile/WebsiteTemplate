import { useEffect } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Skills from "@/components/Skills";
import Projects from "@/components/Projects";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import { setupScrollAnimation, setupBackToTop } from "@/lib/animations";

export default function Home() {
  useEffect(() => {
    setupScrollAnimation();
    const cleanup = setupBackToTop();
    
    return () => {
      cleanup();
    };
  }, []);

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <About />
        <Skills />
        <Projects />
        <Contact />
      </main>
      <Footer />
      
      {/* Back to top button */}
      <button 
        id="back-to-top" 
        className="fixed bottom-8 right-8 bg-primary text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg opacity-0 invisible transition-all duration-300 hover:bg-blue-600 z-50"
        aria-label="Back to top"
      >
        <i className="fas fa-chevron-up"></i>
      </button>
    </div>
  );
}
