
const StatusRing = ({ seen, count = 1, size = 46 }) => {
  const radius = (size - 4) / 2;
  const circumference = 2 * Math.PI * radius;
  const gap = count > 1 ? 4 : 0;
  const segmentLength = count > 1 ? circumference / count - gap : circumference;

  return (
    <svg width={size} height={size} className="absolute top-0 left-0 -rotate-90">
      {Array.from({ length: count }).map((_, i) => {
        const offset = (circumference / count) * i;
        return (
          <circle
            key={i}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth="2.5"
            stroke={seen ? "var(--color-muted-foreground, #9ca3af)" : "var(--color-primary, #25d366)"}
            strokeDasharray={`${segmentLength} ${circumference - segmentLength}`}
            strokeDashoffset={-offset}
            strokeLinecap="round"
          />
        );
      })}
    </svg>
  );
};

export default StatusRing;
