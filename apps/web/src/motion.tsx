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
  const [started, setStarted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || !("IntersectionObserver" in window)) {
      setProgress(text.length);
      setStarted(true);
      return;
    }
    setStarted(true);
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
    const targets = Array.from(document.querySelectorAll<HTMLElement>(
      ".section-head, .terminal-window, .process-step, .proof-list > div, .credential-grid > article, .service-grid > article, .faq-list > details, .legal-copy > section, .blog-grid > article",
    ));

    targets.forEach((target, index) => {
      target.classList.add("reveal-item");
      target.style.setProperty("--reveal-delay", `${Math.min(index % 4, 3) * 70}ms`);
    });

    if (reduced || !("IntersectionObserver" in window)) {
      targets.forEach(target => target.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -7%", threshold: 0.08 });
    targets.forEach(target => observer.observe(target));
    return () => observer.disconnect();
  }, [pathname]);
}
