import { $ } from "bun";


export const searchByText = async (text: string, dir: string) => {
	$.cwd(dir);
	let reportName = prompt("Provide a name for your report: ");
	if (!reportName) reportName = "report_" + (new Date()).toISOString()


	const file = Bun.file("./reports/" + reportName + ".md");
	const writer = file.writer();

	await writer.write(`URLs with the text: ${text}\n\n`);
	await writer.flush();

	const files = await $`grep ${text} *`.text();
	const urlCache: { [url: string]: boolean } = {};
	for (const line of files.split("\n")) {
		const url = line.split(".md")[0]?.replaceAll("_", "/");
		console.log(url);
		if (url && !(url in urlCache)) {
			await writer.write(url + "\n");
			await writer.flush();
			urlCache[url] = true;
		}
	}

	console.log("Finished writing report to reports/" + reportName + ".md");
}
