export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row justify-between items-center">
          <div className="mb-4 lg:mb-0">
            <a href="#hero" className="text-xl font-bold text-white">
              Portfolio<span className="text-green-500">.</span>
            </a>
          </div>
          
          <div className="mb-4 lg:mb-0">
            <ul className="flex flex-wrap justify-center gap-6">
              <li>
                <a href="#about" className="text-gray-300 hover:text-white transition-colors">
                  About
                </a>
              </li>
              <li>
                <a href="#skills" className="text-gray-300 hover:text-white transition-colors">
                  Skills
                </a>
              </li>
              <li>
                <a href="#projects" className="text-gray-300 hover:text-white transition-colors">
                  Projects
                </a>
              </li>
              <li>
                <a href="#contact" className="text-gray-300 hover:text-white transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <p className="text-gray-400 text-sm">© {new Date().getFullYear()} John Doe. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
