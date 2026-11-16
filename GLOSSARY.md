# TechNova Ticket Management System

The centralized system for recording, routing, resolving, and reporting customer support issues across multiple teams and communication channels.

## Language

### Core Entities

**Ticket**:
A tracked record of a customer issue, inquiry, or service request requiring action by the TechNova team.
_Avoid_: Case, incident, task, work item

**Client Company**:
A customer business organization that has a contract or products with TechNova.
_Avoid_: Account, organization, customer (when referring to the enterprise)

**Customer Contact**:
An individual employee belonging to a Client Company who reports an issue or receives updates.
_Avoid_: User, client, contact person, customer (when referring to the person)

**Employee**:
An internal TechNova team member who interacts with tickets based on their assigned role.
_Avoid_: User, staff, agent (except specifically Support Agent)

### Intake & Workflow

**Intake Channel**:
The communication medium through which the issue was originally received (WhatsApp, Email, or Phone).
_Avoid_: Source, medium, platform

**Internal Note**:
A private comment on a ticket accessible exclusively to TechNova employees.
_Avoid_: Private comment, internal discussion, whisper

**Customer Communication**:
An external message or email thread exchange associated with a ticket visible or sent to the Customer Contact.
_Avoid_: External comment, public message, reply

**Escalation**:
The formal handoff of a ticket from front-line support to a senior engineer or engineering team when technical complexity exceeds tier-1 scope.
_Avoid_: Reassignment, transfer, raise

**SLA Target**:
The expected resolution or response deadline computed based on priority level and creation time.
_Avoid_: Due date, deadline, timer

### Interface Patterns

**Table View**:
The uniform, structured tabular presentation of records used across all top-level navigation tabs.
_Avoid_: List view, card grid, feed (for primary tabs)

**Detail View**:
A dedicated full-width view entered from a table row, featuring breadcrumbs, an entity Hero Banner with Quick Actions, sub-tabs for related entities (tickets, contacts, services), and diagnostic data.
_Avoid_: Side panel, drawer, compact card modal

**Hero Banner**:
The standardized top section of every Detail View displaying primary identification, high-priority status metrics, and direct Quick Action buttons.
_Avoid_: Header bar, info bar, title strip

**Quick Actions**:
Context-sensitive one-click action buttons located in the Hero Banner (e.g. Escalate, Change Status, Add Contact, Reassign) that immediately trigger workflow transitions.
_Avoid_: Action dropdown, menu commands


**Combobox Filter**:
A compact searchable dropdown selector used to filter table datasets without visual clutter.
_Avoid_: Filter pill bar, colored status tabs


