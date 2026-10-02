import { createElement } from "react";
import { useCallback, useEffect, useState } from "react";
import { addons, types } from "storybook/manager-api";
import { IconButton } from "storybook/internal/components";
import { PaintBrushIcon, TrashIcon } from "@storybook/icons";
import {
  broadcastClearCustomCss,
  broadcastCustomCss,
} from "@omnibase/mitosis-storybook/custom-css-bridge";

const TITLE = "Load a custom stylesheet (e.g. a shadcn theme) into the preview";

function CustomCssButton() {
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(timer);
  }, [toast]);

  const onPick = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      event.target.value = "";
      if (!file) return;
      const text = await file.text();
      broadcastCustomCss(text);
      setToast(`applied ${file.name}`);
    },
    [],
  );

  const load = createElement(
    IconButton,
    {
      key: "load-custom-css",
      ariaLabel: TITLE,
      title: TITLE,
      onClick: () => document.getElementById("omni-css-file")?.click(),
    },
    createElement(PaintBrushIcon),
  );

  const clear = createElement(
    IconButton,
    {
      key: "clear-custom-css",
      ariaLabel: "Remove custom stylesheet",
      title: "Remove custom stylesheet",
      onClick: () => {
        broadcastClearCustomCss();
        setToast("cleared");
      },
    },
    createElement(TrashIcon),
  );

  const file = createElement("input", {
    key: "file",
    id: "omni-css-file",
    type: "file",
    accept: ".css,text/css",
    onChange: onPick,
    style: { display: "none" },
  });

  const badge = toast
    ? createElement(
        "div",
        {
          key: "toast",
          style: {
            position: "absolute",
            top: "100%",
            right: 0,
            marginTop: 4,
            padding: "2px 8px",
            borderRadius: 4,
            fontSize: 11,
            whiteSpace: "nowrap",
            background: "rgba(0,0,0,0.75)",
            color: "#fff",
          },
        },
        toast,
      )
    : null;

  return createElement(
    "div",
    { style: { position: "relative" } },
    load,
    clear,
    file,
    badge,
  );
}

addons.register("omni/custom-css", () => {
  addons.add("omni/custom-css/tool", {
    type: types.TOOL,
    title: TITLE,
    render: () => createElement(CustomCssButton),
  });
});
