"use client";

import { useScrollReveal } from "./useScrollReveal";
import {
  CheckSquare,
  Calendar,
  GitBranch,
  BarChart3,
  Bell,
  Users,
  Shield,
} from "lucide-react";

const features = [
  {
    icon: CheckSquare,
    title: "Task Management",
    description:
      "Organize every assignment with custom statuses, labels, and rich cards.",
  },
  {
    icon: Calendar,
    title: "Calendar-Based Scheduling",
    description:
      "Plan deadlines and milestones across days, weeks, and projects.",
  },
  {
    icon: GitBranch,
    title: "Task Dependency System",
    description:
      "Link work items so teams always know what must finish first.",
  },
  {
    icon: BarChart3,
    title: "Workload Visualization",
    description:
      "See team capacity at a glance with meaningful workload summaries.",
  },
  {
    icon: Bell,
    title: "Smart Task Reminder",
    description:
      "Automated nudges keep owners aligned on upcoming work and blockers.",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description:
      "Comments, mentions, and shared boards keep everyone in sync.",
  },
  {
    icon: Shield,
    title: "Role-Based Access Control",
    description:
      "Grant the right permissions to administrators, managers, and members.",
  },
];

export default function FeaturesSection() {
  const ref = useScrollReveal<HTMLDivElement>();

  return (
    <section id="features" ref={ref} className="py-7">
      <div className="mb-10 max-w-3xl" data-reveal>
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#656D3F]">
          Features
        </p>
        <h2 className="mt-4 text-3xl font-semibold tracking-tight text-[#1A1A1A] sm:text-4xl">
          Everything your team needs to move faster.
        </h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {features.map((feature, index) => {
          const Icon = feature.icon;

          return (
            <article
              key={feature.title}
              data-reveal
              style={{ transitionDelay: `${index * 80}ms` }}
              className="group rounded-[24px] border border-transparent bg-white p-6 shadow-[0_20px_60px_rgba(17,24,39,0.06)] transition duration-300 hover:-translate-y-1 hover:border-[#84934A]/20 hover:shadow-[0_25px_60px_rgba(132,147,74,0.12)]"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EEF1E6] text-[#656D3F] shadow-sm">
                <Icon size={22} />
              </div>

              <h3 className="mt-6 text-xl font-semibold text-[#1A1A1A]">
                {feature.title}
              </h3>

              <p className="mt-3 text-sm leading-6 text-[#5D5D5D]">
                {feature.description}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}