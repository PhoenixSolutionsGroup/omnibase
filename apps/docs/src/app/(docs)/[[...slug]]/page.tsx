import { DocsLayout } from "fumadocs-ui/layouts/docs";
import {
	DocsBody,
	DocsDescription,
	DocsPage,
	DocsTitle,
} from "fumadocs-ui/layouts/docs/page";
import { createRelativeLink } from "fumadocs-ui/mdx";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { OpenAPIPage } from "@/components/api-page";
import { baseOptions, layoutTabs } from "@/lib/layout.shared";
import { openapi } from "@/lib/openapi";
import { getPageImage, getPageTreeFor, source } from "@/lib/source";
import { getMDXComponents } from "@/mdx-components";

export default async function Page(props: PageProps<"/[[...slug]]">) {
	const params = await props.params;
	const page = source.getPage(params.slug);
	if (!page) notFound();

	const MDX = page.data.body;
	const tree = getPageTreeFor(page);

	return (
		<DocsLayout tree={tree} tabs={layoutTabs(tree)} {...baseOptions()}>
			<DocsPage toc={page.data.toc} full={page.data.full}>
				<DocsTitle>{page.data.title}</DocsTitle>
				<DocsDescription>{page.data.description}</DocsDescription>
				<DocsBody>
					<MDX
						components={getMDXComponents({
							// this allows you to link to other pages with relative file paths
							a: createRelativeLink(source, page),
							OpenAPIPage: async (componentProps) => (
								<OpenAPIPage
									{...(await openapi.preloadOpenAPIPage(page))}
									{...componentProps}
								/>
							),
						})}
					/>
				</DocsBody>
			</DocsPage>
		</DocsLayout>
	);
}

export async function generateStaticParams() {
	return source.generateParams();
}

export async function generateMetadata(
	props: PageProps<"/[[...slug]]">,
): Promise<Metadata> {
	const params = await props.params;
	const page = source.getPage(params.slug);
	if (!page) notFound();

	return {
		title: page.data.title,
		description: page.data.description,
		openGraph: {
			images: getPageImage(page).url,
		},
	};
}
