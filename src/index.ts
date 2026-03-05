import figlet from "figlet";
import fs from "fs";
import { crawlAndWatch } from "./lib/crawl";
import { AiPrompt, searchByText } from "./lib/analyze";

const main = async () => {
	const welcomeMessage = figlet.textSync('Crawl Audit!');
	console.log(welcomeMessage);

	let domainInput = prompt("Domain to crawl and analyze (default is useparagon.com):");
	if (!domainInput) domainInput = "useparagon.com";

	setupDirectoryEnv(domainInput);

	let modeInput = prompt("Would you like to trigger a new crawl [0] or analyze the pages from last crawl [1] [Type either 0 or 1]:");

	while (true) {
		if (modeInput === "0") {
			await crawlAndWatch(domainInput.startsWith("https://") ? domainInput : "https://" + domainInput);
			break;
		} else if (modeInput === "1") {
			while (true) {
				let analyzeInput = prompt("Would you like to perform a string match [0] or an agent command [1] [Type either 0 or 1]:");
				let workingDirectory = "./markdown_files/" + domainInput;
				let mostRecentDate: string = "";
				for (const file of fs.readdirSync(workingDirectory)) {
					if (!mostRecentDate) mostRecentDate = file;
					if (new Date(mostRecentDate) > new Date(file)) mostRecentDate = file;
				}
				workingDirectory += "/" + mostRecentDate;

				if (analyzeInput === "0") {
					const searchInput = prompt("search string: ");
					await searchByText(searchInput ?? "", workingDirectory);
					break;
				} else if (analyzeInput === "1") {
					let promptInput = prompt("Agent prompt: ");
					while (true) {
						if (promptInput) {
							await AiPrompt(promptInput, workingDirectory);
							break;
						} else {
							promptInput = prompt("Enter a prompt for the agent: ");
						}
					}
					break;
				} else {
					analyzeInput = prompt("Invalid input. Type either 0 or 1: ");
				}
			}
			break;
		} else {
			modeInput = prompt("Invalid input. Type either 0 or 1: ");
		}
	}
}

const setupDirectoryEnv = (domain: string) => {
	if (!fs.existsSync("./markdown_files")) {
		fs.mkdirSync("./markdown_files");
	}
	if (!fs.existsSync("./markdown_files/" + domain)) {
		fs.mkdirSync("./markdown_files/" + domain, { recursive: true });
	}

	if (!fs.existsSync("./reports")) {
		fs.mkdirSync("./reports");
	}
}

await main();
