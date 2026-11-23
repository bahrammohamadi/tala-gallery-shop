"use client";

import dynamic from "next/dynamic";
import { useRef } from "react";
import { Maximize2, Minus, Plus, RotateCcw } from "lucide-react";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import type { Locale } from "@/lib/i18n";

const RingCanvas = dynamic(() => import("@/components/ring-canvas"), {
  ssr: false,
  loading: () => <div className="canvas-loading" aria-label="Loading the 3D model"><span className="loading-orbit" /></div>,
});

export function ProductViewer({ locale }: { locale: Locale }) {
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const fa = locale === "fa";
  return (
    <section className="product-viewer" aria-label={fa ? "نمایش سه‌بعدی تعاملی حلقه" : "Interactive 3D ring viewer"}>
      <div className="product-viewer__canvas">
        <RingCanvas
          mode="interactive"
          controlsRef={controlsRef}
          label={fa ? "مدل سه‌بعدی مفهومی؛ با ماوس یا لمس بچرخانید" : "Concept 3D model; drag with mouse or touch to rotate"}
        />
        <div className="viewer-controls" aria-label={fa ? "کنترل‌های نمای سه‌بعدی" : "3D view controls"}>
          <button type="button" aria-label={fa ? "کوچک‌نمایی" : "Zoom out"} onClick={() => { controlsRef.current?.dollyOut(1.18); controlsRef.current?.update(); }}><Minus size={15} strokeWidth={1.4} /></button>
          <button type="button" aria-label={fa ? "بزرگ‌نمایی" : "Zoom in"} onClick={() => { controlsRef.current?.dollyIn(1.18); controlsRef.current?.update(); }}><Plus size={15} strokeWidth={1.4} /></button>
          <span className="viewer-controls__divider" />
          <button type="button" aria-label={fa ? "بازنشانی نما" : "Reset view"} onClick={() => controlsRef.current?.reset()}><RotateCcw size={14} strokeWidth={1.3} /></button>
        </div>
        <span className="viewer-badge"><Maximize2 size={12} strokeWidth={1.2} />{fa ? "مدل سه‌بعدی مفهومی" : "CONCEPT 3D MODEL"}</span>
      </div>
      <p className="product-viewer__hint">{fa ? "برای چرخش، بکشید · برای بزرگ‌نمایی از کنترل‌ها یا چرخ ماوس استفاده کنید" : "Drag to rotate · use the controls or mouse wheel to zoom"}</p>
    </section>
  );
}
