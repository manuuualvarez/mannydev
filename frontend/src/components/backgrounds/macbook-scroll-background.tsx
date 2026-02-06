'use client';

import { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { cn } from '@/lib/utils';

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface MacBookScrollBackgroundProps {
  className?: string;
}

export function MacBookScrollBackground({ className }: MacBookScrollBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const macbookRef = useRef<HTMLDivElement>(null);
  const lidRef = useRef<HTMLDivElement>(null);
  const screenRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || prefersReducedMotion || !containerRef.current || !lidRef.current) return;

    const ctx = gsap.context(() => {
      // Animate the MacBook lid opening based on scroll
      gsap.fromTo(
        lidRef.current,
        {
          rotateX: -90, // Closed position
        },
        {
          rotateX: 0, // Open position
          ease: 'none',
          scrollTrigger: {
            trigger: document.body,
            start: 'top top',
            end: '30% top', // Opens fully by 30% scroll
            scrub: 1,
          },
        }
      );

      // Fade in the screen content as lid opens
      gsap.fromTo(
        screenRef.current,
        {
          opacity: 0,
        },
        {
          opacity: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: document.body,
            start: '10% top',
            end: '30% top',
            scrub: 1,
          },
        }
      );

      // Scale down and move MacBook as user scrolls further
      gsap.to(macbookRef.current, {
        scale: 0.6,
        y: '-20%',
        opacity: 0.3,
        ease: 'none',
        scrollTrigger: {
          trigger: document.body,
          start: '30% top',
          end: '80% top',
          scrub: 1,
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, [isClient, prefersReducedMotion]);

  if (!isClient) return null;

  // Static position for reduced motion
  const staticStyles = prefersReducedMotion
    ? { transform: 'rotateX(0deg)' }
    : { transform: 'rotateX(-90deg)' };

  return (
    <div
      ref={containerRef}
      className={cn(
        'fixed inset-0 pointer-events-none z-0 overflow-hidden',
        'flex items-end justify-center pb-20',
        'opacity-50',
        className
      )}
      style={{ perspective: '2000px' }}
    >
      {/* MacBook Container */}
      <div
        ref={macbookRef}
        className="relative w-[800px] h-[500px] max-w-[90vw]"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* MacBook Lid (Screen) */}
        <div
          ref={lidRef}
          className="absolute inset-x-0 top-0 h-[320px] origin-bottom"
          style={{
            transformStyle: 'preserve-3d',
            ...staticStyles,
          }}
        >
          {/* Screen bezel - Metallic aluminum appearance */}
          <div
            className={cn(
              'absolute inset-0 rounded-t-xl',
              'border shadow-2xl',
              // Light mode: Silver MacBook with metallic gradient (#E8E8E8 -> #707070)
              'bg-[linear-gradient(180deg,#E8E8E8_0%,#C4C4C4_20%,#A8A8A8_50%,#8C8C8C_80%,#707070_100%)]',
              'border-[#B4B4B4]/50',
              // Dark mode: Space Gray with lighter edges for contrast (#5A5A5A -> #1A1A1A)
              'dark:bg-[linear-gradient(180deg,#5A5A5A_0%,#4A4A4A_20%,#3A3A3A_50%,#2A2A2A_80%,#1A1A1A_100%)]',
              'dark:border-[#646464]/50'
            )}
            style={{
              boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.1), 0 1px 3px rgba(0,0,0,0.1)',
            }}
          >
            {/* Screen */}
            <div
              ref={screenRef}
              className={cn(
                'absolute inset-3 rounded-lg overflow-hidden',
                // IDE theme - lighter to not obscure page content
                'bg-gradient-to-br from-zinc-800 via-zinc-900 to-zinc-800'
              )}
              style={{ opacity: prefersReducedMotion ? 1 : 0 }}
            >
              {/* Screen content - code/IDE effect (always dark theme) */}
              <div className="absolute inset-0 p-4 font-mono text-xs overflow-hidden">
                <div className="space-y-1">
                  <div className="flex gap-2">
                    <span className="text-purple-400">const</span>
                    <span className="text-blue-400">developer</span>
                    <span className="text-white">=</span>
                    <span className="text-yellow-400">{`{`}</span>
                  </div>
                  <div className="pl-4">
                    <span className="text-green-400">name:</span>
                    <span className="text-orange-400"> &apos;Manuel Alvarez&apos;</span>,
                  </div>
                  <div className="pl-4">
                    <span className="text-green-400">skills:</span>
                    <span className="text-cyan-400"> [&apos;iOS&apos;, &apos;Web&apos;, &apos;Automation&apos;]</span>,
                  </div>
                  <div className="pl-4">
                    <span className="text-green-400">passion:</span>
                    <span className="text-orange-400"> &apos;Building digital products&apos;</span>
                  </div>
                  <div className="text-yellow-400">{`}`}</div>
                </div>
              </div>

              {/* Glowing effect on screen */}
              <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent" />
            </div>

            {/* Camera notch */}
            <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full border bg-zinc-950 border-zinc-700">
              <div className="absolute inset-0.5 rounded-full bg-zinc-800" />
            </div>
          </div>

          {/* Screen back (visible when closed) */}
          <div
            className={cn(
              'absolute inset-0 rounded-t-xl backface-hidden',
              // Light mode: Silver back
              'bg-[linear-gradient(180deg,#D0D0D0_0%,#B0B0B0_50%,#909090_100%)]',
              // Dark mode: Space Gray back
              'dark:bg-[linear-gradient(180deg,#4A4A4A_0%,#3A3A3A_50%,#2A2A2A_100%)]'
            )}
            style={{
              transform: 'rotateY(180deg)',
              backfaceVisibility: 'hidden',
            }}
          >
            {/* Apple logo placeholder */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-14 rounded-lg bg-white/20 dark:bg-white/10" />
            </div>
          </div>
        </div>

        {/* MacBook Base (Keyboard) - Metallic aluminum */}
        <div
          className={cn(
            'absolute inset-x-0 bottom-0 h-[180px] rounded-b-xl border shadow-2xl',
            // Light mode: Silver MacBook base with metallic gradient
            'bg-[linear-gradient(180deg,#D8D8D8_0%,#B8B8B8_30%,#A0A0A0_70%,#888888_100%)]',
            'border-[#B4B4B4]/50',
            // Dark mode: Space Gray base
            'dark:bg-[linear-gradient(180deg,#4A4A4A_0%,#3A3A3A_30%,#2A2A2A_70%,#1A1A1A_100%)]',
            'dark:border-[#646464]/50'
          )}
          style={{
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15), 0 2px 8px rgba(0,0,0,0.15)',
          }}
        >
          {/* Keyboard area */}
          <div className="absolute inset-4 rounded-lg bg-zinc-900/80">
            {/* Keyboard keys (simplified) */}
            <div className="grid grid-cols-12 gap-1 p-3">
              {Array.from({ length: 48 }).map((_, i) => (
                <div
                  key={i}
                  className="h-3 rounded-sm border bg-zinc-800 border-zinc-700/50"
                />
              ))}
            </div>

            {/* Trackpad */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-40 h-24 rounded-lg border bg-zinc-800 border-zinc-700/30" />
          </div>

          {/* Front edge notch */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-1.5 rounded-t-full bg-zinc-600" />
        </div>

        {/* Reflection/glow under MacBook */}
        <div
          className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-[60%] h-4 rounded-full blur-xl bg-primary/20"
        />
      </div>
    </div>
  );
}
