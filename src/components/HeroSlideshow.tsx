import { useState, useEffect } from "react";

interface HeroSlideshowProps {
  images: string[];
  alt?: string;
  intervalMs?: number;
  brightness?: string;
}

const KB_ANIMATIONS = [
  "animate-ken-burns-a",
  "animate-ken-burns-b",
  "animate-ken-burns-c",
  "animate-ken-burns-d",
] as const;

export function HeroSlideshow({
  images,
  alt = "",
  intervalMs = 2000,
  brightness = "brightness-90",
}: HeroSlideshowProps) {
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const timer = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % images.length);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [images.length, intervalMs]);

  return (
    <>
      {images.map((src, idx) => (
        <div
          key={idx}
          className="absolute inset-0 transition-opacity duration-[1500ms] ease-in-out"
          style={{
            opacity: idx === activeIdx ? 1 : 0,
            zIndex: idx === activeIdx ? 1 : 0,
          }}
        >
          <img
            src={src}
            alt={alt}
            className={`w-full h-full object-cover ${KB_ANIMATIONS[idx % KB_ANIMATIONS.length]} ${brightness}`}
            style={{ willChange: "transform" }}
          />
        </div>
      ))}
    </>
  );
}
