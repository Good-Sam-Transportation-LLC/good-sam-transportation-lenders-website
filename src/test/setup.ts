import "@testing-library/jest-dom";

const intersectionObserverMock = () => ({
  observe: () => {},
  unobserve: () => {},
  disconnect: () => {},
});
window.IntersectionObserver = vi.fn().mockImplementation(intersectionObserverMock);

const resizeObserverMock = () => ({
  observe: () => {},
  unobserve: () => {},
  disconnect: () => {},
});
window.ResizeObserver = vi.fn().mockImplementation(resizeObserverMock);

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});
