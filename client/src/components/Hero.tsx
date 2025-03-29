import { Button } from "@/components/ui/button";

export default function Hero() {
  return (
    <section id="hero" className="pt-28 pb-20 lg:pt-40 lg:pb-32 bg-gradient-to-br from-white to-gray-100">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center">
          <div className="lg:w-1/2 animate-fade-in">
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">
              Hi, I'm <span className="text-primary">John Doe</span>
            </h1>
            <p className="text-xl mb-6">Full-stack Developer & Designer</p>
            <p className="text-gray-600 mb-8 max-w-lg">
              Creating exceptional digital experiences with clean code and intuitive design solutions.
            </p>
            <div className="flex space-x-4">
              <a href="#contact">
                <Button className="bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors shadow-md">
                  Get in Touch
                </Button>
              </a>
              <a href="#projects">
                <Button variant="outline" className="border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition-colors">
                  View Projects
                </Button>
              </a>
            </div>
          </div>
          <div className="lg:w-1/2 mt-10 lg:mt-0 animate-slide-up">
            <img 
              src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80" 
              alt="Coding workspace" 
              className="rounded-lg shadow-xl mx-auto" 
              width="600" 
              height="400"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
