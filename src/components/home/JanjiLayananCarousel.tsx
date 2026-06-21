"use client";

import { useRef, useState } from "react";

const slides = [
  { src: "/images/gambarcarosel1.png", alt: "Janji Layanan JKN 1" },
  { src: "/images/gambarcarosel2.png", alt: "Janji Layanan JKN 2" },
  { src: "/images/gambarcarosel3.png", alt: "Janji Layanan JKN 3" },
];

export default function JanjiLayananCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, clientWidth } = scrollRef.current;
    setActiveIndex(Math.round(scrollLeft / clientWidth));
  };

  return (
    <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm bg-white">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar"
      >
        {slides.map((slide, i) => (
          <div key={i} className="min-w-full shrink-0 snap-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={slide.src}
              alt={slide.alt}
              className="w-full h-auto block"
            />
          </div>
        ))}
      </div>

      {/* Dot indicators */}
      <div className="flex justify-center items-center gap-1.5 py-2.5">
        {slides.map((_, i) => (
          <div
            key={i}
            className={`h-2 rounded-full transition-all duration-300 ${
              activeIndex === i ? "w-5 bg-[#184087]" : "w-2 bg-gray-200"
            }`}
          />
        ))}
      </div>
    </div>
  );
}


