# crawl-audit
Crawl Audit is a CLI tool that crawls the Paragon domain, downloads all pages to markdown for
text searching and agent-led actions

## Instalation & Runnning
To install dependencies:

```bash
bun install
```

To run (after setting env vars):

```bash
bun start
```

## Dependencies
1. Firecrawl
2. AI Gateway

In your .env file, set the following variables
```
FIRECRAWL_API_KEY=
AI_GATEWAY_API_KEY=
```

## Getting Started
After starting the Crawl Audit CLI app:
1. Start by [0] Crawling and indexing your URL

This will crawl through your domain and extract each page to markdown for easier reading and agent accessibility.
The extracted markdown files will be stored locally in `markdown_files/`.

2. After crawling and indexing, use the [1] analyze option to perform text search/regex or use an agent to 
go through each of your markdown files

Additionally, you can create prompt files in txt or md format, that can be re-used by your agent
