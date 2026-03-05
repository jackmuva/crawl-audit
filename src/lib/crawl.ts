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
	});

	const watcher: Watcher = firecrawl.watcher(id, { kind: 'crawl', pollInterval: 2, timeout: undefined });

	watcher.on('document', (doc: Document) => {
		if (doc.metadata?.url && !(doc.metadata?.url in urlCache)) {
			try {
				if (doc.markdown) {
					if (!fs.existsSync(workingDirectory + "/" + `${doc.metadata.url}.md`.replaceAll("/", "_"))) {
						Bun.write(workingDirectory + "/" + `${doc.metadata.url}.md`.replaceAll("/", "_"), doc.markdown).then(() => {
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
