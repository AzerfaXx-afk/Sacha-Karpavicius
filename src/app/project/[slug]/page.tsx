"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Navbar from "@/components/navbar";
import { projectsData, getProjectBySlug } from "@/data/projects";
import { useSiteContext } from "@/context/site-context";

gsap.registerPlugin(ScrollTrigger);

export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const { hasEnteredSite, isPlaying, toggleAudio, playClickSfx, playHoverSfx } = useSiteContext();

  const project = getProjectBySlug(slug) || projectsData[0];
  const currentIndex = projectsData.findIndex((p) => p.slug === project.slug);
  const nextProject = projectsData[(currentIndex + 1) % projectsData.length];

  const [lang, setLang] = useState<"fr" | "en">("fr");

  const heroRef = useRef<HTMLDivElement>(null);
  const heroImgRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const metaRef = useRef<HTMLDivElement>(null);

  // Horizontal Scrollytelling Refs
  const scrollySectionRef = useRef<HTMLDivElement>(null);
  const horizontalTrackRef = useRef<HTMLDivElement>(null);

  // 1. If F5 / refresh happened directly on project page, redirect to '/' so preloader plays
  useEffect(() => {
    if (!hasEnteredSite) {
      router.replace("/");
    }
  }, [hasEnteredSite, router]);

  useEffect(() => {
    window.scrollTo(0, 0);

    // Language detection
    if (typeof window !== "undefined" && navigator) {
      const userLang = navigator.language || (navigator as Navigator & { userLanguage?: string }).userLanguage;
      if (userLang && !userLang.toLowerCase().startsWith("fr")) {
        setLang("en");
      }
    }

    const ctx = gsap.context(() => {
      // Hero reveal
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(
        heroImgRef.current,
        { scale: 1.08, opacity: 0.8 },
        { scale: 1, opacity: 1, duration: 1.5, ease: "power3.out" }
      );

      tl.fromTo(
        titleRef.current,
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.1 },
        "-=1.0"
      );

      // Horizontal Scrollytelling Carousel
      const track = horizontalTrackRef.current;
      const section = scrollySectionRef.current;

      if (track && section && window.innerWidth > 768) {
        const totalScrollWidth = track.scrollWidth - window.innerWidth + 120;

        gsap.to(track, {
          x: -totalScrollWidth,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            pin: true,
            scrub: 1.2,
            start: "top top",
            end: () => `+=${totalScrollWidth}`,
            invalidateOnRefresh: true,
          },
        });
      }
    });

    return () => ctx.revert();
  }, [slug]);

  if (!hasEnteredSite) {
    return <div className="bg-[#050505] min-h-screen" />;
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white font-inter selection:bg-white selection:text-black">
      {/* Navbar */}
      <Navbar
        showUI={true}
        clickable={true}
        lang={lang}
        onPlayClickSfx={playClickSfx}
        onPlayHoverSfx={playHoverSfx}
      />


      {/* Persistent Contact Link (Bottom Left) -> Smooth transition to #contact on homepage */}
      <div className="fixed bottom-6 left-6 md:bottom-10 md:left-12 z-[100] mix-blend-difference pointer-events-auto">
        <a
          href="/#contact"
          onClick={(e) => {
            e.preventDefault();
            playClickSfx();
            sessionStorage.setItem("scrollToContact", "true");

            const overlay = document.createElement("div");
            overlay.style.position = "fixed";
            overlay.style.inset = "0";
            overlay.style.backgroundColor = "#050505";
            overlay.style.opacity = "0";
            overlay.style.zIndex = "99999";
            overlay.style.transition = "opacity 0.4s ease";
            document.body.appendChild(overlay);

            requestAnimationFrame(() => {
              overlay.style.opacity = "1";
            });

            setTimeout(() => {
              router.push("/");
              setTimeout(() => {
                overlay.style.opacity = "0";
                setTimeout(() => overlay.remove(), 400);
              }, 300);
            }, 400);
          }}
          className="inline-flex items-center gap-1.5 border border-white/20 px-3 py-2 md:px-4 md:py-2.5 rounded-sm hover:bg-white hover:text-black transition-all duration-300 font-inter text-[10px] md:text-[12px] text-white cursor-pointer group"
        >
          {lang === "fr" ? "Contactez-moi" : "Get in touch"}
          <span className="font-mono text-[11px] group-hover:translate-x-1 transition-transform">→</span>
        </a>
      </div>

      {/* ═══════════════════ HERO COVER (EXACT 100VH 100VW NO BLACK BARS) ═══════════════════ */}
      <section ref={heroRef} className="relative w-full h-[100vh] min-h-screen m-0 p-0 overflow-hidden flex flex-col justify-end">
        {/* Fullscreen 100vw x 100vh Image */}
        <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
          <div ref={heroImgRef} className="relative w-full h-full">
            <Image
              src={project.heroImage}
              alt={project.title}
              fill
              priority
              quality={95}
              sizes="100vw"
              className="object-cover object-center w-full h-full min-h-full min-w-full"
            />
            {/* Smooth dark vignette gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/20 to-[#050505]/50" />
          </div>
        </div>

        {/* Hero Meta & Title Overlay */}
        <div className="relative z-10 w-full px-5 md:px-16 pb-20 md:pb-24">
          <div ref={titleRef} className="space-y-4 max-w-6xl">
            <div className="flex flex-wrap items-center gap-3 font-mono text-[11px] md:text-[12px] tracking-[0.3em] text-white/60 uppercase">
              <span>{project.category}</span>
              <span>—</span>
              <span>{project.year}</span>
              <span>—</span>
              <span>{project.client}</span>
            </div>

            <h1 className="font-syne font-bold text-[12vw] md:text-[8vw] leading-[0.85] uppercase tracking-tight text-white drop-shadow-2xl">
              {project.title}
            </h1>

            <p className="font-syne text-[18px] md:text-[26px] text-white/80 font-light max-w-3xl">
              {project.subtitle}
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════ CONCEPT & EXIF BENTO ═══════════════════ */}
      <section className="relative z-10 px-5 md:px-16 py-24 md:py-32 border-t border-white/10 bg-[#070707]">
        <div ref={metaRef} className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-16 items-start">
          {/* Narrative Story */}
          <div className="md:col-span-7 space-y-6">
            <div className="flex items-center gap-3 font-mono text-[10px] md:text-[11px] tracking-[0.3em] text-white/40 uppercase">
              <span>01</span>
              <div className="w-12 h-[1px] bg-white/20" />
              <span>{lang === "fr" ? "Concept & Histoire" : "Concept & Narrative"}</span>
            </div>

            <p className="font-inter text-[16px] md:text-[20px] leading-relaxed text-white/85 font-light">
              {lang === "fr" ? project.descriptionFr : project.descriptionEn}
            </p>
          </div>

          {/* EXIF Specs Bento Card */}
          <div className="md:col-span-5 space-y-8 bg-white/[0.03] border border-white/10 p-6 md:p-8 rounded-xl backdrop-blur-md shadow-2xl">
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <span className="font-mono text-[10px] md:text-[11px] tracking-[0.3em] text-white/40 uppercase">
                02 // EXIF SPECS
              </span>
              <span className="w-2 h-2 rounded-full bg-white/40 animate-pulse" />
            </div>

            <div className="grid grid-cols-2 gap-6 text-[12px] md:text-[13px]">
              <div>
                <span className="block font-mono text-white/40 text-[10px] uppercase tracking-wider mb-1">
                  {lang === "fr" ? "Boîtier" : "Camera"}
                </span>
                <span className="font-medium text-white/90">{project.exif.camera}</span>
              </div>

              <div>
                <span className="block font-mono text-white/40 text-[10px] uppercase tracking-wider mb-1">
                  {lang === "fr" ? "Objectif" : "Lens"}
                </span>
                <span className="font-medium text-white/90">{project.exif.lens}</span>
              </div>

              <div>
                <span className="block font-mono text-white/40 text-[10px] uppercase tracking-wider mb-1">
                  Iso / Ouverture
                </span>
                <span className="font-medium text-white/90">{project.exif.iso} — {project.exif.aperture}</span>
              </div>

              <div>
                <span className="block font-mono text-white/40 text-[10px] uppercase tracking-wider mb-1">
                  {lang === "fr" ? "Vitesse" : "Shutter"}
                </span>
                <span className="font-medium text-white/90">{project.exif.shutterSpeed}</span>
              </div>

              <div>
                <span className="block font-mono text-white/40 text-[10px] uppercase tracking-wider mb-1">
                  {lang === "fr" ? "Lieu" : "Location"}
                </span>
                <span className="font-medium text-white/90">{project.exif.location}</span>
              </div>

              <div>
                <span className="block font-mono text-white/40 text-[10px] uppercase tracking-wider mb-1">
                  Date
                </span>
                <span className="font-medium text-white/90">{project.exif.date}</span>
              </div>
            </div>

            {/* Credits Section */}
            <div className="pt-4 border-t border-white/10 space-y-2">
              <span className="block font-mono text-white/40 text-[10px] uppercase tracking-wider mb-3">
                {lang === "fr" ? "Équipe Créative" : "Creative Team"}
              </span>

              {project.credits.map((c, i) => (
                <div key={i} className="flex justify-between text-[12px] text-white/70">
                  <span className="text-white/40 font-light">{c.role}</span>
                  <span className="font-medium text-white">{c.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ PINNED HORIZONTAL SCROLLYTELLING CAROUSEL ═══════════════════ */}
      <section
        ref={scrollySectionRef}
        className="relative z-10 w-full overflow-hidden bg-[#050505] py-20 md:py-28 border-t border-white/10"
      >
        <div className="px-5 md:px-16 mb-12 flex items-center justify-between">
          <div className="flex items-center gap-3 font-mono text-[10px] md:text-[11px] tracking-[0.3em] text-white/40 uppercase">
            <span>03</span>
            <div className="w-12 h-[1px] bg-white/20" />
            <span>{lang === "fr" ? "Série Éditoriale (Scroll Horizontal)" : "Editorial Gallery (Horizontal Scroll)"}</span>
          </div>

          <span className="hidden md:block font-mono text-[10px] text-white/30 uppercase tracking-widest">
            {lang === "fr" ? "Défiler pour explorer →" : "Scroll to explore →"}
          </span>
        </div>

        {/* Track Container */}
        <div
          ref={horizontalTrackRef}
          className="flex gap-8 md:gap-12 px-5 md:px-16 will-change-transform items-center"
        >
          {project.gallery.map((imgSrc, i) => (
            <div
              key={i}
              className="relative shrink-0 w-[85vw] md:w-[700px] aspect-[4/5] md:aspect-[3/4] rounded-xl overflow-hidden bg-white/[0.02] border border-white/10 group shadow-2xl"
            >
              <Image
                src={imgSrc}
                alt={`${project.title} Shot ${i + 1}`}
                fill
                sizes="(max-width: 768px) 85vw, 700px"
                quality={92}
                className="object-cover transition-transform duration-1000 group-hover:scale-105"
              />
              <div className="absolute bottom-6 left-6 z-10 font-mono text-[10px] tracking-widest uppercase text-white/70 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-md border border-white/10">
                SHOT 0{i + 1} // {project.title}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════ PROJET SUIVANT ═══════════════════ */}
      <section className="relative z-10 border-t border-white/10 bg-[#080808]">
        <Link
          href={`/project/${nextProject.slug}`}
          onClick={playClickSfx}
          className="group block relative px-5 md:px-16 py-28 md:py-36 overflow-hidden cursor-pointer"
        >
          <div className="absolute inset-0 bg-white/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

          <div className="relative z-10 flex flex-col items-center text-center space-y-4">
            <span className="font-mono text-[11px] tracking-[0.3em] text-white/40 uppercase">
              {lang === "fr" ? "Projet Suivant" : "Next Project"}
            </span>

            <h3 className="font-syne font-bold text-[8vw] md:text-[5vw] uppercase tracking-tight text-white group-hover:scale-105 transition-transform duration-700">
              {nextProject.title}
            </h3>

            <p className="font-inter text-[12px] md:text-[14px] text-white/50 tracking-widest uppercase">
              {nextProject.category} — {nextProject.year}
            </p>
          </div>
        </Link>
      </section>
    </main>
  );
}
