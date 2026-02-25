import StatusRing from "./StatusRing"
const StatusAvatar = ({
  src,
  alt,
  seen,
  count,
  size = 46,
  onClick,
  duration,
  currentIndex,
}) => (
  <div
    className="relative flex-shrink-0 cursor-pointer"
    style={{ width: size, height: size }}
    onClick={onClick}
  >
    <StatusRing
      seen={seen}
      count={count}
      size={size}
      duration={duration}
      currentIndex={currentIndex}
    />

    <div
      className="absolute rounded-full overflow-hidden bg-muted"
      style={{ inset: 4 }}
    >
      {src ? (
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-muted-foreground font-semibold text-sm uppercase">
          {alt?.[0] ?? "?"}
        </div>
      )}
    </div>
  </div>
);

export default StatusAvatar