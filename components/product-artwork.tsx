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
          <linearGradient id={`silver-${id}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#fffdf7" />
            <stop offset="0.48" stopColor="#c5c7c9" />
            <stop offset="1" stopColor="#858a90" />
          </linearGradient>
          <radialGradient id={`stone-${id}`} cx="0" cy="0" r="1" gradientTransform="translate(171 118) rotate(90) scale(66)">
            <stop stopColor="#f7f0e4" stopOpacity="0.92" />
            <stop offset="0.46" stopColor="#c8bdab" stopOpacity="0.42" />
            <stop offset="1" stopColor="#c7a56a" stopOpacity="0.05" />
          </radialGradient>
          <radialGradient id={`diamond-${id}`} cx="0" cy="0" r="1" gradientTransform="translate(180 82) rotate(90) scale(37)">
            <stop stopColor="#fffefb" stopOpacity="0.96" />
            <stop offset="0.48" stopColor="#d9e0e1" stopOpacity="0.65" />
            <stop offset="1" stopColor="#c7a56a" stopOpacity="0.08" />
          </radialGradient>
        </defs>
        {kind === "ring" && <g strokeLinecap="round" strokeLinejoin="round">
          <ellipse cx="180" cy="183" rx="69" ry="83" transform="rotate(-17 180 183)" stroke={`url(#silver-${id})`} strokeWidth="9" />
          <ellipse cx="180" cy="183" rx="61" ry="75" transform="rotate(-17 180 183)" stroke={`url(#foil-${id})`} strokeWidth="3" opacity=".95" />
          <path d="M137 113c-17 17-28 43-28 68 0 12 3 23 8 34" stroke={`url(#silver-${id})`} strokeWidth="11" />
          <path d="M141 117c-14 18-23 41-23 62 0 10 2 19 5 28" stroke={`url(#foil-${id})`} strokeWidth="2.4" />
          <path d="M220 109c25 18 39 45 38 72-1 10-3 20-7 29" stroke={`url(#silver-${id})`} strokeWidth="10" />
          <path d="M153 108c-8 9-14 17-20 27m74-27c8 9 14 17 20 27" stroke={`url(#foil-${id})`} strokeWidth="4.3" />
          <path d="M157 107c3 11 11 20 23 25 12-5 20-14 23-25" stroke={`url(#foil-${id})`} strokeWidth="4.4" />
          <path d="M155 73c-5-10-1-19 7-25 5 8 6 15 1 24m42 1c5-10 1-19-7-25-5 8-6 15-1 24M147 83c-11-4-17 2-16 12 7 0 12-3 16-9m66-3c11-4 17 2 16 12-7 0-12-3-16-9m-50 23c-2 10 4 17 13 19 4-6 5-12 1-19m27 0c2 10-4 17-13 19-4-6-5-12-1-19" fill="none" stroke={`url(#foil-${id})`} strokeWidth="4.4" />
          <path d="M180 47l16 5 13 13 6 17-6 17-13 12-16 5-16-5-13-12-6-17 6-17 13-13 16-5Z" fill={`url(#diamond-${id})`} stroke={`url(#silver-${id})`} strokeWidth="2.6" />
          <path d="M180 48l-7 28m23-24-6 25m25 5-28-2m-34 0 29 2m-29 0 20 22m23-22-7 22m-9-25v38m-13-39-7 25m34-25 7 25" stroke="#fffdf8" strokeWidth="1.25" opacity=".88" />
          <g fill="#fffdf8" stroke={`url(#silver-${id})`} strokeWidth="1.3">
            <circle cx="132" cy="125" r="4.1"/><circle cx="126" cy="136" r="4.1"/><circle cx="120" cy="148" r="4.1"/><circle cx="116" cy="160" r="4.1"/><circle cx="114" cy="172" r="4.1"/><circle cx="114" cy="184" r="4.1"/><circle cx="117" cy="196" r="4"/><circle cx="122" cy="207" r="3.8"/>
          </g>
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
