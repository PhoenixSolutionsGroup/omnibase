export type Context = { subject: never };

export interface Namespace {
  related?: { [relation: string]: Namespace[] };
  permits?: { [method: string]: (ctx: Context) => boolean };
}

export interface KetoArray extends Array<Namespace> {
  includes(element: Namespace): boolean;
  traverse(iteratorfn: (element: Namespace) => boolean): boolean;
}

export type SubjectSet<
  A extends Namespace,
  R extends keyof A["related"]
> = A["related"][R] extends Array<infer T> ? T : never;
