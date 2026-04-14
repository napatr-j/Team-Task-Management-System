import GetStartedCta from "@/components/landing-page/GetStartedCta";

const year = 2026;

export default function FooterCTA() {
  return (
    <section id="get-started" className="py-7">
      <div className="rounded-[32px] border border-[#ECECEC] bg-white p-10 text-center shadow-[0_30px_80px_rgba(17,24,39,0.08)]">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#656D3F]">Ready to sync your team?</p>
        <h2 className="mt-5 text-4xl font-semibold tracking-tight text-[#1A1A1A] sm:text-5xl">Collaborate faster, stay aligned, and deliver together.</h2>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-[#5E5E5E]">Start a free workspace with TeamSync and give your team a modern home for planning, execution, and visibility.</p>
        <div className="mt-8 flex items-center justify-center">
          <GetStartedCta className="animate-pulse" />
        </div>
        <footer className="mt-12 border-t border-[#ECECEC] pt-6 text-sm text-[#6F6F6F]">
          <p>TeamSync © { year } · Modern team task management by TeamSync</p>
        </footer>
      </div>
    </section>
  );
}
