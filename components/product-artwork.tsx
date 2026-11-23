import { useId } from "react";
import type { ArtworkKind } from "@/lib/products";

export function ProductArtwork({ kind, label, large = false }: { kind: ArtworkKind; label: string; large?: boolean }) {
  const id = useId().replace(/:/g, "");
  return (
    <div className={`product-art product-art--${kind}${large ? " product-art--large" : ""}`} role="img" aria-label={label}>
      <span className="product-art__halo" aria-hidden="true" />
      <svg className="product-art__drawing" viewBox="0 0 360 300" fill="none" aria-hidden="true">
        <defs>
          <linearGradient id={`foil-${id}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#f1d59d" />
            <stop offset="0.45" stopColor="#c7a56a" />
            <stop offset="1" stopColor="#8a6435" />
          </linearGradient>
          <radialGradient id={`stone-${id}`} cx="0" cy="0" r="1" gradientTransform="translate(171 118) rotate(90) scale(66)">
            <stop stopColor="#f7f0e4" stopOpacity="0.92" />
            <stop offset="0.46" stopColor="#c8bdab" stopOpacity="0.42" />
            <stop offset="1" stopColor="#c7a56a" stopOpacity="0.05" />
          </radialGradient>
        </defs>
        {kind === "ring" && <g stroke={`url(#foil-${id})`} strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round">
          <ellipse cx="178" cy="177" rx="63" ry="74" transform="rotate(-17 178 177)" />
          <path d="M135 111c17-10 41-14 61-10" opacity=".58" />
          <path d="M163 92l15-23 15 23-15 15-15-15Z" fill={`url(#stone-${id})`} strokeWidth="2.5" />
          <path d="M167 91h22M178 70v37" strokeWidth="1.2" opacity=".85" />
          <path d="M161 101c8 5 25 5 34 0" strokeWidth="2.3" />
        </g>}
        {kind === "necklace" && <g stroke={`url(#foil-${id})`} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M94 67c4 76 28 126 86 146 58-20 82-70 86-146" />
          <path d="M99 80c27 7 53 10 81 10s54-3 81-10" opacity=".4" />
          <path d="M170 205h20l-10 19-10-19Z" fill={`url(#stone-${id})`} strokeWidth="2.3" />
          <circle cx="180" cy="201" r="3.4" fill="#d8b677" stroke="none" />
        </g>}
        {kind === "bracelet" && <g stroke={`url(#foil-${id})`} strokeWidth="3.8" strokeLinecap="round">
          <ellipse cx="180" cy="155" rx="81" ry="57" transform="rotate(-18 180 155)" />
          <ellipse cx="180" cy="155" rx="70" ry="47" transform="rotate(-18 180 155)" opacity=".47" />
          <path d="M98 175l-17 9m17-9 12 11m-12-11-2 16" strokeWidth="2" />
          <circle cx="101" cy="174" r="5" fill="#c7a56a" stroke="none" />
        </g>}
        {kind === "earrings" && <g stroke={`url(#foil-${id})`} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M127 85c0-13 8-22 19-22s19 9 19 22c0 5-2 9-5 13" />
          <path d="M136 99c0-9 5-15 10-15s10 6 10 15v57c0 20-8 34-19 34s-19-14-19-34c0-10 3-18 9-23" transform="translate(0 0)" />
          <path d="M205 85c0-13 8-22 19-22s19 9 19 22c0 5-2 9-5 13" />
          <path d="M214 99c0-9 5-15 10-15s10 6 10 15v48c0 20-8 34-19 34s-19-14-19-34c0-8 2-16 6-21" />
          <circle cx="146" cy="191" r="4" fill="#c7a56a" stroke="none" />
          <circle cx="225" cy="181" r="4" fill="#c7a56a" stroke="none" />
        </g>}
        {kind === "set" && <g stroke={`url(#foil-${id})`} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M115 66c4 57 21 90 65 108 44-18 61-51 65-108" />
          <path d="M172 172h16l-8 15-8-15Z" fill={`url(#stone-${id})`} strokeWidth="2" />
          <ellipse cx="180" cy="220" rx="31" ry="37" transform="rotate(-17 180 220)" strokeWidth="3.2" />
          <path d="M173 186l7-10 7 10-7 7-7-7Z" fill={`url(#stone-${id})`} strokeWidth="1.8" />
        </g>}
      </svg>
      <span className="product-art__label">TALA · {label}</span>
    </div>
  );
}
