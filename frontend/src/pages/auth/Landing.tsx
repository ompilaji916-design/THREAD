import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import "./landing.css";

gsap.registerPlugin(ScrollTrigger);

const MARQUEE_ITEMS = [
  "ATTENDANCE TRACKING", "CGPA CALCULATOR", "AI STUDY TOOLS", "CAMPUS NOTICES",
  "POCKETGUARD", "SAFEWALK", "DAILY CHALLENGES", "MYSTERYLEARN",
];

const FEATURE_CARDS = [
  { title: "Academics", desc: "Attendance, CGPA, assignments, and timetable — all in one place.", img: "/landing/academic.jpg" },
  { title: "AI Tools", desc: "Doubt solver, resume builder, email assistant, and study planner.", img: "/landing/ai-tools.jpg" },
  { title: "Campus & Money", desc: "Notices, hostel help, marketplace, complaints, and PocketGuard.", img: "/landing/campus.jpg" },
  { title: "Wellness & Safety", desc: "Daily mood check-ins and SafeWalk for walking alone at night.", img: "/landing/safewalk.jpg" },
  { title: "Career & Game", desc: "Internships, a daily coding challenge, and ten debugging puzzles.", img: "/landing/career.jpg" },
  { title: "Learning THREAD", desc: "A feed where students post what they learned and upvote the best explanations.", img: "/landing/ai-robot.jpg" },
];

const PIN_PANELS = [
  { index: "01", title: "Every action, live.", desc: "XP, badges, and notifications update instantly across your account through a live connection — no refreshing.", img: "/landing/attendance-iso.jpg" },
  { index: "02", title: "It remembers, so you don't have to.", desc: "Attendance warnings, assignment reminders, and weekly reports go out automatically in the background.", img: "/landing/timetable-glow.jpg" },
  { index: "03", title: "Progress you can actually see.", desc: "XP, ten badges, and a live leaderboard turn tracking your own habits into something worth checking.", img: "/landing/trophy-stairs.jpg" },
  { index: "04", title: "No pricing tiers. No paywall.", desc: "Built by one student who got tired of juggling five different apps. It's free because it should be.", img: "/landing/campus-fest.jpg" },
];

const NUMBERS = [
  { target: 28, unit: "", label: "Modules in one app" },
  { target: 20, unit: "", label: "Daily coding challenges in rotation" },
  { target: 10, unit: "", label: "MysteryLearn debugging levels" },
  { target: 7, unit: "", label: "Automated emails running behind the scenes" },
];

const GALLERY = [
  { img: "/landing/campus-fest.jpg", tall: true },
  { img: "/landing/safewalk-night.jpg" },
  { img: "/landing/gamification.jpg" },
  { img: "/landing/academic-glow.jpg", wide: true },
  { img: "/landing/ai-robot.jpg" },
  { img: "/landing/campus-iso.jpg", tall: true },
];

const FAQS = [
  { q: "Is THREAD actually free?", a: "Yes. No pricing tiers, no premium plan. It's a student project, not a company." },
  { q: "Do the AI tools cost anything?", a: "No — they run on generous free-tier limits, and every AI feature falls back to a solid template if the AI is unavailable, so nothing ever breaks." },
  { q: "Is my data safe?", a: "Your password is hashed, never stored in plain text, and never shown back to you or anyone else. Your data isn't sold or shared." },
  { q: "Does it work on my phone?", a: "Yes — it's a responsive web app, so it works on your phone, tablet, or laptop through the browser." },
  { q: "Who actually built this?", a: "One CSE student (me), still learning. See the \"why I built this\" section below." },
];

export default function Landing() {
  const navigate = useNavigate();
  const rootRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const loaderRef = useRef<HTMLDivElement>(null);
  const cursorDotRef = useRef<HTMLDivElement>(null);
  const cursorRingRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const navbarRef = useRef<HTMLElement>(null);
  const backToTopRef = useRef<HTMLButtonElement>(null);
  const pinTrackRef = useRef<HTMLDivElement>(null);

  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const ctx = gsap.context(() => {
      /* Loader */
      const loaderBar = root.querySelector<HTMLElement>(".tl-loader-bar span");
      if (loaderBar) gsap.to(loaderBar, { width: "100%", duration: 1.0, ease: "power2.inOut" });
      const loaderTimeout = setTimeout(() => {
        loaderRef.current?.classList.add("hidden");
        playIntro();
      }, 900);

      /* Lenis smooth scroll */
      let lenis: Lenis | null = null;
      let rafId = 0;
      try {
        lenis = new Lenis({ duration: 1.1, smoothWheel: true });
        const raf = (time: number) => { lenis?.raf(time); rafId = requestAnimationFrame(raf); };
        rafId = requestAnimationFrame(raf);
        lenis.on("scroll", ScrollTrigger.update);
        gsap.ticker.add((time) => { lenis?.raf(time * 1000); });
        gsap.ticker.lagSmoothing(0);
      } catch { /* fall back to native scroll */ }

      /* Anchor links */
      const anchorHandler = (e: Event) => {
        const a = e.currentTarget as HTMLAnchorElement;
        const href = a.getAttribute("href") || "";
        if (!href.startsWith("#")) return;
        const target = root.querySelector(href);
        if (!target) return;
        e.preventDefault();
        if (lenis) lenis.scrollTo(target as HTMLElement, { offset: -60 });
        else target.scrollIntoView({ behavior: "smooth" });
      };
      const anchors = Array.from(root.querySelectorAll<HTMLAnchorElement>('a[href^="#"]'));
      anchors.forEach((a) => a.addEventListener("click", anchorHandler));

      /* Navbar + progress + back-to-top */
      const onScroll = () => {
        const sc = window.scrollY;
        navbarRef.current?.classList.toggle("scrolled", sc > 40);
        backToTopRef.current?.classList.toggle("show", sc > 600);
        const h = document.documentElement.scrollHeight - window.innerHeight;
        if (progressRef.current) progressRef.current.style.width = (h > 0 ? (sc / h) * 100 : 0) + "%";
      };
      window.addEventListener("scroll", onScroll);

      /* Custom cursor */
      let mx = 0, my = 0, rx = 0, ry = 0;
      const onMouseMove = (e: MouseEvent) => {
        mx = e.clientX; my = e.clientY;
        if (cursorDotRef.current) { cursorDotRef.current.style.left = mx + "px"; cursorDotRef.current.style.top = my + "px"; }
      };
      window.addEventListener("mousemove", onMouseMove);
      let ringRafId = 0;
      const ringLoop = () => {
        rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
        if (cursorRingRef.current) { cursorRingRef.current.style.left = rx + "px"; cursorRingRef.current.style.top = ry + "px"; }
        ringRafId = requestAnimationFrame(ringLoop);
      };
      ringLoop();
      const hoverables = Array.from(root.querySelectorAll("a,button"));
      const enter = () => cursorRingRef.current?.classList.add("active");
      const leave = () => cursorRingRef.current?.classList.remove("active");
      hoverables.forEach((el) => { el.addEventListener("mouseenter", enter); el.addEventListener("mouseleave", leave); });

      /* Magnetic buttons */
      const magnets = Array.from(root.querySelectorAll<HTMLElement>(".tl-magnetic"));
      const magnetMove = (btn: HTMLElement) => (e: MouseEvent) => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        gsap.to(btn, { x: x * 0.25, y: y * 0.3, duration: 0.4, ease: "power2.out" });
      };
      const magnetLeave = (btn: HTMLElement) => () => gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1,0.4)" });
      magnets.forEach((btn) => { btn.addEventListener("mousemove", magnetMove(btn)); btn.addEventListener("mouseleave", magnetLeave(btn)); });

      /* Hero intro */
      function playIntro() {
        const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
        tl.to(root!.querySelector(".tl-hero-img"), { scale: 1, duration: 1.6, ease: "power2.out" }, 0)
          .to(root!.querySelectorAll(".tl-reveal-mask"), { y: "0%", duration: 1.0, stagger: 0.1 }, 0.15)
          .to(root!.querySelectorAll(".tl-eyebrow.tl-reveal-up, .tl-hero-sub.tl-reveal-up, .tl-hero-cta.tl-reveal-up"), { opacity: 1, y: 0, duration: 0.8, stagger: 0.1 }, 0.45);
      }

      /* Hero parallax (mouse) */
      const heroEl = heroRef.current;
      const heroMouseMove = (e: MouseEvent) => {
        const x = (e.clientX / window.innerWidth - 0.5) * 16;
        const y = (e.clientY / window.innerHeight - 0.5) * 16;
        gsap.to(root!.querySelector(".tl-hero-img"), { x, y, duration: 0.8, ease: "power2.out" });
        gsap.to(root!.querySelector(".tl-hero-glow"), { x: x * 2, y: y * 2, duration: 0.8, ease: "power2.out" });
      };
      heroEl?.addEventListener("mousemove", heroMouseMove);

      /* Hero scroll parallax */
      if (heroEl) {
        gsap.to(root.querySelector(".tl-hero-img"), {
          yPercent: 16, ease: "none",
          scrollTrigger: { trigger: heroEl, start: "top top", end: "bottom top", scrub: true },
        });
        gsap.to(root.querySelector(".tl-hero-content"), {
          yPercent: -20, opacity: 0.3, ease: "none",
          scrollTrigger: { trigger: heroEl, start: "top top", end: "bottom top", scrub: true },
        });
      }

      /* Section reveals */
      root.querySelectorAll(".tl-section-head").forEach((el) => {
        gsap.from(el.children, {
          opacity: 0, y: 36, duration: 0.9, stagger: 0.1, ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 85%" },
        });
      });
      root.querySelectorAll(".tl-product-card").forEach((card, i) => {
        gsap.from(card, { opacity: 0, y: 50, duration: 0.8, ease: "power3.out", delay: i * 0.05, scrollTrigger: { trigger: card, start: "top 90%" } });
      });
      root.querySelectorAll(".tl-feature-card").forEach((card, i) => {
        gsap.from(card, { opacity: 0, y: 36, scale: 0.97, duration: 0.7, ease: "power3.out", delay: (i % 3) * 0.07, scrollTrigger: { trigger: card, start: "top 92%" } });
      });

      /* Horizontal pin scroll */
      if (pinTrackRef.current) {
        gsap.to(pinTrackRef.current, {
          xPercent: -75, ease: "none",
          scrollTrigger: { trigger: ".tl-pin-section", start: "top top", end: "+=300%", scrub: 1, pin: true, anticipatePin: 1 },
        });
      }

      /* Numbers counter */
      root.querySelectorAll<HTMLElement>(".tl-count").forEach((el) => {
        const target = +(el.dataset.target || "0");
        ScrollTrigger.create({
          trigger: el, start: "top 88%", once: true,
          onEnter: () => {
            const obj = { val: 0 };
            gsap.to(obj, {
              val: target, duration: 1.6, ease: "power2.out",
              onUpdate: () => { el.innerText = Math.floor(obj.val).toString(); },
            });
          },
        });
      });

      /* Gallery reveal + fade-load */
      root.querySelectorAll<HTMLImageElement>(".tl-g-item img").forEach((img) => {
        const show = () => img.classList.add("loaded");
        if (img.complete) show(); else img.addEventListener("load", show);
      });
      root.querySelectorAll(".tl-g-item").forEach((item, i) => {
        gsap.from(item, { opacity: 0, y: 40, duration: 0.8, ease: "power3.out", delay: (i % 4) * 0.06, scrollTrigger: { trigger: item, start: "top 94%" } });
      });

      ScrollTrigger.refresh();

      return () => {
        clearTimeout(loaderTimeout);
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("mousemove", onMouseMove);
        heroEl?.removeEventListener("mousemove", heroMouseMove);
        anchors.forEach((a) => a.removeEventListener("click", anchorHandler));
        magnets.forEach((btn) => { btn.removeEventListener("mousemove", magnetMove(btn)); btn.removeEventListener("mouseleave", magnetLeave(btn)); });
        hoverables.forEach((el) => { el.removeEventListener("mouseenter", enter); el.removeEventListener("mouseleave", leave); });
        cancelAnimationFrame(rafId);
        cancelAnimationFrame(ringRafId);
        lenis?.destroy();
      };
    }, root);

    return () => {
      ctx.revert();
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <div className="tl-root" ref={rootRef}>
      <div className="tl-loader" ref={loaderRef}>
        <div className="tl-loader-mark">THREAD</div>
        <div className="tl-loader-bar"><span></span></div>
      </div>

      <div className="tl-cursor-dot" ref={cursorDotRef}></div>
      <div className="tl-cursor-ring" ref={cursorRingRef}></div>
      <div className="tl-progress" ref={progressRef}></div>

      <nav className="tl-navbar" ref={navbarRef}>
        <div className="tl-nav-inner">
          <a href="#hero" className="tl-logo">THREAD</a>
          <ul className="tl-nav-links">
            <li><a href="#showcase">Modules</a></li>
            <li><a href="#features">Features</a></li>
            <li><a href="#gallery">Gallery</a></li>
            <li><a href="#faq">FAQ</a></li>
          </ul>
          <div className="tl-nav-right">
            <Link to="/login" className="tl-btn-outline">Log in</Link>
            <Link to="/signup" className="tl-btn-primary tl-magnetic">Sign up</Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <header className="tl-hero" id="hero" ref={heroRef}>
        <div className="tl-hero-bg">
          <img src="/landing/hero.jpg" alt="" className="tl-hero-img" />
          <div className="tl-hero-vignette"></div>
        </div>
        <div className="tl-hero-glow"></div>
        <div className="tl-hero-content">
          <p className="tl-eyebrow tl-reveal-up">One app for the whole student life</p>
          <h1 className="tl-hero-title">
            <span className="tl-line"><span className="tl-reveal-mask">Stop struggling.</span></span>
            <span className="tl-line"><span className="tl-reveal-mask">Start THREADing.</span></span>
          </h1>
          <p className="tl-hero-sub tl-reveal-up">
            Attendance, CGPA, assignments, a few AI tools, campus life, expenses, and more —
            built by one student who was tired of juggling five different apps.
          </p>
          <div className="tl-hero-cta tl-reveal-up">
            <button className="tl-btn-primary tl-magnetic" onClick={() => navigate("/signup")}>Create a free account</button>
            <a href="#showcase" className="tl-btn-text tl-magnetic">See what's inside →</a>
          </div>
        </div>
      </header>

      {/* MARQUEE */}
      <div className="tl-marquee">
        <div className="tl-marquee-track">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span key={i}>{item} {i % 2 === 0 ? "" : "·"}</span>
          ))}
        </div>
      </div>

      {/* SHOWCASE */}
      <section id="showcase">
        <div className="tl-section-head">
          <p className="tl-eyebrow">01 — What's inside</p>
          <h2>Five areas.<br />One account.</h2>
        </div>
        <div className="tl-showcase-grid">
          <article className="tl-product-card big">
            <div className="tl-card-media"><img src="/landing/academic-glow.jpg" alt="Academic tools" /></div>
            <div className="tl-card-fade"></div>
            <div className="tl-card-info">
              <h3>Academics</h3>
              <p>Attendance with a safe-bunk counter, CGPA, assignments, timetable, and a feed of what other students learned.</p>
            </div>
          </article>
          <article className="tl-product-card">
            <div className="tl-card-media"><img src="/landing/ai-glow.jpg" alt="AI tools" /></div>
            <div className="tl-card-fade"></div>
            <div className="tl-card-info"><h3>AI Tools</h3><p>Doubt solver, resume builder, email assistant, study planner.</p></div>
          </article>
          <article className="tl-product-card">
            <div className="tl-card-media"><img src="/landing/campus-iso.jpg" alt="Campus life" /></div>
            <div className="tl-card-fade"></div>
            <div className="tl-card-info"><h3>Campus Life</h3><p>Notices, hostel help, marketplace, complaints, bus tracking.</p></div>
          </article>
          <article className="tl-product-card">
            <div className="tl-card-media"><img src="/landing/trophy-stairs.jpg" alt="Career and game" /></div>
            <div className="tl-card-fade"></div>
            <div className="tl-card-info"><h3>Career & Game</h3><p>Internships, daily challenges, MysteryLearn, leaderboard.</p></div>
          </article>
        </div>
      </section>

      {/* HORIZONTAL PIN */}
      <section className="tl-pin-section">
        <div className="tl-pin-track" ref={pinTrackRef}>
          {PIN_PANELS.map((p) => (
            <div key={p.index} className="tl-pin-panel" style={{ backgroundImage: `url(${p.img})` }}>
              <div className="tl-pin-text">
                <span className="tl-pin-index">{p.index}</span>
                <h3>{p.title}</h3>
                <p>{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features">
        <div className="tl-section-head">
          <p className="tl-eyebrow">02 — Every module</p>
          <h2>Six groups,<br />28 modules.</h2>
        </div>
        <div className="tl-features-grid">
          {FEATURE_CARDS.map((f) => (
            <div key={f.title} className="tl-feature-card" style={{ backgroundImage: `url(${f.img})` }}>
              <div className="tl-feature-fade"></div>
              <div className="tl-feature-body"><h4>{f.title}</h4><p>{f.desc}</p></div>
            </div>
          ))}
        </div>
      </section>

      {/* REAL PROOF */}
      <section>
        <div className="tl-section-head">
          <p className="tl-eyebrow">03 — Not a mockup</p>
          <h2>What it actually<br />looks like.</h2>
        </div>
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: "0 24px 120px" }}>
          <img src="/landing/real-dashboard.jpg" alt="Real screenshot of the THREAD dashboard" style={{ width: "100%", borderRadius: 20, border: "1px solid var(--tl-border)" }} />
        </div>
      </section>

      {/* NUMBERS */}
      <section className="tl-numbers">
        {NUMBERS.map((n) => (
          <div key={n.label} className="tl-number-item">
            <span className="tl-count" data-target={n.target}>0</span><span className="tl-unit">{n.unit}</span>
            <p>{n.label}</p>
          </div>
        ))}
      </section>

      {/* GALLERY */}
      <section id="gallery">
        <div className="tl-section-head">
          <p className="tl-eyebrow">04 — A look and feel</p>
          <h2>Built with a bit<br />of ambition.</h2>
        </div>
        <div className="tl-masonry">
          {GALLERY.map((g, i) => (
            <div key={i} className={`tl-g-item ${g.tall ? "tl-span-tall" : ""} ${g.wide ? "tl-span-wide" : ""}`}>
              <img src={g.img} alt="" loading="lazy" />
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq">
        <div className="tl-section-head">
          <p className="tl-eyebrow">05 — Questions</p>
          <h2>Good to<br />know.</h2>
        </div>
        <div className="tl-faq-list">
          {FAQS.map((f, i) => (
            <div key={f.q} className={`tl-faq-item ${faqOpen === i ? "open" : ""}`}>
              <button className="tl-faq-q" onClick={() => setFaqOpen(faqOpen === i ? null : i)}>
                {f.q} <span className="tl-faq-icon">+</span>
              </button>
              <div className="tl-faq-a" style={{ maxHeight: faqOpen === i ? "200px" : "0" }}>
                <p>{f.a}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* WHY I BUILT THIS */}
      <section>
        <div className="tl-section-head">
          <p className="tl-eyebrow">06 — The person behind it</p>
          <h2>Why I built<br />this.</h2>
        </div>
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 24px 60px", color: "var(--tl-text-dim)", fontSize: 16, lineHeight: 1.7 }}>
          <p style={{ marginBottom: 16 }}>
            I'm Om, from Kille Dharur in Beed district, Maharashtra. I'm studying BTech Computer
            Science at Woxsen University in Hyderabad, and I'm still figuring a lot of this out
            myself — I'm not the fastest learner, and I'm weak in maths, but I keep at it.
          </p>
          <p>
            THREAD started because I got tired of switching between five different apps and a
            notebook just to keep track of my own college life. If something's broken or
            missing, tell me — I'm building this the same way I'm learning to code: slowly.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="tl-cta-section">
        <h2>Ready to start your thread?</h2>
        <p>Sign up in under a minute. You'll get 50 XP just for joining.</p>
        <Link to="/signup" className="tl-btn-primary tl-magnetic">Create a free account</Link>
      </section>

      {/* FOOTER */}
      <footer className="tl-footer">
        <div className="tl-footer-bg" style={{ backgroundImage: "url(/landing/campus-fest.jpg)" }}></div>
        <div className="tl-footer-overlay"></div>
        <div className="tl-footer-top">
          <div className="tl-footer-brand">
            <span className="tl-logo">THREAD</span>
            <p>Built by a student, for students. Stop struggling. Start THREADing.</p>
          </div>
          <div className="tl-footer-links">
            <div>
              <h5>Get started</h5>
              <a href="#hero">Back to top</a>
              <Link to="/signup">Sign up</Link>
              <Link to="/login">Log in</Link>
            </div>
            <div>
              <h5>Explore</h5>
              <a href="#showcase">Modules</a>
              <a href="#features">Features</a>
              <a href="#faq">FAQ</a>
            </div>
          </div>
        </div>
        <div className="tl-footer-bottom">
          <p>THREAD — a student project, not a company.</p>
          <p>Built with a lot of trial and error.</p>
        </div>
      </footer>

      <button className="tl-back-to-top tl-magnetic" ref={backToTopRef} aria-label="Back to top" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>↑</button>
    </div>
  );
}
