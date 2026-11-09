import type * as PageTree from "fumadocs-core/page-tree";
import { getLayoutTabs, type BaseLayoutProps, type LayoutTab } from "fumadocs-ui/layouts/shared";

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: "Omnibase",
    },
  };
}

function firstPageUrl(nodes: PageTree.Node[]): string | undefined {
  for (const node of nodes) {
    if (node.type === "page" && !node.external) return node.url;
    if (node.type === "folder") {
      const url = node.index?.url ?? firstPageUrl(node.children);
      if (url) return url;
    }
  }
}

function tabIcon(icon: PageTree.Folder["icon"]) {
  if (!icon) return undefined;
  return (
    <div className="size-full [&_svg]:size-full max-md:p-1.5 max-md:rounded-md max-md:border max-md:bg-fd-secondary">
      {icon}
    </div>
  );
}

export function layoutTabs(tree: PageTree.Root): LayoutTab[] {
  const tabs = getLayoutTabs(tree);
  const covered = new Set(tabs.map((tab) => tab.$folder));

  const visit = (folder: PageTree.Folder) => {
    if (folder.root && !covered.has(folder)) {
      const url = firstPageUrl(folder.children);
      if (url) {
        tabs.push({
          title: folder.name,
          icon: tabIcon(folder.icon),
          description: folder.description,
          url,
          $folder: folder,
        });
      }
    }
    for (const child of folder.children) if (child.type === "folder") visit(child);
  };
  for (const child of tree.children) if (child.type === "folder") visit(child);

  return tabs;
}
