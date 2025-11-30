"use client";

import Image from "next/image";
import TubeLightNavbar from "@/components/TubeLightNavbar";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="h-full w-full object-cover"
        >
          <source src="/purple-beam.mp4" type="video/mp4" />
          <source src="/purple-beam.webm" type="video/webm" />
        </video>
      </div>

      {/* Tube Light Navbar Component */}
      <TubeLightNavbar />

      {/* Animated Text */}
      <div className="absolute inset-0 z-10 flex items-center justify-center">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-light text-white" style={{fontFamily: 'var(--font-playfair), Times New Roman, serif', fontStyle: 'italic', textShadow: '0 0 20px rgba(255, 255, 255, 0.8), 0 0 40px rgba(255, 255, 255, 0.6), 0 0 60px rgba(255, 255, 255, 0.4)', animation: 'glow 3s ease-in-out infinite'}}>
          Vatsa Joshi
        </h1>
      </div>
    </div>
  );
}
