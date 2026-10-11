"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { HelpCircle, MessageCircleQuestion } from "lucide-react";
import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { faqs } from "@/lib/content";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/components/portfolio/i18n-provider";

export function Faq() {
  const { t } = useI18n();
  return (
    <section
      id="faq"
      className="scroll-mt-24 border-y border-border/40 bg-card/20 py-20 sm:py-28"
    >
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/60 px-3 py-1 text-xs font-medium text-muted-foreground">
            <HelpCircle className="h-3.5 w-3.5 text-primary" />
            {t.faq.badge}
          </div>
          <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            {t.faq.title}
          </h2>
          <p className="mt-2 text-muted-foreground">{t.faq.subtitle}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-10"
        >
          <Accordion
            type="single"
            collapsible
            defaultValue="item-0"
            className="space-y-3"
          >
            {faqs.map((f, i) => (
              <AccordionItem
                key={f.question}
                value={`item-${i}`}
                className="overflow-hidden rounded-2xl border border-border/60 bg-background/60 px-5 backdrop-blur data-[state=open]:border-primary/40 data-[state=open]:bg-card"
              >
                <AccordionTrigger className="text-left text-sm font-medium hover:no-underline sm:text-base">
                  {f.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                  {f.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-10 flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border/60 bg-background/40 p-6 text-center sm:flex-row sm:justify-between sm:text-left"
        >
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
              <MessageCircleQuestion className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-semibold">{t.faq.ctaTitle}</div>
              <div className="text-xs text-muted-foreground">
                {t.faq.ctaBody}
              </div>
            </div>
          </div>
          <Button asChild size="sm" className="h-9 rounded-full">
            <Link href="#contact">{t.faq.ctaButton}</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
