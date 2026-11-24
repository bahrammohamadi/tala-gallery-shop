"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpLeft, ArrowUpRight, Play } from "lucide-react";
import { useLayoutEffect, useRef } from "react";
import { useCart } from "@/components/cart-provider";
import type { Locale } from "@/lib/i18n";
import { getProduct } from "@/lib/products";

const RingCanvas = dynamic(() => import("@/components/ring-canvas"), {
  ssr: false,
  loading: () => <div className="canvas-loading" aria-label="Loading the 3D ring"><span className="loading-orbit" /></div>,
});

type Motion = { progress: number };

export function CinematicExperience({ locale }: { locale: Locale }) {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const motionRef = useRef<Motion>({ progress: 0 });
  const product = getProduct("solitaire-01")!;
  const isFa = locale === "fa";
  const anchorX = isFa ? -0.72 : 0.72;
  const { add } = useCart();
  const Arrow = isFa ? ArrowLeft : ArrowRight;
  const ArrowUp = isFa ? ArrowUpLeft : ArrowUpRight;

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    if (!section || !stage) return;

    let cleanupContext: (() => void) | undefined;
    let disposed = false;
    let buildVersion = 0;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");

    const build = () => {
      const currentBuild = ++buildVersion;
      cleanupContext?.();
      cleanupContext = undefined;
      section.dataset.reducedMotion = media.matches ? "true" : "false";
      if (media.matches) {
        motionRef.current.progress = 0;
        return;
      }

      void import("gsap").then(async ({ default: gsap }) => {
        const { ScrollTrigger } = await import("gsap/ScrollTrigger");
        if (disposed || currentBuild !== buildVersion || !section.isConnected || media.matches) return;
        gsap.registerPlugin(ScrollTrigger);
        const ctx = gsap.context(() => {
          const timeline = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: section,
              pin: stage,
              pinSpacing: true,
              start: "top top",
              end: () => `+=${Math.round(window.innerHeight * (window.matchMedia("(max-width: 760px)").matches ? 2.9 : 3.75))}`,
              scrub: 1.05,
              anticipatePin: 1,
              invalidateOnRefresh: true,
              onUpdate: (self) => {
                const p = self.progress;
                section.dataset.phase = p < 0.18 ? "intro" : p < 0.35 ? "approach" : p < 0.53 ? "macro" : p < 0.67 ? "material" : p < 0.84 ? "orbit" : "shopping";
              },
            },
          });

          timeline.to(motionRef.current, { progress: 1, duration: 1 }, 0);
          timeline.fromTo(".cinema-intro", { autoAlpha: 0, y: 26 }, { autoAlpha: 1, y: 0, duration: 0.1, ease: "power2.out" }, 0.005);
          timeline.to(".cinema-intro", { autoAlpha: 0, y: -15, duration: 0.07 }, 0.16);
          timeline.fromTo(".cinema-approach", { autoAlpha: 0, y: 22 }, { autoAlpha: 1, y: 0, duration: 0.09, ease: "power2.out" }, 0.205);
          timeline.to(".cinema-approach", { autoAlpha: 0, y: -10, duration: 0.055 }, 0.32);
          timeline.fromTo(".cinema-macro", { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.09, ease: "power2.out" }, 0.36);
          timeline.to(".cinema-macro", { autoAlpha: 0, y: -8, duration: 0.055 }, 0.49);
          timeline.fromTo(".cinema-material", { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.08, ease: "power2.out" }, 0.525);
          timeline.to(".cinema-material", { autoAlpha: 0, y: -8, duration: 0.055 }, 0.655);
          timeline.fromTo(".cinema-orbit", { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.08, ease: "power2.out" }, 0.68);
          timeline.to(".cinema-orbit", { autoAlpha: 0, y: -8, duration: 0.055 }, 0.815);
          timeline.fromTo(".cinema-product-reveal", { autoAlpha: 0, x: isFa ? 28 : -28 }, { autoAlpha: 1, x: 0, duration: 0.14, ease: "power2.out" }, 0.835);
          timeline.fromTo(".cinema-scroll-cue", { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.06 }, 0.13);
          timeline.fromTo(".cinema-progress__fill", { scaleY: 0 }, { scaleY: 1, duration: 1, transformOrigin: "top" }, 0);
        }, section);
        cleanupContext = () => ctx.revert();
        requestAnimationFrame(() => ScrollTrigger.refresh());
      });
    };

    build();
    media.addEventListener("change", build);
    return () => {
      disposed = true;
      buildVersion += 1;
      media.removeEventListener("change", build);
      cleanupContext?.();
    };
  }, [isFa]);

  return (
    <section ref={sectionRef} className="cinematic-story" aria-label={isFa ? "روایت سینمایی از یک حلقه‌ی مفهومی" : "A cinematic study of a concept ring"} data-phase="intro">
      <div className="cinema-stage" ref={stageRef}>
        <div className="cinema-grain" aria-hidden="true" />
        <div className="cinema-halo cinema-halo--one" aria-hidden="true" />
        <div className="cinema-halo cinema-halo--two" aria-hidden="true" />
        <div className="cinema-canvas-wrap">
          <RingCanvas
            mode="story"
            progressRef={motionRef}
            anchorX={anchorX}
            label={isFa ? "مدل سه‌بعدی مفهومی دو‌رنگ با تاج گلبرگی و حرکت دوربین وابسته به پیمایش" : "Two-tone petal-set concept ring with a scroll-driven camera path"}
          />
        </div>
        <div className="cinema-vignette" aria-hidden="true" />
        <div className="cinema-progress" aria-hidden="true"><span className="cinema-progress__fill" /></div>
        <p className="cinema-index"><span>01</span><i />{isFa ? "روایتِ یک جزئیات" : "A study in detail"}</p>

        <div className="cinema-copy cinema-intro">
          <p className="eyebrow"><span className="eyebrow__dot" />{isFa ? "طلا، در روایتِ جزئیات" : "GOLD, THROUGH DETAIL"}</p>
          <h1>{isFa ? <>زیبایی،<br />در جزئیات<br /><em>ماندگار می‌شود</em></> : <>Beauty lives<br />in the <em>details</em><br />that remain.</>}</h1>
          <p className="cinema-copy__sub">{isFa ? "هر خط، با نوری آرام آغاز می‌شود." : "Every line begins with a quieter light."}</p>
          <span className="cinema-concept-note">{isFa ? "مدل سه‌بعدی مفهومی · مشخصات محصول تأیید نشده" : "Concept 3D model · product specifications unverified"}</span>
        </div>

        <div className="cinema-panel cinema-approach">
          <p className="eyebrow"><span className="eyebrow__dot" />{isFa ? "نزدیک‌تر" : "CLOSER"}</p>
          <h2>{isFa ? <>فرم را<br /><em>از نزدیک</em> ببینید.</> : <>A form,<br /><em>seen closely.</em></>}</h2>
          <p>{isFa ? "حرکت دوربین، به‌تدریج به سوی سرِ حلقه می‌آید؛ برای دیدن تناسب، نه اغراق در آن." : "The camera moves towards the setting to reveal its proportions, never to exaggerate them."}</p>
          <span className="scene-caption">{isFa ? "01 / 06 — نزدیک‌شدن" : "01 / 06 — APPROACH"}</span>
        </div>

        <div className="cinema-panel cinema-macro">
          <p className="eyebrow"><span className="eyebrow__dot" />{isFa ? "مقیاسِ ماکرو" : "MACRO STUDY"}</p>
          <h2>{isFa ? <>جایی که نور،<br /><em>به لبه می‌رسد.</em></> : <>Where light<br /><em>meets an edge.</em></>}</h2>
          <p>{isFa ? "تراشِ مدلِ مفهومی، در یک نمای نزدیکِ واقعی از هندسه دیده می‌شود؛ جزئیات نهایی باید با نمونه‌ی کارگاه تطبیق داده شوند." : "A close camera study of the concept geometry. Final details must be matched to an approved workshop sample."}</p>
          <div className="detail-markers" aria-hidden="true"><span>SETTING</span><i /><span>01 / 06</span></div>
        </div>

        <div className="cinema-panel cinema-material">
          <p className="eyebrow"><span className="eyebrow__dot" />{isFa ? "نور و پرداخت" : "LIGHT & FINISH"}</p>
          <h2>{isFa ? <>بازتابی آرام،<br /><em>نه یک درخششِ اضافه.</em></> : <>A quiet reflection,<br /><em>never a louder shine.</em></>}</h2>
          <p>{isFa ? "نور محیطی و متریال فیزیکی در این مدل، برای نمایش یک مطالعه‌ی دیجیتال تنظیم شده‌اند؛ نه به‌عنوان گواهیِ پرداختِ محصول." : "Studio lighting and physically based materials shape this digital study; they are not a claim about a finished product."}</p>
          <div className="material-note"><span>01</span><span>{isFa ? "نمونه‌ی بصری" : "VISUAL STUDY"}</span></div>
          <div className="detail-markers" aria-hidden="true"><span>{isFa ? "سطحِ بند" : "BAND SURFACE"}</span><i /><span>{isFa ? "مطالعه‌ی نور" : "LIGHT STUDY"}</span></div>
          <span className="scene-caption">{isFa ? "02 / 06 — سطح و نور" : "02 / 06 — SURFACE & LIGHT"}</span>
        </div>

        <div className="cinema-panel cinema-orbit">
          <p className="eyebrow"><span className="eyebrow__dot" />{isFa ? "زاویه‌ی دید" : "ANOTHER ANGLE"}</p>
          <h2>{isFa ? <>هر چرخش،<br /><em>روایتی تازه.</em></> : <>A new angle,<br /><em>a new reading.</em></>}</h2>
          <p>{isFa ? "پیمایش، دوربین را در مسیرِ نوشته‌شده حرکت می‌دهد. برای چرخش آزاد و بزرگ‌نماییِ خودتان، نمای سه‌بعدی را باز کنید." : "Scroll follows an authored camera path. Open the interactive view to rotate and zoom at your own pace."}</p>
          <Link className="text-link" href={`/${locale}/experience/${product.slug}`}>
            <span>{isFa ? "ورود به نمای ۳۶۰ درجه" : "Explore the 360° view"}</span><Arrow size={16} strokeWidth={1.3} />
          </Link>
          <span className="scene-caption">{isFa ? "03 / 06 — گردش دوربین" : "03 / 06 — CAMERA ORBIT"}</span>
        </div>

        <div className="cinema-product-reveal">
          <div className="product-reveal__topline"><span className="eyebrow__dot" />TALA / {isFa ? "نمونه‌ی مفهومی" : "CONCEPT STUDY"}</div>
          <p className="product-reveal__code">{product.modelCode}</p>
          <h2>{product.name[locale]}</h2>
          <p className="product-reveal__description">{isFa ? "تاجِ گلبرگی دو‌رنگ · مدل مفهومی" : "Two-tone petal setting · concept model"}</p>
          <div className="product-reveal__specs">
            <div><span>{isFa ? "عیار" : "PURITY"}</span><b>{isFa ? "پس از تأیید" : "To be confirmed"}</b></div>
            <div><span>{isFa ? "وزن" : "WEIGHT"}</span><b>{isFa ? "پس از تأیید" : "To be confirmed"}</b></div>
            <div><span>{isFa ? "نگین" : "STONE"}</span><b>{isFa ? "تأییدنشده" : "Unverified"}</b></div>
            <div><span>{isFa ? "قیمت" : "PRICE"}</span><b>{isFa ? "استعلام قیمت" : "Price on request"}</b></div>
          </div>
          <div className="product-reveal__actions">
            <button className="button button--gold" type="button" onClick={() => add(product.slug)}>
              <span>{isFa ? "افزودن به لیست استعلام" : "Add to enquiry list"}</span><ArrowUp size={16} strokeWidth={1.2} />
            </button>
            <Link href={`/${locale}/products/${product.slug}`} className="button button--line">
              {isFa ? "جزئیات طرح" : "Design details"}
            </Link>
          </div>
          <Link className="product-reveal__viewer" href={`/${locale}/experience/${product.slug}`}><Play size={12} fill="currentColor" />{isFa ? "چرخش آزاد در فضای سه‌بعدی" : "Rotate in the interactive viewer"}</Link>
          <span className="product-reveal__disclaimer">{isFa ? "مدل و مشخصات مفهومی؛ برای سفارش یا پرداخت آماده نیست." : "Concept model and details; not available to order or pay for."}</span>
        </div>

        <a className="cinema-scroll-cue" href="#featured-selection">
          <span>{isFa ? "برای کشف بیشتر پیمایش کنید" : "SCROLL TO DISCOVER"}</span><ArrowDown size={15} strokeWidth={1.2} />
        </a>
        <span className="cinema-vertical-note" aria-hidden="true">TALA — OBJECTS OF LIGHT</span>
      </div>
    </section>
  );
}
