import { useState } from "react";
import { Link, ExternalLink, Github } from "lucide-react";

interface ProjectCategory {
  id: string;
  name: string;
}

interface Project {
  id: string;
  title: string;
  description: string;
  image: string;
  category: string;
  tags: string[];
  links: {
    demo?: string;
    github?: string;
  };
}

export default function Projects() {
  const categories: ProjectCategory[] = [
    { id: "all", name: "All" },
    { id: "web", name: "Web Development" },
    { id: "mobile", name: "Mobile Apps" },
    { id: "design", name: "UI/UX Design" }
  ];

  const projects: Project[] = [
    {
      id: "1",
      title: "E-commerce Website",
      description: "A modern e-commerce platform with product catalog, cart functionality, and payment integration.",
      image: "https://images.unsplash.com/photo-1541462608143-67571c6738dd?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
      category: "web",
      tags: ["React", "Node.js", "MongoDB"],
      links: {
        demo: "#",
        github: "#"
      }
    },
    {
      id: "2",
      title: "Fitness Tracking App",
      description: "A mobile application for tracking workouts, nutrition, and progress toward fitness goals.",
      image: "https://images.unsplash.com/photo-1555774698-0b77e0d5fac6?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
      category: "mobile",
      tags: ["React Native", "Firebase", "Redux"],
      links: {
        demo: "#",
        github: "#"
      }
    },
    {
      id: "3",
      title: "Restaurant Branding",
      description: "Complete brand identity and website design for a high-end restaurant chain.",
      image: "https://images.unsplash.com/photo-1523726491678-bf852e717f6a?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
      category: "design",
      tags: ["UI/UX Design", "Branding", "Figma"],
      links: {
        demo: "#"
      }
    },
    {
      id: "4",
      title: "Blog Platform",
      description: "A custom blogging platform with content management system and user authentication.",
      image: "https://images.unsplash.com/photo-1522542550221-31fd19575a2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
      category: "web",
      tags: ["Vue.js", "Express.js", "PostgreSQL"],
      links: {
        demo: "#",
        github: "#"
      }
    },
    {
      id: "5",
      title: "Travel Companion App",
      description: "A mobile app for travelers to discover, plan and document their journeys with maps integration.",
      image: "https://images.unsplash.com/photo-1533750349088-cd871a92f312?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
      category: "mobile",
      tags: ["Flutter", "Google Maps API", "Firebase"],
      links: {
        demo: "#",
        github: "#"
      }
    },
    {
      id: "6",
      title: "Financial Dashboard",
      description: "UX/UI design for a comprehensive financial analytics dashboard with data visualization.",
      image: "https://images.unsplash.com/photo-1482062364825-616fd23b8fc1?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
      category: "design",
      tags: ["Adobe XD", "Dashboard Design", "Data Viz"],
      links: {
        demo: "#"
      }
    }
  ];
  
  const [activeFilter, setActiveFilter] = useState("all");

  const handleFilterClick = (filterId: string) => {
    setActiveFilter(filterId);
  };

  const filteredProjects = activeFilter === "all" 
    ? projects 
    : projects.filter(project => project.category === activeFilter);

  return (
    <section id="projects" className="py-16 lg:py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold mb-2">My Projects</h2>
          <div className="w-20 h-1 bg-green-500 mx-auto mb-6"></div>
          <p className="text-gray-600 max-w-2xl mx-auto">Take a look at some of my recent work and projects I've completed.</p>
        </div>
        
        {/* Project filters */}
        <div className="flex flex-wrap justify-center gap-4 mb-12 animate-on-scroll">
          {categories.map((category) => (
            <button
              key={category.id}
              data-filter={category.id}
              className={`filter-btn px-5 py-2 rounded-full transition-colors ${
                activeFilter === category.id 
                  ? 'bg-primary text-white' 
                  : 'bg-gray-100 text-gray-800 hover:bg-primary hover:text-white'
              }`}
              onClick={() => handleFilterClick(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>
        
        {/* Project grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 project-grid">
          {filteredProjects.map((project) => (
            <div 
              key={project.id} 
              className="project-item animate-on-scroll" 
              data-category={project.category}
            >
              <div className="bg-gray-50 rounded-lg overflow-hidden shadow-md transition-transform duration-300 hover:-translate-y-2">
                <div className="relative overflow-hidden group">
                  <img 
                    src={project.image} 
                    alt={project.title} 
                    className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center">
                    <div className="p-4 w-full">
                      <div className="flex justify-center gap-3 mb-3">
                        {project.links.demo && (
                          <a 
                            href={project.links.demo} 
                            className="bg-white text-gray-800 hover:bg-primary hover:text-white transition-colors rounded-full p-2"
                            aria-label={`View live demo of ${project.title}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                        {project.links.github && (
                          <a 
                            href={project.links.github} 
                            className="bg-white text-gray-800 hover:bg-primary hover:text-white transition-colors rounded-full p-2"
                            aria-label={`View GitHub repository for ${project.title}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Github className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{project.title}</h3>
                  <p className="text-gray-600 mb-4">{project.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag, index) => (
                      <span 
                        key={index} 
                        className="px-3 py-1 bg-blue-100 text-primary text-sm rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
