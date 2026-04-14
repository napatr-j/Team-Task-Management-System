"use client";
import { useScrollReveal } from "./useScrollReveal";

const steps = [
  { title: "User Login", description: "Secure access with role-aware accounts and instant workspace entry." },
  { title: "Role Identification", description: "Automatically assign administrators, managers, and members to the right views." },
  { title: "Task Creation", description: "Create rich tasks with attachments, due dates, and priority labels." },
  { title: "Calendar Scheduling", description: "Schedule work in the calendar and sync deadlines across the team." },
  { title: "Task Execution", description: "Track progress in boards and to-do lists with live updates." },
  { title: "Monitoring", description: "Monitor status, push reminders, and keep every sprint aligned." },
];

export default function HowItWorks() {
  const ref = useScrollReveal<HTMLDivElement>();

  return (
    <section id="how-it-works" ref={ref} className="py-7">
      <div className="mb-10 max-w-3xl" data-reveal>
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#656D3F]">How it Works</p>
        <h2 className="mt-4 text-3xl font-semibold tracking-tight text-[#1A1A1A] sm:text-4xl">A simple workflow that scales with your team.</h2>
      </div>
      <div className="relative rounded-[32px] border border-[#ECECEC] bg-white p-6 shadow-[0_30px_70px_rgba(17,24,39,0.06)] sm:p-10">
        <div className="absolute left-6 top-10 hidden h-[calc(100%-3rem)] w-px bg-[#E2E2D8] md:block" />
        <div className="grid gap-6 lg:grid-cols-2">
          {steps.map((step, index) => (
            <div
              key={step.title}
              data-reveal
              style={{ transitionDelay: `${index * 90}ms` }}
              className="relative overflow-hidden rounded-[28px] border border-[#F0F0EA] bg-[#F8F6F1] p-6 shadow-[0_16px_36px_rgba(17,24,39,0.04)]"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-[#84934A] text-lg font-semibold text-white shadow-sm">
                {index + 1}
              </div>
              <h3 className="mt-5 text-xl font-semibold text-[#1A1A1A]">{step.title}</h3>
              <p className="mt-3 text-sm leading-6 text-[#5E5E5E]">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
