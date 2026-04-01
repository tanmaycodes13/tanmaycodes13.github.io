"use client"

import { motion } from "framer-motion";
import { Briefcase, Rocket, TrendingUp, Users, Code, Award } from "lucide-react";

interface TimelineEvent {
  year: string;
  role: string;
  company: string;
  type: "milestone" | "achievement" | "current";
  icon: any;
  highlights: string[];
  impact?: string;
}

const timeline: TimelineEvent[] = [
  {
    year: "Jun 2025 - Present",
    role: "Senior Software Engineer",
    company: "Okta",
    type: "current",
    icon: Award,
    highlights: [
      "Built an AI-powered CI/CD log summarization system using Amazon Bedrock, automatically analyzing and summarizing pipeline logs across 500+ daily builds"
      "Optimized LLM inference cost by integrating LiteLLM for request routing and budget control and applying Drain-based log template parsing, reducing token usage by  ̃60%"
      "Optimized database performance: 50% reduction in aggregation pipeline time, 60% improvement in scan/return ratios",
      "Migrated authentication to OAuth 2.0/OIDC framework using Okta with SAML Bearer assertion",
      "Deployed SonarQube from scratch into CI/CD pipeline, enforcing code quality gates",
      "Resolved critical security vulnerability with dynamic secret-masking solution"
    ],
    impact: "Performance & Security Leader"
  },
  {
    year: "Jul 2024 - Jun 2025",
    role: "Founding Software Engineer",
    company: "AlgoTest (YC22)",
    type: "achievement",
    icon: Rocket,
    highlights: [
      "Built automated trading infrastructure from scratch using Terraform",
      "Migrated 30% of deployments to Docker Compose & Kubernetes for enhanced scalability",
      "Designed CI/CD pipelines separating backend/frontend workflows",
      "Implemented complete monitoring stack: Prometheus, Grafana & Loki for end-to-end observability",
      "Integrated Broker API enabling seamless cross-product order execution"
    ],
    impact: "0 → 1 Product Launch 🚀"
  },
  {
    year: "Jan 2022 - Jun 2024",
    role: "Software Engineer",
    company: "Zenefits",
    type: "milestone",
    icon: TrendingUp,
    highlights: [
      "Migrated monolith to microservices using gRPC with strangler pattern",
      "Led IDP feature development using Django Rest Framework & MySQL Aurora",
      "Built streamlined remote development container environment for microservices",
      "Designed automated code coverage system across entire monorepository",
      "Migrated test orchestration from EC2 to Amazon ECS with RDS"
    ],
    impact: "Platform Transformation"
  }
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3,
      delayChildren: 0.2
    }
  }
};

const item = {
  hidden: { opacity: 0, x: -50 },
  show: { opacity: 1, x: 0 }
};

export function CareerTimeline() {
  return (
    <section id="journey" className="py-16 md:py-24 bg-gradient-to-b from-background to-muted/30 relative overflow-hidden">
      {/* Animated Background */}
      <motion.div
        animate={{
          rotate: 360,
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 40,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute -top-1/2 -left-1/4 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl -z-10"
      />
      
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center justify-center space-y-4 text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 rounded-lg bg-secondary px-4 py-2 text-sm font-semibold text-secondary-foreground">
            <Award className="h-4 w-4" />
            My Journey
          </div>
          <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Career Timeline</h2>
          <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
            From building enterprise platforms to taking AlgoTest from 0→1 as a Founding Engineer
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
          className="relative"
        >
          {/* Timeline Line */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-primary/50 to-transparent -translate-x-1/2 hidden sm:block" />

          <div className="space-y-12">
            {timeline.map((event, index) => {
              const Icon = event.icon;
              const isEven = index % 2 === 0;
              
              return (
                <motion.div
                  key={index}
                  variants={item}
                  className={`relative flex flex-col sm:flex-row gap-8 items-start ${
                    isEven ? 'md:flex-row-reverse' : ''
                  }`}
                >
                  {/* Timeline Dot */}
                  <div className="absolute left-8 md:left-1/2 -translate-x-1/2 hidden sm:flex items-center justify-center">
                    <motion.div
                      whileHover={{ scale: 1.2, rotate: 360 }}
                      transition={{ duration: 0.5 }}
                      className={`w-16 h-16 rounded-full flex items-center justify-center z-10 ${
                        event.type === 'current'
                          ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/50'
                          : event.type === 'achievement'
                          ? 'bg-secondary text-secondary-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      <Icon className="h-7 w-7" />
                    </motion.div>
                  </div>

                  {/* Content Card */}
                  <motion.div
                    whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)" }}
                    className={`flex-1 ${isEven ? 'md:text-right' : ''} sm:ml-24 md:ml-0`}
                  >
                    <div className={`inline-block ${isEven ? 'md:ml-auto' : ''}`}>
                      <div className={`bg-card border border-primary/20 rounded-lg p-6 shadow-md hover:shadow-xl transition-shadow max-w-lg ${
                        event.type === 'current' ? 'ring-2 ring-primary/50' : ''
                      }`}>
                        {/* Header */}
                        <div className={`flex items-start gap-3 mb-4 ${isEven ? 'md:flex-row-reverse' : ''}`}>
                          <div className="sm:hidden flex-shrink-0">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                              event.type === 'current'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-secondary text-secondary-foreground'
                            }`}>
                              <Icon className="h-6 w-6" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-2 ${
                              event.type === 'current'
                                ? 'bg-primary/20 text-primary'
                                : 'bg-secondary/50 text-secondary-foreground'
                            }`}>
                              {event.year}
                            </div>
                            <h3 className="text-xl font-bold text-foreground">{event.role}</h3>
                            <p className="text-sm text-muted-foreground mt-1">{event.company}</p>
                            {event.impact && (
                              <div className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary">
                                <TrendingUp className="h-3 w-3" />
                                {event.impact}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Highlights */}
                        <ul className={`space-y-2 ${isEven ? 'md:text-right' : ''}`}>
                          {event.highlights.map((highlight, i) => (
                            <motion.li
                              key={i}
                              initial={{ opacity: 0, x: isEven ? 20 : -20 }}
                              whileInView={{ opacity: 1, x: 0 }}
                              viewport={{ once: true }}
                              transition={{ delay: i * 0.1 }}
                              className="text-sm text-muted-foreground flex items-start gap-2"
                            >
                              <span className={`text-primary flex-shrink-0 ${isEven ? 'md:order-2' : ''}`}>
                                •
                              </span>
                              <span>{highlight}</span>
                            </motion.li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>

          {/* Bottom Gradient Fade */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-muted/30 to-transparent pointer-events-none" />
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          {[
            { label: "Years Experience", value: "4+" },
            { label: "Companies", value: "3" },
            { label: "Tech Stack", value: "15+" },
            { label: "0→1 Products", value: "1" }
          ].map((stat, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05 }}
              className="bg-card border border-primary/10 rounded-lg p-6 text-center"
            >
              <div className="text-3xl font-bold text-primary mb-2">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
