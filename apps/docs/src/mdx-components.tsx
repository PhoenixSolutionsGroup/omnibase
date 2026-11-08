import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
import { OpenAPIPage } from '@/components/api-page';
import { Tab, Tabs } from 'fumadocs-ui/components/tabs';
import { Step, Steps } from 'fumadocs-ui/components/steps';
import { ChangelogEntry, ChangelogFilter } from '@/components/changelog-filter';

export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    OpenAPIPage,
    Tab,
    Tabs,
    Step,
    Steps,
    ChangelogFilter,
    ChangelogEntry,
    ...components,
  };
}
