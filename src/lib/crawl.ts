import type { Watcher } from '@mendable/firecrawl-js';
import Firecrawl, { type Document } from '@mendable/firecrawl-js';
import fs from "fs";

const firecrawl = new Firecrawl({ apiKey: process.env.FIRECRAWL_API_KEY });

const MAX_PAGES_TO_CRAWL = 1000;

export const crawlAndWatch = async (url: string) => {
	const urlCache: { [url: string]: boolean } = {};

	const workingDirectory = "./markdown_files/" + url.split("https://")[1] + "/" + ((new Date()).toDateString());
	if (!fs.existsSync(workingDirectory)) {
		fs.mkdirSync(workingDirectory, { recursive: true });
	}

	for (const file of fs.readdirSync(workingDirectory)) {
		urlCache[file.replaceAll("_", "/")] = true;
	}

	const { id } = await firecrawl.startCrawl(url, {
		limit: MAX_PAGES_TO_CRAWL,
		crawlEntireDomain: true,
		ignoreQueryParameters: true,
	});

	const watcher: Watcher = firecrawl.watcher(id, { kind: 'crawl', pollInterval: 2, timeout: undefined });

	watcher.on('document', (doc: Document) => {
		if (doc.metadata?.url && !(doc.metadata?.url in urlCache)) {
			try {
				if (doc.markdown) {
					if (!fs.existsSync(workingDirectory + "/" + `${doc.metadata.url}.md`.replaceAll("/", "_"))) {
						Bun.write(workingDirectory + "/" + `${doc.metadata.url}.md`.replaceAll("/", "_"), cleanMarkdown(doc.markdown)).then(() => {
							console.log('Crawled URL: ', doc.metadata?.url);
						});
					}
					urlCache[doc.metadata.url] = true;
				}
			} catch (err) {
				console.error("Unable to crawl/parse URL: ", doc.metadata?.url);
			}
		}
	});

	watcher.on('error', (err) => {
		console.error('ERR', err?.error || err);
	});

	watcher.on('done', (state) => {
		console.log('DONE', state.status);
	});

	await watcher.start();
}

const cleanMarkdown = (markdown: string): string => {
	// Remove standalone inline SVG data URIs
	let cleaned = markdown.replace(/^\s*!\[[^\]]*\]\(data:image\/svg\+xml,.*\)\s*$/gm, '');

	// Remove standalone linked images (image wrapped in a link)
	cleaned = cleaned.replace(/^\s*\[!\[[^\]]*\](\([^)]*\)|\[[^\]]*\])\](\([^)]*\)|\[[^\]]*\])\s*$/gm, '');

	// Remove standalone images (inline or reference-style, excluding shortcut)
	cleaned = cleaned.replace(/^\s*!\[[^\]]*\](\([^)]*\)|\[[^\]]*\])\s*$/gm, '');

	// Remove standalone links (inline or reference-style, excluding images and shortcuts)
	cleaned = cleaned.replace(/^\s*(?<!!)\[[^\]]*\](\([^)]*\)|\[[^\]]*\])\s*$/gm, '');

	// Remove reference definitions
	cleaned = cleaned.replace(/^\s*\[[^\]]*\]:\s*\S+.*$/gm, '');

	// Clean up consecutive blank lines (3+ newlines -> 2 newlines)
	cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

	return cleaned;
}

