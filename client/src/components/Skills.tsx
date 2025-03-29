import { 
  Code,
  Smartphone,
  Layers,
  Server,
  Database,
  PaintBucket
} from "lucide-react";

interface Skill {
  icon: React.ReactNode;
  title: string;
  description: string;
  tags: string[];
}

export default function Skills() {
  const skills: Skill[] = [
    {
      icon: <Code className="h-8 w-8" />,
      title: "Web Development",
      description: "Building responsive, performant websites and web applications using modern technologies.",
      tags: ["HTML5", "CSS3", "JavaScript"]
    },
    {
      icon: <Smartphone className="h-8 w-8" />,
      title: "Responsive Design",
      description: "Creating websites that work seamlessly across all devices, from mobile phones to desktop monitors.",
      tags: ["Mobile First", "Media Queries", "Flexbox"]
    },
    {
      icon: <Layers className="h-8 w-8" />,
      title: "Frontend Frameworks",
      description: "Building interactive user interfaces with modern JavaScript frameworks.",
      tags: ["React", "Vue", "Angular"]
    },
    {
      icon: <Server className="h-8 w-8" />,
      title: "Backend Development",
      description: "Developing robust server-side applications and APIs to power web applications.",
      tags: ["Node.js", "Express", "Python"]
    },
    {
      icon: <Database className="h-8 w-8" />,
      title: "Database Design",
      description: "Creating efficient database schemas and implementations for optimal data storage.",
      tags: ["MongoDB", "MySQL", "PostgreSQL"]
    },
    {
      icon: <PaintBucket className="h-8 w-8" />,
      title: "UI/UX Design",
      description: "Designing intuitive user interfaces and experiences that delight users.",
      tags: ["Figma", "Adobe XD", "Wireframing"]
    }
  ];

  return (
    <section id="skills" className="py-16 lg:py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold mb-2">Skills & Services</h2>
          <div className="w-20 h-1 bg-green-500 mx-auto mb-6"></div>
          <p className="text-gray-600 max-w-2xl mx-auto">Here are the technologies I work with and services I offer to clients.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {skills.map((skill, index) => (
            <div 
              key={index} 
              className="bg-white rounded-lg shadow-md p-8 transition-transform duration-300 hover:-translate-y-2 animate-on-scroll"
            >
              <div className="text-primary text-3xl mb-4">
                {skill.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3">{skill.title}</h3>
              <p className="text-gray-600">{skill.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {skill.tags.map((tag, tagIndex) => (
                  <span 
                    key={tagIndex} 
                    className="px-3 py-1 bg-blue-100 text-primary text-sm rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
