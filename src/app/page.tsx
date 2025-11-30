"use client";

import Image from "next/image";
import { useState, useEffect } from 'react';
import TubeLightNavbar from "@/components/TubeLightNavbar";

export default function Home() {
  const [showVideo, setShowVideo] = useState(false);
  const [showName, setShowName] = useState(false);

  useEffect(() => {
    // Show name first with glow
    const nameTimer = setTimeout(() => {
      setShowName(true);
    }, 500);

    // Then show video background after name appears
    const videoTimer = setTimeout(() => {
      setShowVideo(true);
    }, 1000);

    return () => {
      clearTimeout(nameTimer);
      clearTimeout(videoTimer);
    };
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      {/* Video Background - fades in after name appears */}
      <div className={`absolute inset-0 z-0 transition-opacity duration-2000 ${showVideo ? 'opacity-100' : 'opacity-0'}`}>
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

      {/* Black overlay that fades out */}
      <div className={`absolute inset-0 z-5 bg-black transition-opacity duration-1000 ${showVideo ? 'opacity-0' : 'opacity-100'}`} />

      {/* Tube Light Navbar Component */}
      <TubeLightNavbar />

      {/* Animated Text - fades in with glow */}
      <div className="absolute inset-0 z-10 flex items-center justify-center">
        <div className="text-center">
          <h1 className={`text-4xl md:text-6xl lg:text-7xl font-light text-white transition-all duration-1500 ${showName ? 'opacity-100 scale-100' : 'opacity-0 scale-150'}`} style={{fontFamily: 'var(--font-playfair), Times New Roman, serif', fontStyle: 'italic', textShadow: '0 0 20px rgba(255, 255, 255, 0.8), 0 0 40px rgba(255, 255, 255, 0.6), 0 0 60px rgba(255, 255, 255, 0.4)', animation: showName ? 'glow 3s ease-in-out infinite' : 'none'}}>
            Vatsa Joshi
          </h1>
        </div>
      </div>

      {/* CTA Buttons Container */}
      <div className="absolute bottom-20 md:bottom-60 left-0 right-0 z-10 flex justify-center">
        <div className={`flex flex-col sm:flex-row gap-6 transition-all duration-1500 ${showName ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{transitionDelay: '1s'}}>
          {/* My Resume Button */}
          <a href="https://drive.google.com/file/d/1J6t2WgXHB7nFfEcxyGK7-AvzHEfjfR0b/view" target="_blank" rel="noopener noreferrer" className="group relative px-8 py-4 bg-gradient-to-br from-purple-600/30 via-purple-500/20 to-pink-600/30 backdrop-blur-md border border-purple-400/40 text-white font-semibold rounded-2xl transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/40 overflow-hidden transform-gpu" style={{
            transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg)',
            transformStyle: 'preserve-3d',
            boxShadow: '0 10px 40px -10px rgba(147, 51, 234, 0.4), 0 4px 25px -5px rgba(147, 51, 234, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2), inset 0 -1px 0 rgba(0, 0, 0, 0.1)'
          }}>
            {/* 3D Depth Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute inset-0 rounded-2xl shadow-inner shadow-purple-500/20" />
            
            {/* Floating 3D Layers */}
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:scale-110" />
            <div className="absolute -inset-2 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-2xl blur-lg opacity-0 group-hover:opacity-50 transition-all duration-500" />
            
            <div className="relative z-10 flex items-center gap-3">
              <svg className="w-5 h-5 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12 drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="drop-shadow-md">My Resume</span>
            </div>
            
            {/* 3D Floating Particles */}
            <div className="absolute -top-2 -right-2 w-4 h-4 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-pulse opacity-80 shadow-lg shadow-purple-500/50" />
            <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-purple-300 rounded-full animate-bounce opacity-60" style={{animationDuration: '2s'}} />
            <div className="absolute top-1/2 -right-3 w-3 h-3 bg-gradient-to-r from-pink-300 to-purple-300 rounded-full animate-spin opacity-40" style={{animationDuration: '8s'}} />
          </a>

          {/* LinkedIn Button */}
          <a href="https://www.linkedin.com/in/vatsa-joshi/" target="_blank" rel="noopener noreferrer" className="group relative px-8 py-4 bg-gradient-to-br from-blue-600/30 via-blue-500/20 to-cyan-600/30 backdrop-blur-md border border-blue-400/40 text-white font-semibold rounded-2xl transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/40 overflow-hidden transform-gpu" style={{
            transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg)',
            transformStyle: 'preserve-3d',
            boxShadow: '0 10px 40px -10px rgba(59, 130, 246, 0.4), 0 4px 25px -5px rgba(59, 130, 246, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2), inset 0 -1px 0 rgba(0, 0, 0, 0.1)'
          }}>
            {/* 3D Depth Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute inset-0 rounded-2xl shadow-inner shadow-blue-500/20" />
            
            {/* Floating 3D Layers */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:scale-110" />
            <div className="absolute -inset-2 bg-gradient-to-r from-blue-400/10 to-cyan-400/10 rounded-2xl blur-lg opacity-0 group-hover:opacity-50 transition-all duration-500" />
            
            <div className="relative z-10 flex items-center gap-3">
              <svg className="w-5 h-5 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12 drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
              <span className="drop-shadow-md">LinkedIn</span>
            </div>
            
            {/* 3D Floating Particles */}
            <div className="absolute -top-2 -left-2 w-4 h-4 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full animate-pulse opacity-80 shadow-lg shadow-blue-500/50" />
            <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-blue-300 rounded-full animate-bounce opacity-60" style={{animationDuration: '2.5s'}} />
            <div className="absolute top-1/2 -left-3 w-3 h-3 bg-gradient-to-r from-cyan-300 to-blue-300 rounded-full animate-spin opacity-40" style={{animationDuration: '10s'}} />
          </a>

          {/* Github Button */}
          <a href="https://github.com/Vatsa10" target="_blank" rel="noopener noreferrer" className="group relative px-8 py-4 bg-gradient-to-br from-gray-600/30 via-gray-500/20 to-gray-800/30 backdrop-blur-md border border-gray-400/40 text-white font-semibold rounded-2xl transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-gray-500/40 overflow-hidden transform-gpu" style={{
            transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg)',
            transformStyle: 'preserve-3d',
            boxShadow: '0 10px 40px -10px rgba(107, 114, 128, 0.4), 0 4px 25px -5px rgba(107, 114, 128, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2), inset 0 -1px 0 rgba(0, 0, 0, 0.1)'
          }}>
            {/* 3D Depth Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-400/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute inset-0 rounded-2xl shadow-inner shadow-gray-500/20" />
            
            {/* Floating 3D Layers */}
            <div className="absolute -inset-1 bg-gradient-to-r from-gray-600/20 to-gray-800/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:scale-110" />
            <div className="absolute -inset-2 bg-gradient-to-r from-gray-400/10 to-gray-600/10 rounded-2xl blur-lg opacity-0 group-hover:opacity-50 transition-all duration-500" />
            
            <div className="relative z-10 flex items-center gap-3">
              <svg className="w-5 h-5 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12 drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              <span className="drop-shadow-md">Github</span>
            </div>
            
            {/* 3D Floating Particles */}
            <div className="absolute -top-2 -right-2 w-4 h-4 bg-gradient-to-r from-gray-400 to-gray-600 rounded-full animate-pulse opacity-80 shadow-lg shadow-gray-500/50" />
            <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-gray-300 rounded-full animate-bounce opacity-60" style={{animationDuration: '3s'}} />
            <div className="absolute top-1/2 -right-3 w-3 h-3 bg-gradient-to-r from-gray-300 to-gray-500 rounded-full animate-spin opacity-40" style={{animationDuration: '12s'}} />
          </a>
        </div>
      </div>
    </div>
  );
}
