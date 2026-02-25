import { useEffect, useState } from "react";

const StatusRing = ({
  seen,
  count = 1,
  size = 46,
  duration = 5000,
  currentIndex = 0,
}) => {
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const segmentLength = circumference / count;
  const gap = 6;
  const dashLength = segmentLength - gap;

  const [progress, setProgress] = useState(0);

  // Animate current segment
  useEffect(() => {
    let start = null;
    let animationFrame;

    const animate = (timestamp) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const percentage = Math.min(elapsed / duration, 1);
      setProgress(percentage);

      if (percentage < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    setProgress(0);
    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [currentIndex, duration]);

  return (
    <svg
      width={size}
      height={size}
      className="absolute top-0 left-0 -rotate-90"
    >
      {Array.from({ length: count }).map((_, i) => {
        const offset = segmentLength * i;

        let strokeDasharray = `${dashLength} ${circumference}`;
        let strokeDashoffset = -offset;

        // Completed stories
        if (i < currentIndex) {
          strokeDasharray = `${dashLength} ${circumference}`;
        }

        // Current story (animated)
        if (i === currentIndex) {
          strokeDasharray = `${
            dashLength * progress
          } ${circumference}`;
        }

        return (
          <circle
            key={i}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            stroke={seen ? "#9ca3af" : "#25d366"}
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        );
      })}
    </svg>
  );
};

export default StatusRing;