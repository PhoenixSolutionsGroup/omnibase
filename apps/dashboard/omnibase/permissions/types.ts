export type Context = { subject: never };

export interface Namespace {
  related?: { [relation: string]: Namespace[] };
  permits?: { [method: string]: (ctx: Context) => boolean };
}

declare global {
  interface Array<T> {
    includes(element: T): boolean;
    traverse(iteratorfn: (element: T) => boolean): boolean;
  }
}

export type SubjectSet<
  A extends Namespace,
  R extends keyof A["related"]
> = A["related"][R] extends Array<infer T> ? T : never;
