export function setupScrollAnimation() {
  const animatedElements = document.querySelectorAll('.animate-on-scroll');
  
  function checkScroll() {
    animatedElements.forEach(element => {
      const elementPosition = element.getBoundingClientRect().top;
      const windowHeight = window.innerHeight;
      
      if (elementPosition < windowHeight * 0.85) {
        element.classList.add('is-visible');
      }
    });
  }
  
  window.addEventListener('scroll', checkScroll);
  window.addEventListener('load', checkScroll);
  window.addEventListener('resize', checkScroll);
  
  // Check initial state
  checkScroll();

  // Apply CSS for animations
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes slideUp {
      from { transform: translateY(20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    .animate-fade-in {
      animation: fadeIn 0.5s ease-in-out;
    }
    .animate-slide-up {
      animation: slideUp 0.5s ease-in-out;
    }
    .animate-on-scroll {
      opacity: 0;
      transition: opacity 0.6s ease-out, transform 0.6s ease-out;
      transform: translateY(20px);
    }
    .animate-on-scroll.is-visible {
      opacity: 1;
      transform: translateY(0);
    }
  `;
  document.head.appendChild(style);
}

export function setupBackToTop() {
  const backToTopButton = document.getElementById('back-to-top');
  
  if (!backToTopButton) return () => {};
  
  const handleScroll = () => {
    if (window.pageYOffset > 300) {
      backToTopButton.classList.remove('opacity-0', 'invisible');
      backToTopButton.classList.add('opacity-100', 'visible');
    } else {
      backToTopButton.classList.add('opacity-0', 'invisible');
      backToTopButton.classList.remove('opacity-100', 'visible');
    }
  };
  
  const handleClick = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  
  window.addEventListener('scroll', handleScroll);
  backToTopButton.addEventListener('click', handleClick);
  
  // Cleanup function to remove listeners
  return () => {
    window.removeEventListener('scroll', handleScroll);
    backToTopButton?.removeEventListener('click', handleClick);
  };
}
