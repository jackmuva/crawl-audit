import { generateText, type ModelMessage } from "ai";
import { $ } from "bun";


export const searchByText = async (text: string, dir: string) => {
	$.cwd(dir);
	let reportName = prompt("\nProvide a name for your report:");
	if (!reportName) reportName = "report_" + (new Date()).toISOString()

	const file = Bun.file("./reports/" + reportName + ".md");
	const writer = file.writer();

	await writer.write(`URLs with the text: ${text}\n\n`);
	await writer.flush();

	const files = await $`grep ${text} *`.text();
	const urlCache: { [url: string]: boolean } = {};
	for (const line of files.split("\n")) {
		const url = line.split(".md")[0]?.replaceAll("_", "/");
		if (url && !(url in urlCache)) {
			await writer.write(url + "\n");
			await writer.flush();
			urlCache[url] = true;
		}
	}

	console.log("Finished writing report to reports/" + reportName + ".md");
}

export const AiPrompt = async (sysPrompt: string, dir: string) => {
	$.cwd(dir);
	let reportName = prompt("\nProvide a name for your report:");
	if (!reportName) reportName = "report_" + (new Date()).toISOString()

	const file = Bun.file("./reports/" + reportName + ".md");
	const writer = file.writer();

	try {
		const promptFile = Bun.file("./prompts/" + sysPrompt);
		console.info("Using prompt from file...\n");
		sysPrompt = await promptFile.text();
	} catch (err) {
		console.info("Using prompt from user input...\n");
	}

	await writer.write(`User prompt: ${sysPrompt}\n\n`);
	await writer.flush();

	const files = await $`ls`.text();
	const urlCache: { [url: string]: boolean } = {};
	for (const line of files.split("\n")) {
		const url = line.split(".md")[0]?.replaceAll("_", "/");
		if (url && !(url in urlCache)) {
			const file = Bun.file(dir + "/" + line);

			const messages: ModelMessage[] = [];
			messages.push({
				role: "system",
				content: "Be as concise as possible",
			});
			messages.push({
				role: "user",
				content: sysPrompt + "\npage content:\n" + (await file.text()),
			});

			const { text } = await generateText({
				model: "anthropic/claude-haiku-4.5",
				messages: messages,
			});

			console.log("Agent analyzed " + url);
			writer.write("[" + url + "]\n");
			writer.write(text + "\n\n");
			writer.flush();
			urlCache[url] = true;
		}
	}

	console.log("Finished writing report to reports/" + reportName + ".md");
}
