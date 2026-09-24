export default function LoadingSkeleton({ count = 6 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="skeleton-card">
          <div className="skeleton-image skeleton"></div>
          <div className="skeleton-content">
            <div className="skeleton skeleton-title"></div>
            <div className="skeleton skeleton-text"></div>
            <div className="skeleton skeleton-text" style={{ width: '60%' }}></div>
            <div className="skeleton skeleton-button"></div>
          </div>
        </div>
      ))}
    </>
  );
}
