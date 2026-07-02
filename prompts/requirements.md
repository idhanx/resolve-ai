# Requirements Document

## Introduction

The Employee Feedback Portal is a secure web platform that enables employees to log in, submit workplace concerns or policy-related questions in natural language, and track the status of their submissions. Sprint 1 establishes the foundation: authentication, concern submission, and issue history. The platform is designed to scale in future sprints to include AI-powered categorisation, HR/Manager workflows, and policy-answer automation.

---

## Glossary

- **System**: The Employee Feedback Portal web application (frontend + backend).
- **Auth_Module**: The authentication subsystem responsible for login, logout, and session/token management.
- **Employee**: An authenticated user with the "employee" role who submits concerns and tracks their own issues.
- **HR**: A user with the "hr" role who manages and resolves employee concerns (used in future sprints).
- **Manager**: A user with the "manager" role who can view concerns escalated to them (used in future sprints).
- **Employee_Dashboard**: The main screen presented to an authenticated Employee, containing the Welcome Panel, Submit Concern form, and My Issues table.
- **Concern**: A workplace grievance or feedback item submitted by an Employee, stored as a Complaint record.
- **Policy_Question**: A free-text question submitted by an Employee regarding company policy; stored for future AI-assisted answering.
- **Issue_History**: The view that lists all Concerns and Policy Questions previously submitted by the authenticated Employee.
- **JWT**: JSON Web Token — a signed, time-limited token used to authenticate API requests.
- **Attachment**: An optional file (image, PDF, or document) uploaded alongside a Concern submission.
- **Status**: The lifecycle state of a Concern. Valid values in Sprint 1: `Submitted`. Full lifecycle: `Submitted → Under Review → Assigned → In Progress → Verified Resolved`.
- **Employee_ID**: A unique identifier for an employee, used alongside email as an accepted login credential.
- **API**: The RESTful backend service layer that handles all data operations.
- **DB**: The PostgreSQL relational database that persists all application data.

---

## Requirements

---

### Requirement 1: Secure Employee Authentication

**User Story:** As an Employee, I want to securely log into the system so that I can submit concerns and view only my own issues.

#### Acceptance Criteria

1. WHEN an Employee submits a valid Employee ID or email address together with the correct password, THE Auth_Module SHALL authenticate the Employee and return a signed JWT valid for 8 hours.

2. WHEN an Employee submits an invalid Employee ID, email, or password combination, THE Auth_Module SHALL return an error response with HTTP status 401 and a message stating the credentials are incorrect, without revealing which field is wrong.

3. WHEN an authenticated Employee sends a request with a valid JWT in the `Authorization` header, THE System SHALL permit access to protected API endpoints.

4. IF a request arrives at a protected API endpoint without a JWT, or with a JWT that fails any validation check including signature verification or expiration, THEN THE Auth_Module SHALL treat the token as missing, reject the request with HTTP status 401, and deny access to all employee data.

5. WHEN an authenticated Employee triggers logout, THE Auth_Module SHALL invalidate the current JWT so that subsequent requests using that token are rejected.

6. THE Auth_Module SHALL enforce role-based access control such that an Employee role token cannot access HR or Manager API endpoints.

7. WHILE an authenticated session is active and the Employee performs at least one API request within a 30-minute window, THE Auth_Module SHALL keep the session alive without requiring re-authentication.

8. THE Auth_Module SHALL store passwords in the DB using a one-way hashing algorithm with a per-user salt; plaintext passwords SHALL never be persisted in the DB in any form, whether standalone or alongside a hash.

---

### Requirement 2: Employee Profile Access

**User Story:** As an Employee, I want to see my profile information on the dashboard so that I can confirm I am viewing my own data.

#### Acceptance Criteria

1. WHEN an authenticated Employee requests the profile endpoint (`GET /api/employee/profile`), THE System SHALL return the Employee's name, department, and reporting manager name from the DB.

2. IF the authenticated Employee's record is not found in the DB, THEN THE System SHALL return HTTP status 404 with a descriptive error message.

3. THE Employee_Dashboard SHALL display the Employee's name, department, and reporting manager in the Welcome Panel using data returned from the profile endpoint; IF the profile endpoint returns an error or partial data, THE Employee_Dashboard SHALL display whatever profile fields are available and show a placeholder for any missing fields rather than hiding the Welcome Panel entirely.

4. THE System SHALL ensure that the profile endpoint returns only the data belonging to the Employee identified by the JWT; an Employee SHALL NOT be able to retrieve another Employee's profile by altering request parameters.

---

### Requirement 3: Concern Submission

**User Story:** As an Employee, I want to submit my concern in natural language so that I don't have to choose complicated categories.

#### Acceptance Criteria

1. WHEN an authenticated Employee submits a Concern with a non-empty title (1–150 characters) and a non-empty description (1–5 000 characters), THE System SHALL persist the Concern in the DB with status `Submitted`, a system-generated UUID as `complaint_id`, the Employee's `employee_id`, and a `created_at` timestamp set to the current UTC time, then return HTTP status 201 with the created record.

2. IF an Employee submits a Concern where the title exceeds 150 characters or is empty, THEN THE System SHALL return HTTP status 422 with a validation error message identifying the invalid field, and SHALL NOT persist any record.

3. IF an Employee submits a Concern where the description exceeds 5 000 characters or is empty, THEN THE System SHALL return HTTP status 422 with a validation error message identifying the invalid field, and SHALL NOT persist any record.

4. WHERE an Employee chooses to include an Attachment, THE System SHALL accept files of type PDF, JPEG, PNG, or DOCX with a maximum size of 10 MB, store the file securely, and persist the file reference in the `attachment` field of the Complaint record.

5. IF an Employee uploads an Attachment that exceeds 10 MB or is of an unsupported file type, THEN THE System SHALL return HTTP status 422 with a descriptive error message and SHALL NOT persist the Concern.

6. THE System SHALL detect duplicate submissions defined as two Concerns from the same `employee_id` with identical title and description submitted within a 60-second window, and IF such a duplicate is detected, THEN THE System SHALL return HTTP status 409 and SHALL NOT create a second record.

7. IF a DB write operation fails during Concern submission, THEN THE System SHALL roll back the transaction, return HTTP status 500 with a generic error message, and log the failure details server-side.

8. THE Submit_Concern_Form SHALL provide a text area for the description field that accepts free-form natural language input without requiring the Employee to select a predefined category.

---

### Requirement 4: Policy Question Submission

**User Story:** As an Employee, I want to ask questions related to company policies so that I can receive answers in future sprints.

#### Acceptance Criteria

1. WHEN an authenticated Employee submits a Policy Question with non-empty text (1–1 000 characters), THE System SHALL persist the question in the DB linked to the Employee's `employee_id` with a `created_at` timestamp set to the current UTC time, then return HTTP status 201 confirming storage.

2. IF an Employee submits a Policy Question that is empty or exceeds 1 000 characters, THEN THE System SHALL return HTTP status 422 with a validation error message and SHALL NOT persist the record.

3. THE System SHALL store Policy Questions without generating an automated answer in Sprint 1; the response payload SHALL include a message stating the question has been received and will be answered in a future update.

4. THE Employee_Dashboard SHALL provide a clearly labelled input for Policy Questions that is distinct from the Concern submission form.

---

### Requirement 5: Issue History View

**User Story:** As an Employee, I want to see my previously submitted concerns so that I know whether they are still pending or resolved.

#### Acceptance Criteria

1. WHEN an authenticated Employee requests the issues list endpoint (`GET /api/employee/issues`), THE System SHALL return a paginated list of all Concerns belonging to that Employee, each record containing `complaint_id`, `title`, `created_at`, and `status`.

2. THE System SHALL ensure the issues list endpoint returns only Concerns belonging to the Employee identified by the JWT; Concerns belonging to other Employees SHALL NOT be included.

3. THE Issue_History view SHALL display each Concern in a table with columns: Issue ID, Title, Submitted Date, and Current Status.

4. WHERE the Employee has submitted zero Concerns, THE Issue_History view SHALL display an empty-state message indicating no issues have been submitted yet.

5. WHEN an authenticated Employee requests a single Concern by ID (`GET /api/employee/issues/{id}`), THE System SHALL return the full Concern record including `complaint_id`, `title`, `description`, `attachment` reference (if present), `created_at`, and `status`.

6. IF an authenticated Employee requests a Concern by ID that does not belong to them or does not exist, THEN THE System SHALL return HTTP status 404 and SHALL NOT return any Concern data.

7. THE System SHALL return issue list results ordered by `created_at` descending (most recent first) by default.

8. WHEN the Employee selects the page size and page number query parameters, THE System SHALL return the corresponding paginated subset of results, with a default page size of 20 records.

---

### Requirement 6: API Performance

**User Story:** As an Employee, I want the platform to respond quickly so that I have a smooth experience.

#### Acceptance Criteria

1. WHILE the DB is operational and network latency is within normal bounds (under 10 ms server-side), THE System SHALL respond to all authenticated API requests within 2 000 ms measured from receipt of request to delivery of response under a load of up to 100 concurrent users.

2. IF an API request exceeds the 2 000 ms threshold due to an internal processing error, THEN THE System SHALL return HTTP status 504 and log the timeout details server-side.

---

### Requirement 7: Input Validation and Security

**User Story:** As an Employee, I want the system to reject malformed input so that my data is stored correctly and the platform remains secure.

#### Acceptance Criteria

1. THE System SHALL sanitise all text inputs in both web form submissions and direct API requests before persistence to prevent SQL injection and cross-site scripting (XSS) attacks.

2. WHEN an Employee submits any text field containing HTML tags or SQL-injection patterns via a form or API request, THE System SHALL strip or escape the malicious content and persist only the sanitised value; IF the content cannot be sanitised, THE System SHALL return HTTP status 422 with a descriptive error message and SHALL NOT persist the record. Attachment uploads SHALL be scanned for embedded scripts and rejected with HTTP status 422 if malicious content is detected.

3. THE System SHALL enforce HTTPS for all client–server communication; HTTP requests SHALL be redirected to HTTPS.

4. THE System SHALL include appropriate CORS headers restricting API access to the configured allowed origins.

5. THE System SHALL rate-limit the login endpoint to a maximum of 10 failed attempts per IP address within any 15-minute window; IF the limit is exceeded, THEN THE Auth_Module SHALL block further login attempts from that IP for 15 minutes and return HTTP status 429.

---

### Requirement 8: Responsive and Mobile-Friendly UI

**User Story:** As an Employee, I want to access the platform from any device so that I can submit concerns from my phone or desktop.

#### Acceptance Criteria

1. THE System SHALL render all UI screens (Login, Employee Dashboard, Submit Concern, Issue History) correctly on viewport widths from 320 px to 2 560 px without horizontal scrolling or overlapping elements.

2. THE System SHALL present touch-friendly interactive controls (buttons, inputs, links) with a minimum tap target size of 44 × 44 px on mobile viewports.

3. THE Employee_Dashboard SHALL adapt its layout from a single-column stacked view on viewports narrower than 768 px to a multi-column layout on viewports 768 px and wider.

4. THE System SHALL achieve a Lighthouse mobile performance score of 70 or above and a Lighthouse accessibility score of 90 or above on the Login and Employee Dashboard screens.

---

### Requirement 9: Data Persistence and Scalability

**User Story:** As a platform operator, I want all data stored reliably and the architecture to support growth so that the system remains stable as usage increases.

#### Acceptance Criteria

1. THE DB SHALL persist all Employee, User, and Complaint records in a PostgreSQL database with schema-enforced constraints (NOT NULL, UNIQUE, FK relationships as specified in the data model).

2. THE System SHALL use UUIDs as primary keys for all DB entities to support distributed generation without coordination.

3. THE System SHALL wrap Concern submission and related file-reference persistence in a single DB transaction so that partial writes do not result in inconsistent records.

4. THE System SHALL be deployable as independent, stateless API service instances behind a load balancer so that horizontal scaling can be achieved by adding instances without application-level changes.

5. THE DB schema SHALL include indexed columns on `employee_id` in the Complaint table and on `email` and `username` in the User table to support query performance at scale.

---

### Requirement 10: Audit Logging

**User Story:** As a platform operator, I want all significant actions to be logged so that I can investigate incidents and verify compliance.

#### Acceptance Criteria

1. THE System SHALL write a structured log entry for each of the following events: successful login, failed login, Concern submission (success and failure), Policy Question submission (success and failure), and logout.

2. WHEN a log entry is written, THE System SHALL include at minimum: event type, timestamp (UTC), `employee_id` or IP address (for unauthenticated events), HTTP status code, and a brief outcome description.

3. THE System SHALL retain logs for a minimum of 90 days.

4. IF a logging write operation fails, THEN THE System SHALL continue processing the primary request, return the primary request's normal success or error response to the client, and attempt to write the log entry to a fallback output (e.g., standard error stream) without surfacing the logging failure to the client.
