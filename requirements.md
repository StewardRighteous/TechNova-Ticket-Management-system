# TechNova Solutions — Ticket Management System Requirements

**Document type:** Business Requirements (Initial Draft)  
**Status:** Draft — requires client validation  
**Prepared from:** Client discovery conversation

## 1. Project overview

TechNova Solutions Pvt. Ltd. provides custom software development, SaaS products, technical support and maintenance, and IT consulting. Customer support requests currently arrive through WhatsApp, email, and phone.

The company needs a centralized ticket management system to record, assign, prioritize, track, and report on customer issues so requests are not lost and responsibility for resolution is clear.

## 2. Business context

- Approximately 45 employees.
- One head office in Chennai, with some remote employees in other cities.
- No additional physical branches currently; the system should allow future locations.
- Support requests concern customers already using the company's products and services.
- Examples include login failures, incorrect reports, broken features, feature requests, and service downtime.

## 3. Users and organizational roles

The following roles and approximate headcounts were described:

| Role | Approx. count | Primary responsibility |
|---|---:|---|
| Support Agents | 8 | Receive requests, gather details, troubleshoot, and create tickets |
| Senior Support Engineers | 3 | Handle complex issues and escalations |
| Development Team | 15 | Investigate and fix bugs; implement technical changes |
| QA Testers | 5 | Test fixes before release |
| Account Managers | 5 | Manage client relationships and communicate with clients |
| Operations Managers | 2 | Monitor support operations and team performance |
| Management | 2 | Oversee the business |

**Requirements**
- Provide role-based access control and permissions.
- Employees should see the internal dashboard and functions appropriate to their roles.
- Support administration of employee accounts, teams, departments, and assignments.
- Keep customer access separate from the internal employee dashboard.
- Allow management to monitor work across departments and, in future, multiple locations.

*Note: The role counts supplied by the client total 40, while the stated company size is approximately 45. Confirm the remaining employee roles and final headcount.*

## 4. Ticket intake and creation

### 4.1 Employee-created tickets
- Tickets are to be created by employees, primarily support agents, after communicating with the customer.
- Customers will not create tickets directly through a self-service portal in the initial scope.
- Agents should be able to search for an existing customer before creating a new customer record.
- Agents should be able to register a new customer when no matching record exists.
- The agent should record the customer's need and ask follow-up questions to capture sufficient information.
- Generate a unique ticket ID automatically for every ticket.

### 4.2 Intake channels
Requests currently arrive through:
- WhatsApp
- Email
- Phone

The system should provide a centralized place to record requests received through these channels.

**Clarification required:** The client has not yet confirmed whether WhatsApp and email should be integrated directly, or whether employees will manually enter requests received through those channels. Phone requests will likely need to be entered by an employee, but this should be confirmed.

## 5. Customer and account management

- Maintain client/company records.
- Support multiple customer contacts under one client company.
- Store customer contact details, including name, email address, and phone number.
- Store a customer or account identifier where applicable.
- Associate every ticket with the relevant client company and contact.
- Allow agents to search and select existing customer records.

## 6. Ticket information

A ticket should support the following information:

| Field | Description |
|---|---|
| Ticket ID | Unique system-generated identifier |
| Client/company | Customer organization associated with the issue |
| Contact person | Customer employee who reported the issue |
| Email and phone | Contact details for follow-up |
| Subject | Short summary of the issue |
| Description | Detailed explanation of the reported problem |
| Category | For example, bug, login issue, billing, feature request, or technical support |
| Product/service | Product or service affected |
| Priority | Low, Medium, High, or Critical |
| Attachments | Screenshots, recordings, logs, and other supporting files |
| Assigned agent | Employee responsible for coordinating the ticket |
| Assigned team | Department or team responsible for work |
| Status | Current ticket workflow state |
| Created date/time | When the ticket was recorded |
| Due date / SLA | Target deadline, where applicable |
| Internal notes | Staff-only discussion and context |
| Resolution details | Work performed and final outcome |
| Closed date/time | When the ticket was closed |

### 6.1 Dynamic information requirements
- Different ticket categories should request different details.
- Do not require irrelevant technical information for simple issues.
- For technical issues, support relevant diagnostic fields such as:
  - Browser and operating system
  - Device information
  - Error messages or error codes
  - Steps to reproduce the issue
  - Expected behaviour
  - Actual behaviour

## 7. Ticket workflow and ownership

- Assign tickets to an individual employee and the relevant department/team.
- Make the person responsible for the next action clear.
- Support handoffs between Support Agents, Senior Support Engineers, Developers, and QA Testers.
- Preserve ticket ownership and assignment history when work is transferred.
- Provide a status history so staff can see how a ticket has progressed.
- Support internal notes that are not visible to customers.

**Suggested initial statuses for client validation:**
1. Open
2. Assigned
3. In Progress
4. Pending Customer
5. Pending Internal Team
6. Resolved
7. Closed

These statuses are proposed for discussion, not yet explicitly approved by the client.

## 8. Priority and escalation

- Support four priority levels: Low, Medium, High, and Critical.
- Prioritize issues based on business impact.
- Critical issues affecting an entire customer's business should be handled ahead of minor UI issues.
- Allow support agents to escalate complex issues to Senior Support Engineers and the Development Team.
- Record escalation reason, destination team/person, and escalation history.

**Clarification required:** Define priority criteria, who can change priority, escalation rules, response targets, and whether critical tickets trigger alerts.

## 9. SLA and due-date management

- Store a due date or SLA target for applicable tickets.
- Help staff identify tickets that are approaching or have exceeded their deadlines.
- Make overdue tickets visible to the appropriate staff and managers.
- Provide reporting on SLA performance and breaches.

**Clarification required:** Confirm SLA targets by priority, business hours, holidays, pause conditions, and escalation actions.

## 10. Communication and notifications

- Maintain a history of customer communications associated with each ticket.
- Record employee responses and internal discussions separately.
- Preserve attachments and ticket status-change history.
- Send customers an email containing their ticket ID.
- Send customers relevant progress updates by email.
- Notify employees about relevant assignments and escalations.

**Important access requirement:** Customers must not have access to the internal employee dashboard.

**Clarification required:** Confirm whether customers may reply to email updates, whether email replies should be added to the ticket automatically, and whether WhatsApp integration is required.

## 11. Dashboards and reporting

Provide a centralized management dashboard with visibility across departments and future locations.

Reports should include:
- Total tickets received.
- Open, pending, resolved, and closed tickets.
- Tickets grouped by priority.
- Tickets grouped by department/team.
- Average resolution time.
- Overdue tickets and SLA breaches.
- Employee workload and performance.
- Department-wise performance.
- Location-wise performance when multiple locations are introduced.

Role-specific dashboards and filters should be validated during detailed design.

## 12. Location and future growth

- The current operation is based in Chennai.
- Some employees work remotely from other cities.
- The system should not assume all employees belong to one physical office.
- Support adding future offices or operating locations.
- Allow teams in different locations to work independently while management retains a consolidated view.

## 13. Initial functional module breakdown

| Module | Scope |
|---|---|
| Authentication and access control | Login, roles, permissions |
| Employee and organization management | Employees, departments, teams, locations |
| Customer management | Client companies and customer contacts |
| Ticket management | Creation, details, attachments, status tracking |
| Assignment and escalation | Ownership, team routing, handoffs, escalation |
| Communication | Internal notes, communication history, email notifications |
| SLA management | Due dates, overdue tracking, SLA reporting |
| Dashboards and analytics | Operational and management reports |
| Configuration | Categories, priorities, statuses, dynamic fields |

## 14. Key business expectations

The client expects the system to be:
- Easy for support agents to use.
- Reliable, so customer issues are not lost.
- Clear about ticket ownership and responsibility.
- Flexible enough to support company growth and additional locations.
- Secure, with customer information and internal operations protected.
- Transparent, so management can understand the status of support operations.

## 15. Open questions before finalizing the specification

1. Will WhatsApp and email be integrated, or will agents manually log requests from those channels?
2. Can customers reply to ticket emails, and should replies update the ticket automatically?
3. What customer and company fields are mandatory?
4. Can one ticket have multiple assignees, or must it always have one directly responsible owner?
5. What are the exact status definitions and permitted status transitions?
6. What criteria distinguish Low, Medium, High, and Critical priority?
7. What are the SLA response and resolution targets for each priority?
8. Which roles can assign, reassign, escalate, change priority, resolve, and close tickets?
9. Should QA approval be required before a development ticket can be marked resolved?
10. What file types and maximum attachment sizes should be supported?
11. Are there separate products, customer plans, or support contracts that affect ticket handling?
12. What reports, date ranges, exports, and dashboard filters are required?
13. Should employees be restricted to tickets belonging to their own team, or can they view all tickets?
14. What are the requirements for audit logs, data retention, backups, and security?
15. The stated role counts total 40, while the company size is approximately 45. What are the remaining roles?

## 16. Scope status and assumptions

This document captures business needs discussed so far. It is an initial requirements draft, not a complete technical specification or an implementation commitment.

Items explicitly stated by the client are recorded as requirements. Suggested statuses, module breakdowns, and unresolved workflow details are marked for validation. Confirm the open questions with the client before finalizing database design, permissions, integrations, and development scope.
