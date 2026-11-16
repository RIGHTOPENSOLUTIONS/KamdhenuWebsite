"use strict";
// Run with: node tests/homepage-components.test.js. All fixtures stay in memory.
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const schemeTools = require("../assets/js/schemes.js");
const publishedData = require("../assets/js/data/schemes.json");
let passed = 0;
function test(name, action) { action(); passed++; console.log("PASS " + name); }
function copy(value) { return JSON.parse(JSON.stringify(value)); }

test("the published catalogue contains only pending entries, without financial terms or PDFs", () => {
  schemeTools.validateSchemeData(publishedData);
  assert.strictEqual(publishedData.categories.length, 4);
  publishedData.categories.forEach(category => category.schemes.forEach(scheme => {
    assert.strictEqual(scheme.status, "pending");
    assert.strictEqual(scheme.name, null);
    assert.strictEqual(scheme.approval, null);
    assert.deepEqual(scheme.details, []);
    assert.deepEqual(scheme.documents, []);
  }));
});

// Explicitly synthetic test content, never written to the public catalogue.
function approvedFixture() {
  const data = copy(publishedData);
  data.categories[0].schemes[0] = {
    id: "test-only", status: "approved", subcategory: null,
    name: "TEST FIXTURE — NOT AN OFFERING", description: "Synthetic validator test only.",
    approval: { reference: "TEST-ONLY" }, documents: [],
    details: [
      { type: "text", text: "Synthetic explanatory text." },
      { type: "list", items: ["Synthetic condition"] },
      { type: "facts", items: [{ label: "Custom field", value: "Synthetic value" }] },
      { type: "table", heading: "Synthetic custom table", columns: ["Label", "Text"], rows: [["Custom row", "Synthetic text"]] }
    ]
  };
  return data;
}
test("different detail structures and multiple schemes share a category without calculation fields", () => {
  const data = approvedFixture();
  const another = copy(data.categories[0].schemes[0]);
  another.id = "test-only-another";
  another.details = [{ type: "text", heading: "Different structure", text: "No shared maturity model." }];
  data.categories[0].schemes.push(another);
  assert.strictEqual(schemeTools.validateSchemeData(data), data);
});
test("approved content requires an approval reference", () => {
  const data = approvedFixture();
  data.categories[0].schemes[0].approval = null;
  assert.throws(() => schemeTools.validateSchemeData(data));
});
test("duplicate identifiers, unknown subcategories and inconsistent tables are rejected", () => {
  const duplicate = copy(publishedData);
  duplicate.categories[1].schemes[0].id = duplicate.categories[0].schemes[0].id;
  assert.throws(() => schemeTools.validateSchemeData(duplicate));
  const unknown = copy(publishedData);
  unknown.categories[2].schemes[0].subcategory = "unknown";
  assert.throws(() => schemeTools.validateSchemeData(unknown));
  const table = approvedFixture();
  table.categories[0].schemes[0].details[3].rows = [["Missing a cell"]];
  assert.throws(() => schemeTools.validateSchemeData(table));
});
test("PDF URLs remain inside the local scheme directory", () => {
  assert.strictEqual(schemeTools.documentHref("assets/documents/schemes/test-only.pdf"), "./assets/documents/schemes/test-only.pdf");
  ["https://example.test/test.pdf", "/assets/documents/schemes/test.pdf", "assets/documents/schemes/../private.pdf", "assets/documents/schemes/%2e%2e/test.pdf", "assets/documents/schemes/test.html", "assets/documents/schemes/test.pdf?remote=1"].forEach(value => assert.throws(() => schemeTools.documentHref(value)));
});

// A minimal event/timer harness exercises the actual carousel script, without a browser dependency.
function target() {
  const listeners = {};
  const attributes = {};
  return {
    hidden: false, textContent: "", style: {}, classList: { toggle: () => {} },
    getBoundingClientRect: () => ({ height: 660 }),
    addEventListener: (name, listener) => { (listeners[name] || (listeners[name] = [])).push(listener); },
    emit: (name, event) => (listeners[name] || []).forEach(listener => listener(event || {})),
    setAttribute: (name, value) => { attributes[name] = value; },
    getAttribute: name => Object.prototype.hasOwnProperty.call(attributes, name) ? attributes[name] : null,
    removeAttribute: name => { delete attributes[name]; },
    contains: () => false
  };
}
function carouselFixture(reducedMotion) {
  const carousel = target();
  const document = target();
  const motion = target();
  motion.matches = !!reducedMotion;
  document.activeElement = null;
  document.hidden = false;
  const slides = [0, 1, 2, 3].map(index => {
    const slide = target();
    slide.hidden = index !== 0;
    slide.getBoundingClientRect = () => ({ height: [800, 760, 810, 850][index] });
    slide.setAttribute("aria-label", (index + 1) + " of 4");
    return slide;
  });
  const indicators = slides.map(() => target());
  const selectors = {};
  ["controls", "rotation", "announcement", "current", "previous", "next", "slides"].forEach(name => { selectors["[data-carousel-" + name + "]"] = target(); });
  const rotation = selectors["[data-carousel-rotation]"];
  const rotationLabel = target();
  rotation.querySelector = selector => selector === "[data-carousel-rotation-label]" ? rotationLabel : target();
  carousel.querySelectorAll = selector => selector === ".carousel-slide" ? slides : indicators;
  carousel.querySelector = selector => selectors[selector];
  carousel.focus = () => { document.activeElement = carousel; carousel.emit("focusin"); };
  document.querySelector = () => carousel;
  let now = 0;
  let nextId = 0;
  const timers = new Map();
  const window = {
    addEventListener: () => {},
    matchMedia: () => motion,
    setTimeout: (callback, delay) => { const id = ++nextId; timers.set(id, { at: now + delay, callback }); return id; },
    clearTimeout: id => timers.delete(id)
  };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, "../assets/js/carousel.js"), "utf8"), { document, window });
  return {
    carousel, document, motion, slides, indicators, rotation, selectors,
    active: () => slides.findIndex(slide => !slide.hidden),
    tick: milliseconds => {
      now += milliseconds;
      const due = Array.from(timers.entries()).filter(entry => entry[1].at <= now);
      due.forEach(entry => { timers.delete(entry[0]); entry[1].callback(); });
    }
  };
}
test("automatic rotation waits five seconds; hover pauses and leaving resumes", () => {
  const fixture = carouselFixture(false);
  fixture.tick(4999); assert.strictEqual(fixture.active(), 0);
  fixture.tick(1); assert.strictEqual(fixture.active(), 1);
  fixture.carousel.emit("mouseenter"); fixture.tick(10000); assert.strictEqual(fixture.active(), 1);
  fixture.carousel.emit("mouseleave"); fixture.tick(5000); assert.strictEqual(fixture.active(), 2);
});
test("the tallest slide reserves a stable area while inactive slides stay hidden", () => {
  const fixture = carouselFixture(false);
  assert.strictEqual(fixture.selectors["[data-carousel-slides]"].style.height, "850px");
  assert.strictEqual(fixture.slides.filter(slide => !slide.hidden).length, 1);
});
test("focus and manual navigation stop rotation, with wrapping and keyboard selection", () => {
  const fixture = carouselFixture(false);
  fixture.carousel.emit("focusin"); fixture.tick(10000); assert.strictEqual(fixture.active(), 0);
  fixture.selectors["[data-carousel-previous]"].emit("click"); assert.strictEqual(fixture.active(), 3);
  fixture.selectors["[data-carousel-next]"].emit("click"); assert.strictEqual(fixture.active(), 0);
  fixture.carousel.emit("keydown", { key: "End", preventDefault: () => {} }); assert.strictEqual(fixture.active(), 3);
  fixture.carousel.emit("keydown", { key: "ArrowLeft", preventDefault: () => {} }); assert.strictEqual(fixture.active(), 2);
  fixture.tick(10000); assert.strictEqual(fixture.active(), 2);
});
test("pointer Pause remains paused after the focus event; explicit Play restarts", () => {
  const fixture = carouselFixture(false);
  fixture.rotation.emit("pointerdown"); fixture.carousel.emit("focusin"); fixture.rotation.emit("click");
  fixture.tick(5000); assert.strictEqual(fixture.active(), 0);
  fixture.rotation.emit("click"); fixture.tick(5000); assert.strictEqual(fixture.active(), 1);
});
test("reduced motion defaults to paused and changing the preference stops rotation", () => {
  const fixture = carouselFixture(true);
  fixture.tick(10000); assert.strictEqual(fixture.active(), 0);
  fixture.rotation.emit("click"); fixture.tick(5000); assert.strictEqual(fixture.active(), 1);
  fixture.motion.emit("change"); fixture.tick(10000); assert.strictEqual(fixture.active(), 1);
});
test("horizontal touch swipes navigate; vertical gestures and cancelled touches do not", () => {
  const fixture = carouselFixture(false);
  const area = fixture.selectors["[data-carousel-slides]"];
  const swipe = (x, y) => {
    area.emit("touchstart", { touches: [{ clientX: 200, clientY: 100 }] });
    area.emit("touchend", { changedTouches: [{ clientX: x, clientY: y }] });
  };
  swipe(100, 105); assert.strictEqual(fixture.active(), 1);
  swipe(300, 105); assert.strictEqual(fixture.active(), 0);
  swipe(210, 240); assert.strictEqual(fixture.active(), 0);
  area.emit("touchstart", { touches: [{ clientX: 200, clientY: 100 }] });
  area.emit("touchcancel"); area.emit("touchend", { changedTouches: [{ clientX: 100, clientY: 100 }] });
  assert.strictEqual(fixture.active(), 0);
});
console.log(passed + " homepage component checks passed.");
