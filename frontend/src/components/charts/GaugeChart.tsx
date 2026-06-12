interface GaugeChartProps {
  value: number; // 0 to 100
  title: string;
  color?: string;
}

export function GaugeChart({ value, title, color = '#4F8CFF' }: GaugeChartProps) {
  const radius = 50;
  const strokeWidth = 10;
  const normalizedValue = Math.min(Math.max(value, 0), 100);
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normalizedValue / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="relative h-32 w-32 flex items-center justify-center">
        {/* SVG Circular progress track and indicator */}
        <svg className="h-full w-full transform -rotate-90">
          <circle
            cx="64"
            cy="64"
            r={radius}
            stroke="rgba(255, 255, 255, 0.05)"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <circle
            cx="64"
            cy="64"
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-white leading-none">{Math.round(normalizedValue)}%</span>
          <span className="text-[10px] text-gray-500 font-semibold uppercase mt-1 tracking-wider">{title}</span>
        </div>
      </div>
    </div>
  );
}
