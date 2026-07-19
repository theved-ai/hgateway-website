"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import "./site-nav.css";
import { DOCS_URL, DASHBOARD_URL } from "./externalLinks";
import { ROUTE_HOME, ROUTE_SANDBOX } from "./constants/routes";
import { SITE_LOGO_SRC } from "./constants/assets";

export default function SiteNav() {
  const pathname = usePathname();

  return (
    <nav className="site-nav">
      <div className="site-nav-left">
        <div className="site-nav-brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="brand-mark" src={SITE_LOGO_SRC} alt="theved.ai" />
          <div className="site-nav-name">theved.ai</div>
        </div>
        <div className="site-nav-links">
          <Link className={`nav-link${pathname === ROUTE_HOME ? " active" : ""}`} href={ROUTE_HOME}>
            Home
          </Link>
          <Link className={`nav-link${pathname === ROUTE_SANDBOX ? " active" : ""}`} href={ROUTE_SANDBOX}>
            Sandbox
          </Link>
          <a className="nav-link" href={DOCS_URL} target="_blank" rel="noopener noreferrer">
            Docs
          </a>
        </div>
      </div>
      <div className="site-nav-right">
        <a className="dash-link" href={`${DASHBOARD_URL}/register`}>
          Sign in
        </a>
        <a className="signin-btn" href={`${DASHBOARD_URL}/login`}>
          Log in
        </a>
      </div>
    </nav>
  );
}
