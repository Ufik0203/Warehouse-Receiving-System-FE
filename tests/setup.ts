import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  sessionStorage.clear();
});
class Observer {
  observe() {}
  unobserve() {}
  disconnect() {}
}
vi.stubGlobal("ResizeObserver", Observer);
Element.prototype.scrollIntoView = () => undefined;
Object.defineProperty(window, "matchMedia", {
  value: () => ({
    matches: false,
    addListener: () => undefined,
    removeListener: () => undefined,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    dispatchEvent: () => false,
  }),
});

// jsdom lacks CSS.escape, used by React Aria when opening the actual Select.
// Hex-escape each code point so generated DOM IDs remain valid CSS identifiers.
if (!globalThis.CSS?.escape)
  vi.stubGlobal("CSS", {
    escape: (value: string) =>
      Array.from(
        value,
        (char) => `\\${(char.codePointAt(0) || 0xfffd).toString(16)} `,
      ).join(""),
  });
