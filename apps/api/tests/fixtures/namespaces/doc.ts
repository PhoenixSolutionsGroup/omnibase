import { Context, Namespace } from "./types";

export class Doc implements Namespace {
  related: {
    /**
     * @group Docs
     * @displayName Owner
     * @role doc_owner
     */
    owner: User[];

    /**
     * @group Docs
     * @displayName Editor
     * @role doc_editor
     */
    editor: User[];
  };

  permits = {
    edit: (ctx: Context): boolean =>
      this.related.owner.includes(ctx.subject) ||
      this.related.editor.includes(ctx.subject),
  };
}
