import figlet from "figlet";
import fs from "fs";
import { crawlAndWatch } from "./lib/crawl";
import { AiPrompt, searchByText } from "./lib/analyze";

const main = async () => {
	const welcomeMessage = figlet.textSync('Crawl Audit');
	console.log(welcomeMessage);

	let domainInput = prompt("\nDomain to crawl and analyze (default is useparagon.com):");
	if (!domainInput) domainInput = "useparagon.com";

	setupDirectoryEnv(domainInput);

	let modeInput = prompt("\n[0] Crawl URL \n[1] Analyze last crawl \nType either 0 or 1:");

	while (true) {
		if (modeInput === "0") {
			await crawlAndWatch(domainInput.startsWith("https://") ? domainInput : "https://" + domainInput);
			break;
		} else if (modeInput === "1") {
			while (true) {
				let analyzeInput = prompt("\n[0] string match \n[1] agent \nType either 0 or 1:");
				let workingDirectory = "./markdown_files/" + domainInput;
				let mostRecentDate: string = "";
				for (const file of fs.readdirSync(workingDirectory)) {
					if (!mostRecentDate) mostRecentDate = file;
					if (new Date(mostRecentDate) > new Date(file)) mostRecentDate = file;
				}
				workingDirectory += "/" + mostRecentDate;

				if (analyzeInput === "0") {
					const searchInput = prompt("\nsearch string:");
					await searchByText(searchInput ?? "", workingDirectory);
					break;
				} else if (analyzeInput === "1") {
					let promptInput = prompt("\nAgent prompt:");
					while (true) {
						if (promptInput) {
							await AiPrompt(promptInput, workingDirectory);
							break;
						} else {
							promptInput = prompt("\nEnter a prompt for the agent:");
						}
					}
					break;
				} else {
					analyzeInput = prompt("\nInvalid input. Type either 0 or 1:");
				}
			}
			break;
		} else {
			modeInput = prompt("\nInvalid input. Type either 0 or 1:");
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


	if (!fs.existsSync("./prompts")) {
		fs.mkdirSync("./prompts");
	}
}

await main();
