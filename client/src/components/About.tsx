export default function About() {
  return (
    <section id="about" className="py-16 lg:py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold mb-2">About Me</h2>
          <div className="w-20 h-1 bg-green-500 mx-auto mb-6"></div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Get to know more about my background, experience, and passion for creating innovative digital solutions.
          </p>
        </div>
        
        <div className="flex flex-col lg:flex-row items-center">
          <div className="lg:w-2/5 mb-8 lg:mb-0 animate-on-scroll">
            <img 
              src="https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80" 
              alt="Professional portrait" 
              className="rounded-lg shadow-lg mx-auto" 
              width="400" 
              height="500"
            />
          </div>
          <div className="lg:w-3/5 lg:pl-16 animate-on-scroll">
            <h3 className="text-2xl font-semibold mb-4">Who I Am</h3>
            <p className="text-gray-600 mb-4">
              I'm a passionate full-stack developer with 5+ years of experience creating web applications and solutions. I specialize in building responsive, user-friendly websites that deliver exceptional user experiences.
            </p>
            
            <h3 className="text-2xl font-semibold mb-4 mt-8">My Journey</h3>
            <p className="text-gray-600 mb-4">
              My journey into development began during college where I discovered my passion for coding. Since then, I've worked with various technologies and frameworks to deliver high-quality applications for clients across different industries.
            </p>
            
            <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">5+</div>
                <div className="text-gray-600">Years Experience</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">50+</div>
                <div className="text-gray-600">Projects Completed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">30+</div>
                <div className="text-gray-600">Happy Clients</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">10+</div>
                <div className="text-gray-600">Awards Won</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
