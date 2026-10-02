const MESSAGE_SET_CSS = "omni/custom-css/set";
const MESSAGE_CLEAR_CSS = "omni/custom-css/clear";
const STYLE_ID = "omni-custom-css";

function applyCustomCss(css: string) {
  let style = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
  if (!style) {
    style = document.createElement("style");
    style.id = STYLE_ID;
    document.head.appendChild(style);
  }
  style.textContent = css;
}

function clearCustomCss() {
  document.getElementById(STYLE_ID)?.remove();
}

export function registerCustomCssBridge() {
  const onMessage = (event: MessageEvent) => {
    const data = event.data as { type?: string; css?: string } | undefined;
    if (data?.type === MESSAGE_SET_CSS && typeof data.css === "string") {
      applyCustomCss(data.css);
    }
    if (data?.type === MESSAGE_CLEAR_CSS) {
      clearCustomCss();
    }
  };
  window.addEventListener("message", onMessage);
  return () => window.removeEventListener("message", onMessage);
}

export function broadcastCustomCss(css: string) {
  document.querySelectorAll("iframe").forEach((iframe) => {
    iframe.contentWindow?.postMessage({ type: MESSAGE_SET_CSS, css }, "*");
  });
}

export function broadcastClearCustomCss() {
  document.querySelectorAll("iframe").forEach((iframe) => {
    iframe.contentWindow?.postMessage({ type: MESSAGE_CLEAR_CSS }, "*");
  });
}

export { MESSAGE_SET_CSS, MESSAGE_CLEAR_CSS, STYLE_ID };
