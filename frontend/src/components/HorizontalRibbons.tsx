"use client";
import { useEffect } from "react";
export default function HorizontalRibbons() {
  useEffect(() => {
    let drag: { node: HTMLElement; pointer: number; x: number; scroll: number; moved: boolean } | null = null;
    let suppress: HTMLElement | null = null;
    const selector = ".public-site .project-album-ribbon, .public-site .home-offering-ribbon, .public-site .laser-scope-grid, .public-site .partner-logo-strip";
    const down = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || event.button !== 0 || !(event.target instanceof Element)) return;
      const node = event.target.closest<HTMLElement>(selector);
      suppress = null;
      if (node?.classList.contains("logo-marquee") && !matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      if (node && node.scrollWidth > node.clientWidth) {
        drag = { node, pointer: event.pointerId, x: event.clientX, scroll: node.scrollLeft, moved: false };
        document.addEventListener("pointermove",move,{passive:false});
      }
    };
    const move = (event: PointerEvent) => {
      if (!drag || drag.pointer !== event.pointerId || event.buttons !== 1) return;
      const distance = event.clientX - drag.x;
      if (!drag.moved && Math.abs(distance) < 8) return;
      if (!drag.moved) { drag.node.setPointerCapture(event.pointerId); drag.moved = true; drag.node.classList.add("is-dragging"); }
      drag.node.scrollLeft = drag.scroll - distance; event.preventDefault();
    };
    const up = () => { if (drag) { if (drag.moved) suppress = drag.node; drag.node.classList.remove("is-dragging"); } drag = null; document.removeEventListener("pointermove",move); };
    const cancel = () => { up(); suppress = null; };
    const click = (event: MouseEvent) => { if (suppress && event.target instanceof Node && suppress.contains(event.target)) { event.preventDefault(); event.stopPropagation(); } suppress = null; };
    const key = (event: KeyboardEvent) => {
      const node = event.target;
      if (!(node instanceof HTMLElement) || !node.matches(selector) || !["ArrowLeft","ArrowRight","Home","End"].includes(event.key)) return;
      if (node.classList.contains("logo-marquee") && !matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      event.preventDefault(); const left = event.key === "Home" ? 0 : event.key === "End" ? node.scrollWidth - node.clientWidth : node.scrollLeft + (event.key === "ArrowRight" ? 1 : -1) * node.clientWidth * .8;
      node.scrollTo({left,behavior:matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth"});
    };
    const preventNativeDrag = (event: DragEvent) => { if (event.target instanceof Element && event.target.closest(selector)) event.preventDefault(); };
    document.addEventListener("pointerdown",down,{passive:true}); document.addEventListener("pointerup",up); document.addEventListener("pointercancel",cancel); document.addEventListener("click",click,true); document.addEventListener("keydown",key); document.addEventListener("dragstart",preventNativeDrag);
    return () => { cancel(); document.removeEventListener("pointerdown",down); document.removeEventListener("pointermove",move); document.removeEventListener("pointerup",up); document.removeEventListener("pointercancel",cancel); document.removeEventListener("click",click,true); document.removeEventListener("keydown",key); document.removeEventListener("dragstart",preventNativeDrag); };
  }, []);
  return null;
}
