const ChatListSkeleton = () => {
  const skeletonItems = Array(6).fill(null);

  return (
    <div className="flex flex-col">
      {skeletonItems.map((_, index) => (
        <div
          key={index}
          className="flex items-center gap-3 p-3 border-b border-border"
        >
          <div className="w-12 h-12 rounded-full bg-muted animate-skeleton" />
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <div className="w-24 h-4 bg-muted rounded animate-skeleton" />
              <div className="w-12 h-3 bg-muted rounded animate-skeleton" />
            </div>
            <div className="w-40 h-3 bg-muted rounded animate-skeleton" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChatListSkeleton;
