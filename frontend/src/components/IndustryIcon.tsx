import type { ReactNode } from "react";

export type IconName = "laser" | "bend" | "weld" | "building" | "drawing" | "quote" | "calendar" | "machine" | "quality" | "phone" | "measure" | "payment" | "truck";

export default function IndustryIcon({ name, size = 34 }: { name: IconName; size?: number }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const drawings: Record<IconName, ReactNode> = {
    laser: <><path d="M4 5h16v14H4zM8 9h8M8 13h4" /><path d="M15 12l-2 5m4-3l-4 3m4 0l-4-3" /></>,
    bend: <><path d="M3 18h18M5 6h14M7 9v5l4 3h8M17 7v7" /><path d="M12 9l-2 3 2 2" /></>,
    weld: <><path d="M4 18l7-7 3 3-7 7H4zM13 8l3-3 3 3-3 3M17 16l1 2m3-5l-2 1m-4 4l-1 2" /></>,
    building: <><path d="M4 21V8l8-5 8 5v13M8 21v-6h8v6M8 10h2m4 0h2M3 21h18" /></>,
    drawing: <><path d="M5 3h10l4 4v14H5zM15 3v5h4M8 12h8M8 16h5" /><path d="M18 13l2 2-4 4-2 .5.5-2z" /></>,
    quote: <><path d="M4 4h16v16H4zM8 9h8M8 13h5M8 17h3" /><path d="M17 15l1 1 2-3" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M7 3v4m10-4v4M3 10h18M8 14h3m-3 3h6" /></>,
    machine: <><path d="M3 19h18M5 19V8h14v11M8 8V5h8v3M9 12h6v4H9zM12 9v3" /><path d="M17 12h2M5 12h2" /></>,
    quality: <><path d="M12 2l8 4v6c0 5-3.2 8.2-8 10-4.8-1.8-8-5-8-10V6z" /><path d="M8 12l3 3 5-6" /></>,
    phone: <><path d="M7 3h10a2 2 0 012 2v14a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2zM10 18h4" /><path d="M9 8c1 3 3 5 6 6" /></>,
    measure: <><path d="M3 6h18v12H3zM7 6v4m4-4v3m4-3v4m4-4v3" /><path d="M7 14h10" /></>,
    payment: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 10h18M7 15h4M16 15l1 1 2-2" /></>,
    truck: <><path d="M2 6h12v11H2zM14 10h4l4 4v3h-8z" /><circle cx="6" cy="18" r="2" /><circle cx="18" cy="18" r="2" /></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" {...common} aria-hidden="true" focusable="false">{drawings[name]}</svg>;
}
