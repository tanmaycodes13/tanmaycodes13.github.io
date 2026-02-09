"use client"

import { motion } from "framer-motion";
import { 
  SiPython, SiC, SiCplusplus, SiDart, SiTypescript,
  SiDjango, SiGraphql, SiExpress, SiLinux, SiJenkins, SiGithub,
  SiTerraform, SiAnsible, SiPacker, SiDocker, SiAmazon,
  SiReact, SiKubernetes, SiPrometheus, SiGrafana, SiFlask
} from "react-icons/si";
import { Coffee } from "lucide-react"; // Using as Java substitute

const techStack = [
  // Languages
  { icon: SiPython, name: "Python", color: "#3776AB" },
  { icon: SiC, name: "C", color: "#A8B9CC" },
  { icon: SiCplusplus, name: "C++", color: "#00599C" },
  { icon: SiDart, name: "Dart", color: "#0175C2" },
  { icon: Coffee, name: "Java", color: "#007396" },
  { icon: SiTypescript, name: "TypeScript", color: "#3178C6" },
  
  // Technologies/Frameworks
  { icon: SiDjango, name: "Django", color: "#092E20" },
  { icon: SiGraphql, name: "GraphQL", color: "#E10098" },
  { icon: SiExpress, name: "Express", color: "#000000" },
  { icon: SiLinux, name: "Linux", color: "#FCC624" },
  { icon: SiJenkins, name: "Jenkins", color: "#D24939" },
  { icon: SiGithub, name: "GitHub", color: "#181717" },
  { icon: SiTerraform, name: "Terraform", color: "#7B42BC" },
  { icon: SiAnsible, name: "Ansible", color: "#EE0000" },
  { icon: SiPacker, name: "Packer", color: "#02A8EF" },
  { icon: SiDocker, name: "Docker", color: "#2496ED" },
  { icon: SiAmazon, name: "AWS", color: "#FF9900" },
  { icon: SiReact, name: "React", color: "#61DAFB" },
  { icon: SiKubernetes, name: "Kubernetes", color: "#326CE5" },
  { icon: SiPrometheus, name: "Prometheus", color: "#E6522C" },
  { icon: SiGrafana, name: "Grafana", color: "#F46800" },
  { icon: SiFlask, name: "Flask", color: "#000000" },
];

export function TechStack() {
  // Split into 3 rows
  const rows = 3;
  const itemsPerRow = Math.ceil(techStack.length / rows);
  
  const getRow = (rowIndex: number) => {
    const start = rowIndex * itemsPerRow;
    const end = Math.min(start + itemsPerRow, techStack.length);
    return techStack.slice(start, end);
  };

  return (
    <div className="absolute right-32 xl:right-40 top-1/2 -translate-y-1/2 z-30 w-[400px] overflow-hidden hidden xl:block">
      <div className="space-y-3 py-4 px-2">
        {[0, 1, 2].map((rowIndex) => {
          const rowItems = getRow(rowIndex);
          // Duplicate items for seamless loop
          const duplicatedItems = [...rowItems, ...rowItems, ...rowItems];
          
          return (
            <div key={rowIndex} className="relative overflow-hidden">
              <motion.div
                animate={{
                  x: [0, -100 * rowItems.length],
                }}
                transition={{
                  duration: 20 + rowIndex * 3, // Different speeds for each row
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="flex gap-3"
              >
                {duplicatedItems.map((tech, index) => {
                  const Icon = tech.icon;
                  
                  return (
                    <motion.div
                      key={`${tech.name}-${index}`}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{
                        delay: index * 0.05,
                        type: "spring",
                      }}
                      whileHover={{ 
                        scale: 1.2,
                        zIndex: 50,
                        transition: { duration: 0.2 }
                      }}
                      className="flex-shrink-0 group cursor-pointer relative"
                    >
                      <motion.div
                        animate={{
                          y: [0, -5, 0],
                        }}
                        transition={{
                          duration: 2 + (index % 3),
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: index * 0.1,
                        }}
                      >
                        <div 
                          className="w-[85px] h-[85px] rounded-xl bg-background/90 backdrop-blur-sm border-2 border-primary/20 flex items-center justify-center shadow-md group-hover:shadow-xl group-hover:border-primary/60 transition-all"
                          style={{
                            backgroundColor: `${tech.color}08`
                          }}
                        >
                          <Icon 
                            className="w-10 h-10" 
                            style={{ color: tech.color }}
                          />
                        </div>
                        
                        {/* Tooltip */}
                        <div className="absolute left-1/2 -translate-x-1/2 -top-12 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                          <div className="bg-foreground text-background px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xl">
                            {tech.name}
                          </div>
                          <div className="absolute left-1/2 -translate-x-1/2 top-full w-2 h-2 bg-foreground transform rotate-45 -translate-y-1" />
                        </div>
                        
                        {/* Glow effect */}
                        <div
                          className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity -z-10 blur-lg"
                          style={{
                            backgroundColor: `${tech.color}40`,
                          }}
                        />
                      </motion.div>
                    </motion.div>
                  );
                })}
              </motion.div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
