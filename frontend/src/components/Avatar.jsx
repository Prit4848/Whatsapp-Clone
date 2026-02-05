const Avatar = ({ src, alt, size = "md", isOnline = false }) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  };

  return (
    <div className="relative flex-shrink-0">
      <img
        src={src}
        alt={alt}
        className={`${sizeClasses[size]} rounded-full object-cover bg-muted`}
      />
      {isOnline && (
        <span className="absolute bottom-0 right-0 w-3 h-3 bg-status-online border-2 border-card rounded-full" />
      )}
    </div>
  );
};

export default Avatar;
