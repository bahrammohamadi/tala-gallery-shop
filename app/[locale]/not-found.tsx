"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function LocalizedNotFound() {
  const pathname = usePathname() ?? "/fa";
  const fa = !pathname.startsWith("/en");
  return (
    <div className="page-shell not-found-page">
      <div className="page-container not-found-content" lang={fa ? "fa" : "en"}>
        <span className="micro-label">TALA / 404</span>
        <h1>{fa ? <>این صفحه<br /><em>پیدا نشد.</em></> : <>This page<br /><em>was not found.</em></>}</h1>
        <p>{fa ? "ممکن است نشانی جابه‌جا شده باشد یا هنوز منتشر نشده باشد." : "The address may have changed, or this page may not be published yet."}</p>
        <Link className="button button--gold" href={fa ? "/fa" : "/en"}>{fa ? "بازگشت به خانه" : "Back to home"}</Link>
      </div>
    </div>
  );
}
