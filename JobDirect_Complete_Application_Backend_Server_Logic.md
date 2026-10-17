# JobDirect: Complete application, backend, and server logic

Let's design this as a real software product, not just a job-listing
website.

The core idea is that JobDirect continuously turns official Gujarat
recruitment notifications into verified, searchable opportunities,
matches them to candidates, and guides each candidate through
application readiness.

The system has three major jobs:

-   **Understand the recruitment market:** Discover notifications,
    extract information, track changes, and verify accuracy.
-   **Understand each candidate:** Evaluate their profile against
    published eligibility rules and identify relevant opportunities.
-   **Manage the candidate's workflow:** Explain the requirements,
    prepare checklists, send alerts, and track progress.

The most important architectural decision is to keep these concerns
separate. AI can help interpret documents, but the backend must control
verification, eligibility calculations, publication, and alert delivery.

## 1. Overall architecture

``` mermaid
flowchart TB
    A["Frontend: Website / PWA / Android<br/>Search · Profile · Matching · Checklists · Alerts"]
    B["HTTPS API + Authentication"]
    C["Backend application"]
    C1["Recruitment service<br/>Search, filters, vacancy details"]
    C2["Matching engine<br/>Eligibility and relevance"]
    C3["Readiness service<br/>Documents and progress"]
    C4["Notification service<br/>Deadlines and corrections"]
    D["Data and background processing"]
    D1["PostgreSQL<br/>Users, notices, rules, applications"]
    D2["Document pipeline<br/>PDF extraction, OCR, validation"]
    D3["Scheduled workers<br/>Source checks and deadline jobs"]
    D4["Audit and verification<br/>Evidence, reviews, version history"]
    E["Official information sources<br/>Recruitment portals · Official PDFs · Corrigenda · Results · Admit-card notices"]
    A --> B --> C
    C --> C1
    C --> C2
    C --> C3
    C --> C4
    C --> D
    D --> D1
    D --> D2
    D --> D3
    D --> D4
    E --> D2
    D2 --> D4
    D4 --> D1
```

These are logical modules, not necessarily separate servers. For a ₹0
MVP, I recommend one backend application, one PostgreSQL database, and
one background worker. Split services only when actual load or
operational needs justify it.

## 2. The main workflows the system must implement

There are two independent workflows that eventually meet:

-   **Recruitment workflow:** official source → notification → extracted
    facts → verification → published opportunity.
-   **Candidate workflow:** profile → matching → selected opportunity →
    readiness checklist → application tracking.

### Workflow A: Discover and publish a recruitment notification

``` mermaid
flowchart TD
    A["Scheduled source checker"] --> B["Fetch permitted official pages"]
    B --> C["Record check result"]
    C --> D{"New or changed content?"}
    D -- No --> Z["Keep existing published version"]
    D -- Yes --> E["Save original document and metadata"]
    E --> F["Extract PDF text or OCR"]
    F --> G["Extract structured recruitment facts"]
    G --> H["Validate dates and required fields"]
    H --> I{"Confidence and completeness sufficient?"}
    I -- No --> J["Human review queue"]
    I -- Yes --> K["Compare with existing versions"]
    J --> K
    K --> L{"Material change?"}
    L -- No --> M["Record document change"]
    L -- Yes --> N["Review and approve updated record"]
    N --> O["Publish new version"]
    O --> P["Recalculate affected candidates"]
    P --> Q["Queue relevant alerts"]
```

The server should not publish every PDF immediately after downloading
it. A document can be an advertisement, a correction, a result, a
cancelled recruitment notice, or a duplicate.

First classify it, link it to the relevant recruitment, and preserve its
history.

### Workflow B: Candidate finds a relevant vacancy

``` mermaid
flowchart TD
    A["Candidate creates profile"] --> B["Validate profile fields"]
    B --> C["Candidate opens a vacancy"]
    C --> D["Load verified eligibility rules"]
    D --> E["Evaluate hard requirements"]
    E --> F{"Clearly eligible?"}
    F -- Yes --> G["Show eligible, subject to official verification"]
    F -- No --> H{"Clearly ineligible?"}
    H -- Yes --> I["Explain failed rule and source"]
    H -- No --> J["Show eligibility uncertain"]
    G --> K["Candidate saves opportunity"]
    J --> K
    K --> L["Create application checklist"]
    L --> M["Candidate marks tasks complete"]
    M --> N["Track user-recorded status"]
    N --> O["Update reminders and timeline"]
```

The distinction between eligible, ineligible, and uncertain is
essential. Missing profile information or ambiguous reservation rules
must not automatically be interpreted as disqualification.

## 3. Frontend logic: what the website actually does

Build the UI around the candidate's next action, rather than showing a
wall of recruitment cards.

### Page 1: Candidate dashboard

Show relevant new vacancies, deadlines approaching, saved applications,
recent official corrections, and unfinished checklists.

The frontend fetches dashboard data from the backend. It does not
independently decide whether a candidate qualifies.

### Page 2: Recruitment search

Filters include recruiting agency, qualification, post, location,
deadline, recruitment status, and category where relevant.

Search filters should be combined server-side, with pagination and
sorting. Expired or cancelled vacancies should be labelled clearly.

### Page 3: Vacancy detail

Display the official title, recruiting body, post, vacancies when
verified, education requirements, age limits, fees if applicable,
important dates, official links, and the source document.

Every important field should have a source reference and last-verified
date.

### Page 4: Eligibility checker

Ask only for information needed to assess the selected vacancy. Reuse
saved profile information where permitted, show missing information, and
explain each rule outcome.

### Page 5: Application readiness

Present a checklist of documents, form preparation, fees, submission,
and later recruitment milestones. Allow users to record progress and
attach their own notes without requiring document uploads.

### Page 6: Alerts and timeline

Show what changed, when it changed, which source confirms it, and
whether the candidate should review their saved application.

### Frontend state and error handling

For each page, manage at least these states:

-   `loading`: request in progress.
-   `success`: current data loaded.
-   `empty`: no matching vacancies or no saved applications.
-   `error`: request failed, with retry.
-   `stale`: data is displayed but its latest source check failed or is
    overdue.
-   `needs_review`: eligibility or extracted data cannot be determined
    confidently.

For example, if a deadline cannot be verified, display "Deadline not
verified" rather than inventing a date.

The frontend should never treat a button click as proof that an
application was submitted to a government portal. Only the official
portal can confirm that, unless an authorized integration provides a
verified status.

## 4. Server logic: the core recruitment engine

The backend is the source of truth for published recruitment records,
profile data, eligibility results, application progress, and
notifications.

I would implement these modules inside a modular monolith.

  -----------------------------------------------------------------------
  Module                              Responsibility
  ----------------------------------- -----------------------------------
  Source registry                     Stores official domains, source
                                      types, permitted collection
                                      methods, and check schedules

  Ingestion                           Fetches and records newly
                                      discovered notices

  Document processor                  Extracts text, tables, and dates
                                      from PDFs or scanned documents

  Recruitment normalizer              Converts extracted information into
                                      a consistent data model

  Verification                        Checks field completeness,
                                      evidence, conflicting dates, and
                                      reviewer decisions

  Versioning and change detection     Preserves old versions and
                                      identifies meaningful changes

  Search                              Finds published vacancies using
                                      structured filters

  Eligibility engine                  Evaluates explicit rules against
                                      candidate profiles

  Readiness manager                   Creates checklists and records user
                                      progress

  Notification scheduler              Queues, deduplicates, and sends
                                      relevant alerts

  Admin and audit                     Manages corrections, approvals,
                                      source history, and access control
  -----------------------------------------------------------------------

Each module should have a clear input, output, and failure path. For
example, a failed PDF extraction should create a retryable processing
job, not silently discard the recruitment.

## 5. Database design

Use PostgreSQL. The database must preserve both the latest recruitment
state and the evidence explaining how that state was established.

### Core tables

#### `users`

`id, email, phone, auth_provider, created_at`

Stores authentication identity and account metadata. Avoid storing
unnecessary personal information.

#### `candidate_profiles`

`user_id, date_of_birth, education_level, qualifications, category_if_provided, preferred_agencies, preferred_locations, profile_updated_at`

Stores profile attributes used for matching. Protect sensitive fields
and request only those needed.

#### `official_sources`

`id, agency_name, source_url, source_type, collection_method, enabled, last_checked_at, last_success_at`

Defines the permitted sources to monitor.

#### `documents`

`id, source_id, url, content_hash, storage_key, document_type, published_at, discovered_at, processing_status`

Represents an original notice, correction, result, or other official
document. Store the actual bytes in controlled object storage, not in
ordinary database rows.

#### `recruitments`

`id, agency_id, canonical_title, recruitment_reference, current_version_id, publication_status, created_at`

Represents one recruitment process across its original notice and
subsequent updates.

#### `recruitment_versions`

`id, recruitment_id, version_number, application_start, application_deadline, recruitment_status, structured_rules, verified_at, approved_by, created_at`

Stores a snapshot of recruitment facts. A correction creates a new
version rather than overwriting historical evidence.

#### `evidence_fields`

`id, version_id, field_name, field_value, document_id, page_number, source_excerpt, verification_status`

Connects important facts such as deadlines, age limits, and educational
requirements to supporting evidence.

#### `candidate_recruitments`

`id, user_id, recruitment_id, saved_at, application_status, notes`

Stores saved opportunities and user-recorded progress.

#### `eligibility_results`

`id, user_id, recruitment_version_id, profile_snapshot_hash, outcome, rule_results, evaluated_at`

Records which rules were evaluated against which version and profile
snapshot.

#### `checklist_items`

`id, candidate_recruitment_id, item_type, label, required, status, completed_at, evidence_reference`

Tracks individual readiness tasks. Keep user completion distinct from
verified official acceptance.

#### `notification_events`

`id, user_id, recruitment_id, version_id, event_type, deduplication_key, delivery_status, sent_at`

Provides retryable and deduplicated alerts.

#### `review_tasks` and `audit_events`

Review queues, reviewer decisions, previous values, actor, timestamps,
and reason for each correction. Makes the publishing process accountable
and traceable.

### Important database constraints

Implement these in the database, not only in frontend validation:

-   Unique source-document hashes within the appropriate source scope.
-   Unique recruitment identifiers where the official agency provides a
    reliable identifier.
-   Foreign keys linking recruitment versions to their parent
    recruitment.
-   Unique `(recruitment_id, version_number)` pairs.
-   Unique notification deduplication keys.
-   Constraints that prevent an application deadline from preceding the
    application start, unless the source explicitly describes a
    different timeline or the record is marked for review.
-   Row-level access controls for user-owned profiles, saved
    applications, and checklists.

A `recruitment_id` identifies the continuing process. A
`recruitment_version_id` identifies the exact set of rules and dates
used for a particular eligibility assessment. This prevents a correction
from silently changing the historical basis of an earlier result.

## 6. Source ingestion: how the server discovers notices

Don't start by crawling every government website. Begin with a manually
curated registry of a few recruiting bodies and permitted source pages.

For each source, store:

-   Official domain and canonical page URL.
-   Whether it offers an API, RSS feed, public listing, or downloadable
    documents.
-   Permitted collection method and rate limits.
-   Last successful check and last error.
-   Check frequency based on the source's update behaviour.

### The ingestion algorithm

``` python
def check_source(source):
    assert source.enabled
    assert collection_is_permitted(source)

    result = fetch_using_approved_method(source)

    if result.failed:
        record_source_failure(source, result.error)
        schedule_retry_with_backoff(source)
        return

    items = discover_documents(result)

    for item in items:
        fingerprint = hash_content_or_stable_metadata(item)

        existing = find_document(source.id, fingerprint)

        if existing:
            record_source_seen(existing)
            continue

        document = save_document_metadata_and_content(item)
        enqueue_job("classify_document", document.id)

    record_successful_check(source)
```

This is illustrative pseudocode, not a complete production crawler.

Use a stable identity for a document wherever possible. Hashing the raw
PDF bytes detects identical files, but the same notice may be
re-uploaded with different metadata or encoding. For that reason,
combine hashes with canonical URLs, reference numbers, document dates,
and content similarity where appropriate.

If a source returns an error, don't conclude that a vacancy has
disappeared. Keep the last verified record, mark its source-check status
appropriately, and retry.

### Document classification

Every discovered document should be assigned a document type:

-   `original_notification`
-   `corrigendum`
-   `deadline_extension`
-   `cancellation`
-   `admit_card_notice`
-   `exam_schedule`
-   `result_notice`
-   `answer_key`
-   `other`
-   `unknown`

Classification can use rules and AI, but low-confidence or ambiguous
documents must enter a review queue.

A corrigendum should be linked to its parent recruitment using official
reference numbers and contextual evidence. Do not create a new vacancy
simply because a correction has a different PDF URL.

## 7. PDF processing and fact extraction

A recruitment PDF is not just text. It may contain tables, footnotes,
scanned pages, multiple post categories, and exceptions buried in
annexures.

Your pipeline should extract facts into structured fields, with
evidence.

For example, the following is a fictional record used to illustrate the
format:

``` json
{
  "recruitment_reference": "DEMO-2026-001",
  "title": "Junior Assistant",
  "agency": "Example Recruiting Agency",
  "application_start": "2026-11-01",
  "application_deadline": "2026-11-30",
  "education_rules": [
    {
      "type": "minimum_qualification",
      "value": "Bachelor degree",
      "source_page": 4
    }
  ],
  "age_rules": [
    {
      "minimum_years": 18,
      "maximum_years": 33,
      "reference_date": "2026-01-01",
      "source_page": 5
    }
  ],
  "official_application_url": null,
  "verification_status": "pending_review"
}
```

The dates and qualifications above are examples only, not a real
vacancy.

### Processing stages

1.  Download the permitted original document and compute a content hash.
2.  Extract embedded PDF text and page boundaries. Use OCR for scanned
    pages when necessary.
3.  Identify headings, tables, post categories, dates, age criteria,
    qualifications, fees, and application URLs.
4.  Use an extraction model to propose structured fields with page
    references and supporting text.
5.  Validate field types, dates, URL domains, required fields, and
    relationships between values.
6.  Check critical fields against the source text and send uncertain or
    conflicting facts for review.
7.  Publish only after the configured verification policy is satisfied.

### Confidence must be field-specific

Don't give a document one overall confidence score and assume every
extracted fact is equally reliable.

  -----------------------------------------------------------------------
  Field                   Confidence              Action
  ----------------------- ----------------------- -----------------------
  Official reference      High                    Verify uniqueness and
  number                                          evidence

  Application deadline    Medium                  Require confirmation
                                                  against the notice

  Category-specific age   Low                     Require manual review
  relaxation                                      

  Application URL         Uncertain               Validate against
                                                  official domain and
                                                  source
  -----------------------------------------------------------------------

These labels are illustrative. The system should measure extraction
accuracy on a test set before defining actual confidence thresholds.

AI confidence alone is not enough to publish critical facts. A model can
confidently misread a table.

## 8. Change detection: the most important backend logic

This is where JobDirect can become more useful than a basic notification
feed.

Suppose a recruitment originally closes on November 30, then the
recruiting agency publishes a correction extending the deadline to
December 10.

Your server should:

1.  Detect a new document or changed source page.
2.  Classify the document as a possible deadline extension.
3.  Identify the relevant recruitment.
4.  Extract the new deadline and its supporting evidence.
5.  Compare the extracted fact with the current verified version.
6.  Create a proposed new version.
7.  Obtain required review and approval.
8.  Publish the new version and preserve the old one.
9.  Find candidates whose saved recruitment or alerts are affected.
10. Queue a correction notification and record its delivery status.

### Compare structured facts, not only PDFs

A file hash tells you that bytes changed. It doesn't tell you whether a
deadline changed.

Compare fields such as:

-   Application start and end dates.
-   Number of vacancies.
-   Educational qualifications.
-   Age limits and reference dates.
-   Reservation and relaxation conditions.
-   Examination dates.
-   Application fees.
-   Recruitment status.
-   Official application links.

Each field change should be classified as material, informational, or
unresolved.

For example, a PDF formatting change is usually not a material
recruitment update. A change to the closing date is.

### Versioning rule

Never silently overwrite a published deadline.

Keep the previous version, the new version, the evidence for the change,
the review decision, and the time the change became available to your
system.

That history lets you explain why a candidate received an alert and
which version of the rules their eligibility assessment used.

## 9. Eligibility engine: how the server decides whether a vacancy matches

Treat this as a deterministic rules engine, not a free-form AI
conversation.

### Step 1: Define a normalized candidate profile

A minimal profile might include:

-   Date of birth.
-   Highest completed qualification and completion status.
-   Relevant subject or degree details.
-   Category, only if the candidate chooses to provide it and the
    assessment requires it.
-   Relevant experience or licences.
-   Preferred locations and recruiting agencies.

Some rules may require a specific date, recognized qualification,
domicile status, or other condition. Request additional information only
when it affects the selected recruitment.

### Step 2: Convert official rules into machine-readable conditions

Examples of rule types:

-   `minimum_qualification`
-   `subject_requirement`
-   `minimum_age`
-   `maximum_age`
-   `age_relaxation`
-   `experience_requirement`
-   `licence_requirement`
-   `domicile_requirement`
-   `category_condition`

Each rule should include its effective dates, applicable post or
category, source evidence, and verification status.

### Step 3: Evaluate hard requirements

Use three-valued logic for every rule:

-   **PASS:** the available evidence satisfies the rule.
-   **FAIL:** the available evidence clearly violates the rule.
-   **UNKNOWN:** necessary information or a verified interpretation is
    missing.

A vacancy can be marked `likely_eligible` when all required rules pass,
`likely_ineligible` when a required rule clearly fails, and
`needs_review` when a decisive rule is unknown or ambiguous.

The user-facing result should still explain that the recruiting
authority's official rules and decision take precedence.

### Step 4: Example: age calculation

If the official notice defines an age reference date, calculate the
candidate's age on that date, not on the day they open your website.

For completed years, a basic calculation is:

``` python
from datetime import date


def completed_years(birth_date: date, reference_date: date) -> int:
    years = reference_date.year - birth_date.year

    birthday_not_reached = (
        (reference_date.month, reference_date.day)
        < (birth_date.month, birth_date.day)
    )

    return years - int(birthday_not_reached)
```

This handles ordinary date comparisons, but it is not sufficient for
every recruitment rule. Leap-day birthdays, inclusive/exclusive
boundaries, special age-calculation conventions, and category-specific
relaxations need explicit policy handling.

Never assume a universal age-relaxation rule across Gujarat recruiting
bodies.

### Step 5: Calculate relevance separately

Eligibility and relevance are different things.

A candidate may qualify for a vacancy but not want that job or location.

First apply the verified eligibility rules. Then rank the remaining
vacancies using preferences such as:

-   Desired recruiting agency.
-   Qualification fit.
-   Location preference.
-   Closing date.
-   Selected job categories.

A relevance score should never override a hard eligibility failure or
disguise an unknown condition.

### Step 6: Explain the result

Every assessment should show:

-   Outcome and evaluation timestamp.
-   Recruitment version used.
-   Rules passed, failed, or unresolved.
-   Supporting official evidence.
-   Additional profile details needed, if any.
-   A clear correction path if the source data or profile is wrong.

Recalculate when the profile changes or when the recruitment's relevant
verified version changes.

## 10. Application-readiness logic

The readiness manager turns each saved recruitment into a personal
workflow.

When a candidate saves a recruitment, the server should:

1.  Load its current verified version.
2.  Read the structured application requirements.
3.  Generate a checklist from predefined templates and
    recruitment-specific requirements.
4.  Attach source references to items that come from the official
    notice.
5.  Save the checklist against the candidate's saved recruitment.
6.  Track completion independently from eligibility and official
    submission status.

### Example checklist

**Junior Assistant · Application readiness**

*Illustrative checklist for a fictional recruitment.*

-   [ ] Read the official notification. Confirm eligibility, conditions,
    and important dates.
-   [ ] Confirm educational qualification. Check the required degree and
    any subject-specific conditions.
-   [ ] Check age requirements. Verify the reference date and any
    applicable relaxation.
-   [ ] Prepare required documents. Check the official list, format,
    validity, and certificate requirements.
-   [ ] Review application details. Prepare the information needed for
    the official form.
-   [ ] Submit through the official portal. Complete the official
    process and retain the receipt.

### Do not treat every document as mandatory

A generic template might suggest an identity document or certificate
that is not required for a particular post. Checklist generation must be
driven by the official requirements for that recruitment, not by a
generic AI-generated list.

Store each item with a type such as:

-   `required_by_notice`
-   `conditional_requirement`
-   `recommended_preparation`
-   `user_added`

Only the first category should be presented as explicitly required by
the notice, and even that should link to its evidence.

### Track the right statuses

Keep application progress distinct from checklist progress.

Suggested application states:

`interested → preparing → ready_to_apply → applied_by_user → admit_card_available → examination_completed → result_available`

Also support `not_interested`, `withdrawn`, and `cancelled` where
appropriate.

A user marking a checklist complete does not mean the application has
been submitted. Likewise, an exam date passing does not mean the
candidate attended the exam.

## 11. Notification and reminder engine

The backend should generate notifications from verified events and
candidate preferences.

### Events that can trigger an alert

-   A new verified recruitment matches a candidate's profile.
-   A saved recruitment's deadline changes.
-   A material eligibility rule changes.
-   A recruitment is cancelled or put on hold.
-   An admit-card notice, exam schedule, or result is published.
-   A candidate's own reminder becomes due.

### Notification pipeline

``` mermaid
flowchart TD
    A["Verified event or scheduled reminder"] --> B["Find affected candidates"]
    B --> C["Apply preferences and eligibility rules"]
    C --> D["Create deduplicated notification jobs"]
    D --> E["Queue worker"]
    E --> F{"Still relevant and verified?"}
    F -- No --> G["Cancel or hold job"]
    F -- Yes --> H["Send through selected channel"]
    H --> I{"Delivery succeeded?"}
    I -- Yes --> J["Record delivery"]
    I -- No --> K["Retry with backoff"]
    K --> L["Stop after retry limit"]
```

The worker must recheck the current recruitment version before sending
an alert. Otherwise, an old reminder might be delivered after a deadline
has changed.

Use a unique event key, for example:

`user_id + recruitment_id + version_id + event_type`

For reminders, include the scheduled reminder type and due time in the
key.

Support email first, then browser push or a messaging channel when the
user has opted in and the integration is available. Track queued, sent,
delivered where supported, failed, and cancelled as distinct statuses.

Never claim that an email or push was read merely because the provider
accepted it.

## 12. API design

The frontend should communicate with the backend through authenticated
API endpoints.

  ---------------------------------------------------------------------------------------
  Method and endpoint                                 Purpose
  --------------------------------------------------- -----------------------------------
  `GET /api/v1/recruitments`                          Search published recruitments

  `GET /api/v1/recruitments/:id`                      Get vacancy details and current
                                                      version

  `GET /api/v1/recruitments/:id/versions`             Get published version history

  `GET /api/v1/recruitments/:id/evidence`             Retrieve field evidence and
                                                      official sources

  `GET /api/v1/profile`                               Load the signed-in candidate's
                                                      profile

  `PATCH /api/v1/profile`                             Update permitted profile fields

  `POST /api/v1/recruitments/:id/eligibility-check`   Evaluate eligibility against the
                                                      current verified version

  `POST /api/v1/my-recruitments`                      Save a recruitment

  `GET /api/v1/my-recruitments`                       Load saved recruitments

  `POST /api/v1/my-recruitments/:id/checklist`        Create or initialize a checklist

  `PATCH /api/v1/checklist-items/:id`                 Update a user's checklist item

  `GET /api/v1/notifications`                         Fetch notification history

  `PATCH /api/v1/notification-preferences`            Update alert preferences

  `POST /api/v1/admin/documents/:id/review`           Approve or reject a proposed
                                                      record, for authorized reviewers
                                                      only
  ---------------------------------------------------------------------------------------

A request to save a vacancy should be idempotent where possible.
Repeating the same request should not create duplicate saved records.

### Example eligibility API response

``` json
{
  "recruitment_id": "demo-123",
  "recruitment_version": 4,
  "outcome": "needs_review",
  "evaluated_at": "2026-10-16T12:00:00Z",
  "checks": [
    {
      "rule": "minimum_qualification",
      "result": "pass",
      "evidence_page": 4
    },
    {
      "rule": "age_limit",
      "result": "unknown",
      "reason": "Official age-relaxation rule requires review",
      "evidence_page": 5
    }
  ],
  "message": "Eligibility could not be fully determined. Review the cited official rules."
}
```

This is an illustrative API contract. In production, validate every
request and response against a formal schema, use consistent error
codes, and ensure that the evidence pages actually exist for the
specified document.

## 13. Admin panel and verification workflow

The admin panel is not optional. It is how you keep bad information from
reaching candidates.

The admin dashboard should show:

-   New documents awaiting processing.
-   Extraction failures and low-confidence fields.
-   Suspected duplicate recruitments.
-   Conflicting application deadlines.
-   New corrigenda that have not been linked to a parent recruitment.
-   Records approaching their source-verification threshold.
-   Failed source checks and notification jobs.
-   User reports of incorrect information.

### Publication rules

Use an explicit publication state machine:

``` mermaid
stateDiagram-v2
    [*] --> Discovered
    Discovered --> Processing
    Processing --> Extracted
    Extracted --> NeedsReview
    Extracted --> Verified: validation passes
    NeedsReview --> Verified: reviewer approves
    NeedsReview --> Rejected: reviewer rejects
    Verified --> Published
    Published --> Updated: approved correction
    Updated --> Published
    Published --> Expired: recruitment closes
    Published --> Cancelled: official cancellation
```

Automated extraction can prepare the record, but a record should not be
marked verified simply because all fields are populated.

For the MVP, manually verify every published vacancy. Later, you can
automate low-risk fields and reserve human review for important or
ambiguous changes.

Keep an audit log of the reviewer, time, evidence, old value, new value,
and reason for every material change.

## 14. Security and reliability requirements

Your platform will handle candidate profiles and potentially sensitive
eligibility information. Build these safeguards into the initial
architecture.

-   **Authentication:** Use a maintained authentication provider; don't
    implement password storage yourself.
-   **Authorization:** Enforce user ownership in the backend and
    database, not just by hiding UI elements.
-   **Sensitive data:** Avoid collecting Aadhaar numbers, certificates,
    or document images unless there is a clear, justified need.
-   **API security:** Validate input, rate-limit sensitive endpoints,
    and protect against unauthorized access.
-   **Secrets:** Keep API keys and service credentials on the server,
    never in frontend code.
-   **Source security:** Treat PDFs, extracted text, links, and AI
    outputs as untrusted input. Do not execute instructions contained in
    documents.
-   **Notifications:** Obtain consent, provide unsubscribe controls, and
    prevent duplicate or misleading alerts.
-   **Backups:** Back up the database and test restoration.
-   **Monitoring:** Track failed source checks, extraction errors, stale
    data, and notification failures.
-   **Privacy:** Define data retention, deletion, and account-removal
    procedures.

A practical rule: no candidate should be able to access another
candidate's profile or application checklist by changing an ID in an API
request.

## 15. Recommended technology stack

For your ₹0 starting budget, keep the system simple and deployable.

### Frontend

React + Vite + TypeScript + Tailwind CSS. Use a responsive layout and
PWA support. If organic search is central to acquisition, consider
Next.js for server-rendered recruitment pages.

### Backend

Python + FastAPI for ingestion, document processing, eligibility logic,
and APIs. Keep it as one application with well-defined modules.

### Database and authentication

PostgreSQL through Supabase or another managed PostgreSQL provider.
Review current free-tier limits, backups, storage, and usage
restrictions before choosing.

### Document processing

Start with PDF text extraction, then add OCR for scanned documents. Use
structured extraction and rule-based validation before involving an LLM
for difficult cases.

### Background jobs

Start with a scheduled Python worker and a database-backed job table.
Add a dedicated queue when volume requires it. Ensure jobs are retryable
and idempotent.

You don't need microservices, Kubernetes, a vector database, or a
complicated agent framework for the first version.

A conventional database, a reliable document pipeline, and a carefully
tested eligibility engine will deliver more value initially than an
elaborate AI architecture.

## 16. Build order: what to implement first

### Phase 1 · Recruitment database --- Days 1--4

-   Design the database schema.
-   Add official sources and recruitment records.
-   Build admin forms for manual verification.
-   Store document evidence and version history.

### Phase 2 · Candidate website --- Days 5--9

-   Build recruitment feed and filters.
-   Create detailed vacancy pages.
-   Add official-source links.
-   Implement saved vacancies and profile settings.

### Phase 3 · Eligibility and readiness --- Days 10--14

-   Build the deterministic eligibility evaluator.
-   Add the `needs_review` outcome.
-   Generate recruitment-specific checklists.
-   Persist application progress.

### Phase 4 · Change monitoring --- Days 15--20

-   Build permitted source checks.
-   Extract and classify documents.
-   Compare recruitment versions.
-   Add reviewer approval and audit events.

### Phase 5 · Private beta --- Days 21--30

-   Test with real candidate profiles.
-   Check eligibility edge cases.
-   Test corrections and deadline changes.
-   Measure accuracy, retention, and willingness to pay.

These are target phases for a tightly scoped prototype, not a guarantee
of completion in 30 days. Data collection, verification, and your
available time can change the schedule.

## 17. How to know whether the backend is actually correct

Write automated tests for the dangerous failure cases before expanding
the dataset.

  -----------------------------------------------------------------------
  Test scenario                       Expected behaviour
  ----------------------------------- -----------------------------------
  Same PDF discovered twice           No duplicate recruitment or
                                      notification

  PDF changes but deadline doesn't    Record the document change; don't
                                      claim a deadline change

  Deadline is extended                Create a new version and alert
                                      affected candidates after
                                      verification

  Candidate birth date is missing     Age outcome is `UNKNOWN`

  Category-specific relaxation is     Route to review; do not assume a
  unclear                             relaxation

  Source site is temporarily          Preserve last verified data and
  unavailable                         mark source status

  Recruitment is cancelled            Update status and notify relevant
                                      saved candidates

  Notification worker retries a       Do not send the same logical alert
  failed job                          twice

  User changes another candidate's ID Deny access
  in an API request                   

  AI extracts a date without          Keep the record unpublished or send
  supporting evidence                 it for review
  -----------------------------------------------------------------------

Also maintain a test dataset of real, historical official notices with
known outcomes. Measure extraction accuracy field by field, eligibility
correctness, correction-detection latency, and duplicate-alert rates.

## Final architecture decision

Build JobDirect around five core capabilities:

1.  Verified recruitment data and immutable version history.
2.  Evidence-backed eligibility evaluation.
3.  Personalized application-readiness checklists.
4.  Reliable detection of material recruitment changes.
5.  A notification system with deduplication and auditability.

The AI model is a supporting component, not the brain that controls the
whole platform. The real intelligence comes from combining verified
evidence, deterministic rules, versioned data, and candidate-specific
workflows.

**My suggested next implementation step:** create the database schema
and recruitment ingestion pipeline first, with an admin review screen.
Once you can reliably publish one verified recruitment and update it
without losing its history, build the candidate-facing matching and
readiness experience on top of that foundation.
