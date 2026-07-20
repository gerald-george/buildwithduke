import { useEffect, useRef, useState } from "react";

export function TypingText({ text, className = "" }: { text: string; className?: string }) {
  const [visible, setVisible] = useState(text);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setVisible(text);
      return;
    }

    setVisible("");
    let index = 0;
    const timer = window.setInterval(() => {
      index += 1;
      setVisible(text.slice(0, index));
      if (index >= text.length) window.clearInterval(timer);
    }, 34);
    return () => window.clearInterval(timer);
  }, [text]);

  return <span className={`typing-text ${className}`} aria-label={text}><span aria-hidden="true">{visible}</span></span>;
}

export function ScrollTypingText({ text, className = "" }: { text: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [started, setStarted] = useState(false);
  const [visible, setVisible] = useState("");

  useEffect(() => {
    setVisible(""); setStarted(false);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
      setVisible(text); setStarted(true); return;
    }
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setStarted(true); observer.disconnect();
    }, { threshold: 0.35, rootMargin: "0px 0px -8%" });
    observer.observe(element);
    return () => observer.disconnect();
  }, [text]);

  useEffect(() => {
    if (!started || visible.length >= text.length) return;
    const timer = window.setTimeout(() => setVisible(text.slice(0, visible.length + 1)), 24);
    return () => window.clearTimeout(timer);
  }, [started, text, visible]);

  return <span ref={ref} className={`scroll-typing ${visible.length < text.length ? "is-typing" : ""} ${className}`} aria-label={text}><span aria-hidden="true">{visible}</span></span>;
}

export function RotatingTypingText({ texts, className = "" }: { texts: string[]; className?: string }) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState("");
  const [phase, setPhase] = useState<"typing" | "holding" | "deleting">("typing");

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(texts[0] || "");
      setPhase("holding");
      return;
    }
    const target = texts[index] || "";
    const delay = phase === "holding" ? 1650 : phase === "deleting" ? 24 : 46;
    const timer = window.setTimeout(() => {
      if (phase === "typing") {
        if (visible.length < target.length) setVisible(target.slice(0, visible.length + 1));
        else setPhase("holding");
      } else if (phase === "holding") {
        setPhase("deleting");
      } else if (visible.length > 0) {
        setVisible(value => value.slice(0, -1));
      } else {
        setIndex(value => (value + 1) % texts.length);
        setPhase("typing");
      }
    }, delay);
    return () => window.clearTimeout(timer);
  }, [index, phase, texts, visible]);

  const longest = texts.reduce((current, value) => value.length > current.length ? value : current, "");
  return <span className={`typing-text rotating-typing ${className}`} aria-label={texts[index]}><span className="typing-placeholder" aria-hidden="true">{longest}</span><span className="typing-output" aria-hidden="true">{visible}</span></span>;
}

const glyphs = "01<>/{}[]#$%&*+=";

export function RevealHeading({
  as,
  text,
  variant = "type",
  className = "",
}: {
  as?: "h1" | "h2" | "h3";
  text: string;
  variant?: "type" | "decrypt";
  className?: string;
}) {
  const Tag = as || "h2";
  const ref = useRef<HTMLHeadingElement>(null);
  const [started, setStarted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setProgress(0);
    setFrame(0);
    if (reduced || !("IntersectionObserver" in window)) {
      setProgress(text.length);
      setStarted(true);
      return;
    }
    setStarted(false);
    const heading = ref.current;
    if (!heading) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setStarted(true);
      observer.disconnect();
    }, { rootMargin: "0px 0px -6%", threshold: 0.12 });
    observer.observe(heading);
    return () => observer.disconnect();
  }, [text]);

  useEffect(() => {
    if (!started || progress >= text.length) return;
    const timer = window.setTimeout(() => {
      setProgress(value => Math.min(text.length, value + 1));
      setFrame(value => value + 1);
    }, variant === "decrypt" ? 29 : 38);
    return () => window.clearTimeout(timer);
  }, [frame, progress, started, text.length, variant]);

  const output = variant === "type"
    ? text.slice(0, progress)
    : text.split("").map((character, position) => {
      if (character === " " || position < progress) return character;
      return glyphs[(position * 7 + frame * 3) % glyphs.length];
    }).join("");

  return <Tag ref={ref} className={`reveal-heading ${started ? "is-typing" : ""} ${progress >= text.length ? "is-complete" : ""} ${className}`} aria-label={text}><span className="reveal-placeholder" aria-hidden="true">{text}</span><span className="reveal-output" aria-hidden="true">{started ? output : ""}</span></Tag>;
}

export function usePageMotion(pathname: string) {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const selector = [
      ".section-head", ".hero-system", ".terminal-window", ".whoami", ".process-step",
      ".proof-list > div", ".credential-grid > article", ".service-grid > article",
      ".faq-list > details", ".legal-copy > section", ".blog-grid > article",
      ".about-intro > *", ".contact-grid > *", ".cv-layout > *", ".related-grid > a",
      ".payment-note", ".final-cta .shell", ".footer-grid > div",
    ].join(", ");
    const observed = new WeakSet<Element>();
    const mobile = window.matchMedia("(max-width: 620px)").matches;
    const observer = reduced || !("IntersectionObserver" in window) ? null : new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer?.unobserve(entry.target);
        }
      });
    }, { rootMargin: mobile ? "0px 0px -3%" : "0px 0px -8%", threshold: mobile ? 0.05 : 0.1 });

    const register = (root: ParentNode = document) => {
      const targets = Array.from(root.querySelectorAll<HTMLElement>(selector));
      targets.forEach(target => {
        if (observed.has(target)) return;
        observed.add(target);
        const siblings = target.parentElement ? Array.from(target.parentElement.children).filter(child => child.matches(selector)) : [];
        const index = Math.max(0, siblings.indexOf(target));
        target.classList.add("reveal-item");
        target.style.setProperty("--reveal-delay", `${Math.min(index, 3) * (mobile ? 45 : 70)}ms`);
        if (!observer) target.classList.add("is-visible");
        else observer.observe(target);
      });
    };

    register();
    const mutations = new MutationObserver(records => records.forEach(record => record.addedNodes.forEach(node => {
      if (node instanceof HTMLElement) {
        if (node.matches(selector)) register(node.parentElement || document);
        register(node);
      }
    })));
    mutations.observe(document.querySelector("main") || document.body, { childList: true, subtree: true });
    return () => { observer?.disconnect(); mutations.disconnect(); };
  }, [pathname]);
}
