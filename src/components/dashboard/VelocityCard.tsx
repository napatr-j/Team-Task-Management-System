interface VelocityCardProps {
  percent: number;
}

export default function VelocityCard({ percent }: VelocityCardProps) {
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(100, Math.max(0, percent));
  const dashOffset = circumference * (1 - progress / 100);

  return (
    <div className="h-full rounded-[1.5rem] bg-team-surface p-6 shadow-soft">
      <div className="flex h-full flex-col items-center justify-center gap-6 text-center">
        <div className="relative inline-flex h-44 w-44 items-center justify-center rounded-full bg-team-bg">
          <svg className="h-44 w-44" viewBox="0 0 120 120" aria-hidden="true">
            <circle cx="60" cy="60" r="46" stroke="#ECECEC" strokeWidth="10" fill="none" />
            <circle
              cx="60"
              cy="60"
              r="46"
              stroke="#84934A"
              strokeWidth="10"
              strokeLinecap="round"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              transform="rotate(-90 60 60)"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-semibold text-team-text">{progress}%</span>
            <span className="text-sm text-team-text/70">Sprint Done</span>
          </div>
        </div>

        <div className="space-y-1 text-center">
          <p className="text-lg font-semibold text-team-text">Velocity performance</p>
          <p className="text-sm text-team-text/70">Current month progress remains strong.</p>
        </div>
      </div>
    </div>
  );
}
