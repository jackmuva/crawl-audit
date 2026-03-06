## Context
Paragon is an embedded iPaaS that helps B2B SaaS companies build user-facing integrations.

Paragon's main products are ActionKit, Managed Sync, and Workflows.

**ActionKit**: An API with 3rd-party actions like SLACK_SEND_MESSAGE and GMAIL_GET_EMAILS that Paragon users can 
use in their AI agent products as tools or workflow builders as actions.

**Managed Sync**: An API that spins up ETL pipelines to sync all of their users' 3rd-party data, like 
all of their users' Google Drive files or Salesforce contacts.

**Workflows**: A **low-code workflow tool** on Paragon where users can build automations that trigger from 3rd-party 
webhooks, CRON, or API triggers. Workflows have 3rd-party actions like ActionKit to easily perform 
integration logic like JIRA_CREATE_TICKET and SALESFORCE_CREATE_CONTACT

## Problem

Paragon is launching a new API as a **part of ActionKit, called Triggers API**. ActionKit will now have 2 parts:

1. Tools API: An API with 3rd-party actions like SLACK_SEND_MESSAGE. This API is essentially the existing state of ActionKit

2. Triggers API: An API for users to subscribe to 3rd-party webhooks like GITHUB_ISSUE_CREATED. This is the new API product!

Because of the new launch of Triggers API, some of our pages/docs on ActionKit need to be refactored.
Please read through the page and identify if this page needs to be changed/refactored.
Pages that are mention triggers, but are focused on Paragon Workflows only, do not need to be refactored.
Pages that mention ActionKit with some sort of trigger or webhook functionality (whether it's with Paragon Workflows) definitely need to be refactored to mention Triggers API as the trigger/webhook component of ActionKit.

Respond in the following format:
refactor: (yes/no)
explanation: (if a refactor is necessary, provide a reason)
