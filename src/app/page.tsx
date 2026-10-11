"use client";

import { Suspense } from "react";
import { Navbar } from "@/components/portfolio/navbar";
import { Hero } from "@/components/portfolio/hero";
import { Marquee } from "@/components/portfolio/marquee";
import { Projects } from "@/components/portfolio/projects";
import { About } from "@/components/portfolio/about";
import { Services } from "@/components/portfolio/services";
import { Process } from "@/components/portfolio/process";
import { Certifications } from "@/components/portfolio/certifications";
import { Updates } from "@/components/portfolio/updates";
import { TechLogos } from "@/components/portfolio/tech-logos";
import { Faq } from "@/components/portfolio/faq";
import { Contact } from "@/components/portfolio/contact";
import { Footer } from "@/components/portfolio/footer";
import { ScrollProgress } from "@/components/portfolio/scroll-progress";
import { BackToTop } from "@/components/portfolio/back-to-top";
import { QueryProvider } from "@/components/portfolio/query-provider";

export default function Home() {
  return (
    <QueryProvider>
      <ScrollProgress />
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Marquee />
        <Suspense fallback={null}>
          <Projects />
        </Suspense>
        <About />
        <Services />
        <Process />
        <Certifications />
        <Updates />
        <TechLogos />
        <Faq />
        <Contact />
      </main>
      <Footer />
      <BackToTop />
    </QueryProvider>
  );
}
