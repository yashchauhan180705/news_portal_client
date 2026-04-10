const ArticleSkeleton = () => {
  return (
    <div className="card overflow-hidden">
      <div className="skeleton aspect-[16/10]" />
      <div className="p-5 space-y-3">
        <div className="skeleton h-5 w-3/4 rounded" />
        <div className="skeleton h-4 w-full rounded" />
        <div className="flex items-center justify-between pt-1">
          <div className="skeleton h-3 w-24 rounded" />
          <div className="skeleton h-3 w-16 rounded" />
        </div>
      </div>
    </div>
  );
};

const Loader = ({ text = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="relative">
        <div className="w-12 h-12 border-4 border-charcoal-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
      <p className="mt-4 text-charcoal-500 text-sm font-medium">{text}</p>
    </div>
  );
};

export { ArticleSkeleton, Loader };
