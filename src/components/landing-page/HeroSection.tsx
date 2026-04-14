import DemoMockup from "@/components/landing-page/DemoMockup";
import GetStartedCta from "@/components/landing-page/GetStartedCta";

export default function HeroSection() {
  return (
    <section id="hero" className="relative overflow-hidden rounded-[32px] border border-[#E7E6DD] bg-white/95 px-4 py-12 shadow-[0_35px_90px_rgba(17,24,39,0.08)] sm:px-6 lg:px-10">
      <div className="relative mx-auto flex max-w-6xl flex-col gap-12 xl:gap-20">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.6fr)_minmax(420px,0.4fr)] xl:grid-cols-[minmax(0,0.58fr)_minmax(520px,0.42fr)] items-center">
          <div className="space-y-8">
            <div className="inline-flex rounded-full bg-[#EEF1E6] px-4 py-2 text-sm font-semibold text-[#656D3F]">
              Built for teams that move fast
            </div>
            <div className="space-y-6">
              <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-[-0.04em] text-[#1A1A1A] sm:text-5xl">
                The smarter way to manage your team.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-[#555] sm:text-lg">
                TeamSync combines task boards, calendar planning, and checklist workflows into one collaborative workspace designed for modern teams.
              </p>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <a
                href="#features"
                className="inline-flex items-center justify-center rounded-full border border-[#656D3F]/15 bg-white px-6 py-3 text-sm font-semibold text-[#1A1A1A] transition hover:border-[#84934A] hover:text-[#656D3F]"
              >
                See Features
              </a>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center rounded-full border border-[#656D3F]/15 bg-white px-6 py-3 text-sm font-semibold text-[#1A1A1A] transition hover:border-[#84934A] hover:text-[#656D3F]"
              >
                See How It Works
              </a>
            </div>
            <div className="rounded-3xl border border-[#ECECEC] bg-[#F7F7F2] p-5 text-sm text-[#555] shadow-sm">
              <p className="font-medium text-[#1A1A1A]">Trusted by product, design, and operations teams.</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <span className="rounded-2xl bg-white px-3 py-2 shadow-sm">Weekly planning</span>
                <span className="rounded-2xl bg-white px-3 py-2 shadow-sm">Live team status</span>
                <span className="rounded-2xl bg-white px-3 py-2 shadow-sm">Project ownership</span>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -right-10 top-10 h-32 w-32 rounded-full bg-[#84934A]/10 blur-3xl" />
            <div className="relative rounded-[32px] border border-[#ECECEC] bg-[#ECECEC] p-4 shadow-[0_30px_70px_rgba(17,24,39,0.08)]">
              <DemoMockup />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
