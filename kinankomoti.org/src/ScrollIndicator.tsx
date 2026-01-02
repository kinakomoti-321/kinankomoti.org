import { useEffect, useState } from "react";

export default function ScrollIndicator() {
  const [thumbStyle, setThumbStyle] = useState<{ height: number; top: number }>({
    height: 0,
    top: 0,
  });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let rafId = 0;
    let hideTimer: number | null = null;

    const update = () => {
      const doc = document.documentElement;
      const scrollTop = doc.scrollTop || document.body.scrollTop;
      const viewportHeight = window.innerHeight;
      const docHeight = doc.scrollHeight;
      const maxScroll = Math.max(1, docHeight - viewportHeight);
      const thumbHeight = Math.max(36, (viewportHeight * viewportHeight) / docHeight);
      const thumbTop = (scrollTop / maxScroll) * (viewportHeight - thumbHeight);

      setThumbStyle({ height: thumbHeight, top: thumbTop });
    };

    const onScroll = () => {
      setIsVisible(true);
      if (hideTimer) {
        window.clearTimeout(hideTimer);
      }
      if (rafId) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = 0;
        update();
      });
      hideTimer = window.setTimeout(() => {
        setIsVisible(false);
      }, 900);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (hideTimer) window.clearTimeout(hideTimer);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div className={`scrollbar-track ${isVisible ? "is-visible" : ""}`} aria-hidden="true">
      <div
        className="scrollbar-thumb"
        style={{ height: `${thumbStyle.height}px`, transform: `translateY(${thumbStyle.top}px)` }}
      />
    </div>
  );
}
