// In-memory component/timer tests, not browser or screenshot verification.
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import postcss from "postcss";
const require = createRequire(import.meta.url);
const frontend = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const compile = source => ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText;

export async function harness(filename, props, reduced = false, options = {}) {
  const slots = []; let cursor = 0, dirty = false, tree, pending = [], clock = 0, id = 0;
  const timers = new Map(), listeners = new Map();
  const hooks = {
    useCallback(callback) { return callback; },
    useMemo(callback) { return callback(); },
    useState(initial) {
      const index = cursor++;
      if (!(index in slots)) slots[index] = typeof initial === "function" ? initial() : initial;
      return [slots[index], value => { const next = typeof value === "function" ? value(slots[index]) : value; if (!Object.is(next, slots[index])) { slots[index] = next; dirty = true; } }];
    },
    useRef(initial) { const index = cursor++; return slots[index] ||= { current: initial }; },
    useEffect(callback, deps) {
      const index = cursor++, previous = slots[index];
      if (!previous || deps.some((value, i) => !Object.is(value, previous.deps[i]))) {
        pending.push(() => { previous?.cleanup?.(); slots[index] = { deps, cleanup: callback() }; });
      }
    },
  };
  const doc = { hidden: false, modalOpen: false, querySelector: () => doc.modalOpen ? {} : null, activeElement: null, body:{style:{overflow:""}}, addEventListener: (name, fn) => listeners.set(name, fn), removeEventListener: name => listeners.delete(name) };
  const timer = (fn, delay, repeat) => { const key = ++id; timers.set(key, { fn, delay, repeat, due: clock + delay }); return key; };
  const win = { matchMedia: () => ({ matches: reduced }), innerHeight: 900, addEventListener: (name, fn) => listeners.set(`window:${name}`, fn), removeEventListener: name => listeners.delete(`window:${name}`), dispatchEvent: event => { listeners.get(`window:${event.type}`)?.(event); return true; }, setTimeout: (fn, delay) => timer(fn, delay, false), clearTimeout: key => timers.delete(key), setInterval: (fn, delay) => timer(fn, delay, true), clearInterval: key => timers.delete(key) };
  const module = { exports: {} };
  const imports = name => options.imports?.[name] || (name === "react" ? hooks : name === "react/jsx-runtime" ? require(name) : name.endsWith("AdminOrderList") ? { __esModule: true, default: () => null, focusEditorRecord() {} } : name.endsWith("jakartaDate") ? { jakartaDate: () => "2026-10-17" } : { __esModule: true, default: () => null });
  new Function("require", "module", "exports", "window", "document", "sessionStorage", compile(await readFile(path.join(frontend, filename), "utf8")))(imports, module, module.exports, win, doc, options.storage);
  function render() { let count = 0; do { dirty = false; cursor = 0; pending = []; tree = module.exports.default(props); pending.forEach(fn => fn()); assert.ok(++count < 12, "No render loop"); } while (dirty); return tree; }
  function walk(node, predicate) { if (!node || typeof node !== "object") return undefined; if (predicate(node)) return node; for (const child of [node.props?.children].flat(Infinity)) { const found = walk(child, predicate); if (found) return found; } }
  return {
    document: doc,
    render,
    find: predicate => { render(); const node = walk(tree, predicate); assert.ok(node, "Expected component element"); return node; },
    absent: predicate => { render(); return !walk(tree, predicate); },
    advance(ms) { clock += ms; for (const [key, current] of [...timers]) if (current.due <= clock && timers.has(key)) { if (current.repeat) current.due = clock + current.delay; else timers.delete(key); current.fn(); } render(); },
    hidden(value) { doc.hidden = value; listeners.get("visibilitychange")?.(); render(); },
    modal(value) { doc.modalOpen = value; listeners.get("toggle")?.(); render(); },
    dispose() { for (const slot of slots) slot?.cleanup?.(); timers.clear(); },
  };
}
const slides = ["Satu", "Dua", "Tiga"].map((title, i) => ({ id: String(i), title, type: "image", media: "/images/example.jpg", eyebrow: "Layanan", accent: "Baja", description: "Kebutuhan material", primaryAction: { href: "/jasa", label: "Lihat jasa" }, secondaryAction: { href: "/kontak", label: "Hubungi kami" } }));
const heroProps = { slides, rating: 4.5, ratingDate: "6 Oktober 2026", mapsUrl: "https://maps.google.com/" };
const title = harness => harness.find(node => node.type === "h1").props.children[0];
const hero = await harness("src/components/HeroCarousel.tsx", heroProps);
assert.equal(title(hero), "Satu");
assert.ok(hero.absent(node => node.props?.className === "hero-slide-dots" || node.props?.className === "hero-carousel-pause"));
hero.advance(4999); assert.equal(title(hero), "Satu");
hero.advance(1); assert.equal(title(hero), "Dua");
assert.equal(hero.find(node => node.type === "section").props.onMouseEnter, undefined, "Pointer hover must not freeze the hero");
hero.advance(5000); assert.equal(title(hero), "Tiga");
hero.find(node => node.type === "section").props.onFocusCapture(); hero.render(); hero.advance(5000); assert.equal(title(hero), "Tiga");
hero.find(node => node.type === "section").props.onBlurCapture({currentTarget:{contains:()=>false}}); hero.render();
const control = () => hero.find(node => node.props?.className === "carousel-keyboard-control");
control().props.onClick(); hero.render(); hero.advance(5000); assert.equal(title(hero), "Tiga");
control().props.onClick(); hero.render(); hero.advance(5000); assert.equal(title(hero), "Satu");
hero.hidden(true); hero.advance(5000); assert.equal(title(hero), "Satu"); hero.hidden(false); hero.advance(5000); assert.equal(title(hero), "Dua");
hero.modal(true); hero.advance(10000); assert.equal(title(hero), "Dua", "A covering dialog pauses background slide downloads and rotation");
hero.modal(false); hero.advance(5000); assert.equal(title(hero), "Tiga", "Rotation resumes after the dialog closes");
hero.dispose();
const reducedHero = await harness("src/components/HeroCarousel.tsx", heroProps, true); reducedHero.advance(8000); assert.equal(title(reducedHero), "Satu"); reducedHero.dispose();
const videoHero = await harness("src/components/HeroCarousel.tsx", { ...heroProps, slides: [{ ...slides[0], type: "video" }, slides[1]] });
let videoPlays = 0, videoPauses = 0;
videoHero.find(node => node.type === "video").props.ref({ play() { videoPlays++; return Promise.resolve(); }, pause() { videoPauses++; } });
videoHero.find(node => node.type === "section").props.onFocusCapture(); videoHero.render(); assert.ok(videoPauses > 0);
videoHero.find(node => node.type === "section").props.onBlurCapture({ currentTarget: { contains: () => false } }); videoHero.render(); assert.ok(videoPlays > 0);
videoHero.find(node => node.type === "video").props.onEnded(); videoHero.render(); assert.equal(title(videoHero), "Dua");
videoHero.advance(5000); assert.equal(title(videoHero), "Dua", "An ended hero video is not replayed on every image cycle"); videoHero.dispose();
console.log("PASS: hero changes after exactly 5 seconds without hover freeze; keyboard focus/control, visibility and reduced-motion pauses preserved");
const subhero = await harness("src/components/RotatingHeroMedia.tsx", {images:["/images/a.jpg","/images/b.jpg"]});
const activePhoto = () => subhero.find(node=>node.props?.className === "is-active").props.src;
assert.equal(activePhoto(),"/images/a.jpg"); subhero.advance(4999); assert.equal(activePhoto(),"/images/a.jpg"); subhero.advance(1); assert.equal(activePhoto(),"/images/b.jpg");
subhero.find(node=>node.type === "button").props.onClick(); subhero.render(); subhero.advance(5000); assert.equal(activePhoto(),"/images/b.jpg"); subhero.dispose();
console.log("PASS: subpage hero images rotate at 5 seconds and can be paused with the keyboard control");

const promos = await harness("src/components/Promotions.tsx", { promotions: [1, 2, 3].map(id => ({ id, title: `Promo ${id}`, published: true })) }, false, {imports: {"../data/promotionOrder": {prioritizePromotions: items => [...items].sort((a,b)=>(b.priority||0)-(a.priority||0))}}});
const track = () => promos.find(node => node.props?.className?.startsWith("home-promos-track"));
const node = { offsetLeft: 0, scrollLeft: 0, clientWidth: 400, scrollWidth: 1200, children: [{ offsetLeft: 0 }, { offsetLeft: 400 }, { offsetLeft: 800 }], getBoundingClientRect: () => ({ top: 0, bottom: 300 }), scrollTo({ left }) { this.scrollLeft = left; }, setPointerCapture() {}, contains: () => false, matches: () => false };
track().props.ref.current = node;
promos.advance(4000); assert.equal(node.scrollLeft, 400);
assert.ok(promos.absent(element => element.props?.className === "promo-motion-toggle"));
track().props.onMouseEnter(); promos.render(); promos.advance(4000); assert.equal(node.scrollLeft, 400);
track().props.onPointerDown({ pointerType: "mouse", button: 0, pointerId: 1, clientX: 200, currentTarget: node });
track().props.onPointerMove({ buttons: 1, pointerId: 1, clientX: 100, currentTarget: node }); promos.render(); assert.equal(node.scrollLeft, 500);
track().props.onPointerUp(); promos.render();
let prevented = false; track().props.onClickCapture({ preventDefault() { prevented = true; }, stopPropagation() {} }); assert.ok(prevented, "Dragging does not accidentally open a promo");
prevented = false; track().props.onClickCapture({ preventDefault() { prevented = true; }, stopPropagation() {} }); assert.ok(!prevented, "Normal clicks still open a promo");
track().props.onKeyDown({ target: node, currentTarget: node, key: "End", preventDefault() {} }); assert.equal(node.scrollLeft, 800);
track().props.onKeyDown({ target: node, currentTarget: node, key: "Home", preventDefault() {} }); assert.equal(node.scrollLeft, 0);
track().props.onMouseLeave({ currentTarget: node }); promos.render(); promos.advance(4000); assert.equal(node.scrollLeft, 400);
promos.dispose();
console.log("PASS: promo autoplay, mouse drag, drag-click suppression, normal clicks and keyboard navigation with no visible motion toggle");

const css = postcss.parse(await readFile(path.join(frontend, "src/client-readability.css"), "utf8"));
function declaration(selector, property, value) { let found = false; css.walkRules(rule => { if (rule.selector === selector) rule.walkDecls(property, decl => { if (decl.value === value) found = true; }); }); assert.ok(found, `${selector}: ${property}=${value}`); }
declaration(".hero-carousel .hero-rating-link strong", "font-size", "22px");
declaration(".hero-carousel .hero-rating-stars", "font-size", "29px");
declaration(".hero-carousel .hero-rating-link small", "font-size", "14px");
declaration(".promos-restored .home-promos-track", "scrollbar-width", "none");
declaration(".promos-restored .home-promos-track::-webkit-scrollbar", "display", "none");
declaration(".company-division-top :is(img,svg.corporate-logo)", "width", "180px");
declaration(".company-division-top :is(img,svg.corporate-logo)", "width", "138px");
declaration(".carousel-keyboard-control:focus", "clip-path", "none");
const module = { exports: {} }; new Function("module", "exports", compile(await readFile(path.join(frontend, "src/data/corporateLogos.ts"), "utf8")))(module, module.exports);
const frames = module.exports.corporateLogoFrames;
assert.equal(frames["/images/brand/mahameru-retail.png"].name, "mmn"); assert.equal(frames["/images/brand/garuda.png"].name, "gmb");
assert.equal(frames["/images/brand/mahameru-retail.png"].wordmark,"MAHAMERU BAJA");
assert.equal(frames["/images/brand/mahameru-retail.png"].clip,"polygon(40px 35px,650px 35px,650px 465px,40px 465px)","Old MMN lettering is outside the retained symbol crop");
for (const name of ["mbi-laser", "mbi-trading", "mbi-proyek"]) assert.equal(frames[`/images/brand/${name}.png`].name, "mbi");
assert.equal(frames["/api/cms/media/custom.png"], undefined, "Custom uploaded identity never remapped");
const brand = await readFile(path.join(frontend, "src/components/Navbar.tsx"), "utf8");
assert.ok(brand.includes('"MBI LASER CUTTING"') && brand.includes('"MAHAMERU BAJA INDONESIA"'));
console.log("PASS: larger desktop/mobile text, hidden scrollbar/focus-only control CSS, original trio mapping and custom-CMS-logo preservation (code checks, not visual QA)");
