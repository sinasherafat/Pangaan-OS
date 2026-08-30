import type { Change, Comment, Decision, Flow, HandbookPage, Person, Task, Version } from "./types";

export const people: Person[] = [
  { id: "sina", name: "Sina Sherafat", email: "sina@pangaan.com", role: "Admin", initials: "SS" },
  { id: "ali", name: "Ali Rahimi", email: "ali@pangaan.com", role: "Editor", initials: "AR" },
  { id: "nima", name: "Nima Farhadi", email: "nima@pangaan.com", role: "Contributor", initials: "NF" },
  { id: "maya", name: "Maya Chen", email: "maya@pangaan.com", role: "Viewer", initials: "MC" },
];

export const handbookPages: HandbookPage[] = [
  { id:"DOC-001", slug:"master-core", title:"01. Master Core", domain:"Master Core", status:"Approved", owner:"Founder / Core", updated:"Aug 30, 2026", summary:"The foundation of Pangaan. Read before changing core product behavior.", tags:["mission","north star","principles"], related:["DEC-128","FLOW-001","TASK-104"], sections:[
    { title:"Mission", body:"Make trustworthy context usable at the moment a person or system must decide and act." },
    { title:"North Star", body:"Every feature must either feed the Graph with higher-quality data, or use the Graph for Context, Decision, Action, and Economic Value. If it does neither, it is probably not a core Pangaan feature." },
    { title:"Core Principles", body:"Ground truth over opinions. Long-term network value over short-term vanity metrics. Explainability, provenance, and user control. Seller-first wedge; network-scale architecture. Tokens only after proven utility and economic activity." },
    { title:"Scope / Non-goals", body:"Pangaan connects trustworthy product identity, context, decisions, and outcomes. It is not a generic marketplace, social network, or speculative token product." },
    { title:"Canonical Architecture", body:"Product Passport ↔ 3 Graphs ↔ Context Engine form the core model. Decisions and evidence remain traceable through every action." },
  ]},
  { id:"DOC-010", slug:"product-passport", title:"02. Product Passport", domain:"Product Passport", status:"Approved", owner:"Product", updated:"Aug 29, 2026", summary:"Economic object and living identity across the product lifecycle.", tags:["entity","lifecycle","checkout","returns"], related:["DEC-126","FLOW-002","TASK-102"], sections:[
    { title:"Concept", body:"A Product Passport is the durable identity for a product, its claims, provenance, contribution, and economic outcomes." },
    { title:"Entity model", body:"Passport identity, actors, claims, evidence, permissions, lifecycle events, graph writes, and outcomes are explicit objects." },
    { title:"Lifecycle", body:"Create → enrich → verify → publish → transact → support → return or retire. Every transition records provenance." },
    { title:"Buyer / Seller / Creator / Expert views", body:"Each actor sees the same canonical object through role-appropriate context and permissions." },
    { title:"Checkout / Orders / Returns", body:"Commercial outcomes write back verified lifecycle events without overwriting historical identity." },
  ]},
  { id:"DOC-020", slug:"three-graphs", title:"03. 3 Graphs", domain:"3 Graphs", status:"Approved", owner:"Data", updated:"Aug 28, 2026", summary:"Trust, Contribution, and Economic Graphs with explicit provenance.", tags:["trust","contribution","economic","provenance"], related:["DEC-127","FLOW-006"], sections:[
    { title:"Trust Graph", body:"Represents claims, evidence, actors, confidence, provenance, and dispute state." },
    { title:"Contribution Graph", body:"Records who contributed knowledge, verification, distribution, or value to an outcome." },
    { title:"Economic Graph", body:"Connects transactions, attribution, incentives, and realized outcomes." },
    { title:"Provenance / confidence", body:"Every edge carries source, recency, confidence, and permission context." },
    { title:"Graph write rules", body:"Writes are event-derived, attributable, reversible by correction, and never silently destructive." },
  ]},
  { id:"DOC-030", slug:"context-engine", title:"04. Context", domain:"Context", status:"Working Proposal", owner:"Core", updated:"Aug 28, 2026", summary:"What matters now, why it matters, and what should happen next.", tags:["context","evidence","freshness"], related:["DEC-125","FLOW-001","TASK-103"], sections:[
    { title:"Context Engine", body:"Builds a permission-filtered view of relevant evidence, history, and current signals." },
    { title:"Context Inspector", body:"Explains the status, provenance, related objects, and recent changes around the current object." },
    { title:"Current / historical / trusted context", body:"Current context is time-sensitive; historical context explains drift; trusted context meets evidence and freshness rules." },
    { title:"Evidence / freshness", body:"Sources expose confidence, last verification, and staleness rather than hiding uncertainty." },
    { title:"Proactive behavior", body:"Future agents may suggest actions, but human authority and auditable decisions remain explicit." },
  ]},
  { id:"DOC-040", slug:"architecture", title:"05. Architecture", domain:"Architecture", status:"Approved", owner:"Engineering", updated:"Aug 27, 2026", summary:"System boundaries, contracts, event schema, and security.", tags:["system","data","api","permissions"], related:["DEC-128","FLOW-003"], sections:[
    { title:"System map", body:"Interfaces → application services → canonical objects → Postgres → event and graph projections." },
    { title:"Data model", body:"Stable objects, immutable revisions, universal links, and append-only audit events." },
    { title:"Event schema", body:"Events identify actor, object, action, prior state, new state, rationale, and timestamp." },
    { title:"API / connectors", body:"Internal typed boundaries first. External connectors are narrow, permissioned, and observable." },
    { title:"Permissions / security", body:"Supabase Auth, RLS, server-only secrets, role-aware mutations, sanitized content, and audit logs." },
  ]},
  { id:"DOC-050", slug:"glossary", title:"06. Glossary", domain:"Glossary", status:"Approved", owner:"Core", updated:"Aug 26, 2026", summary:"Canonical Pangaan terminology and deprecated aliases.", tags:["terms","definitions"], related:["DEC-125"], sections:[
    { title:"Product Passport", body:"The durable identity and living record of a product across its lifecycle." },
    { title:"Context", body:"Permission-filtered evidence and history relevant to a present decision or action." },
    { title:"Decision Episode", body:"The auditable sequence from signal and evidence through human authority to outcome." },
    { title:"Graph Write", body:"An attributable, policy-checked update to Trust, Contribution, or Economic Graph state." },
  ]},
];

export const decisions: Decision[] = [
  { id:"DEC-128", title:"Pangaan Core Architecture v1.1", status:"Approved", canonical:"Product Passport, 3 Graphs, and Context Engine form the canonical core model.", reason:"Freeze the smallest durable model that preserves identity, evidence, decision context, and outcomes.", owner:"Sina", date:"Aug 30, 2026", sources:["DOC-001","DOC-040"], replaces:"DEC-114", related:["DOC-001","DOC-040","TASK-104","FLOW-001"] },
  { id:"DEC-127", title:"Three Graphs Model", status:"Approved", canonical:"Trust, Contribution, and Economic state remain distinct but linkable graphs.", reason:"Separate evidence, attribution, and value without losing cross-graph traceability.", owner:"Data", date:"Aug 29, 2026", sources:["DOC-020"], related:["DOC-020","FLOW-006"] },
  { id:"DEC-126", title:"Product Passport v1.3", status:"Approved", canonical:"The Passport is a lifecycle object with explicit claim, evidence, ownership, and outcome history.", reason:"Inventory write-back and returns need durable identity rather than order-local records.", owner:"Product", date:"Aug 29, 2026", sources:["DOC-010"], related:["DOC-010","TASK-102","FLOW-002"] },
  { id:"DEC-125", title:"Context Engine terminology", status:"Working Proposal", canonical:"Use Context Engine for computation and Context Inspector for the user-facing view.", reason:"Separate system responsibility from interface pattern.", owner:"Core", date:"Aug 28, 2026", sources:["DOC-030"], related:["DOC-030","TASK-103"] },
  { id:"DEC-124", title:"Intent Input strategy", status:"Working Proposal", canonical:"Capture intent as structured context only where it changes ranking or action.", reason:"Avoid turning every interaction into ungoverned conversational data.", owner:"Product", date:"Aug 27, 2026", sources:["Research note"], related:["DOC-030"] },
  { id:"DEC-123", title:"RAVA utility token scope", status:"Working Proposal", canonical:"Token utility remains deferred until measurable economic activity exists.", reason:"Utility must follow proven network value.", owner:"Economy", date:"Aug 26, 2026", sources:["DOC-001"], related:["DOC-001"] },
  { id:"DEC-122", title:"DENE governance token scope", status:"Open Question", canonical:"Define whether governance requires a token or role-based institutional authority.", reason:"The current evidence does not justify irreversible token governance.", owner:"Founder", date:"Aug 25, 2026", sources:["Governance workshop"], related:["DOC-001"] },
  { id:"DEC-121", title:"Marketplace-first GTM", status:"Deprecated", canonical:"Lead with a broad consumer marketplace.", reason:"Replaced by a seller-first Product Passport wedge.", owner:"Strategy", date:"Aug 24, 2026", sources:["GTM memo"], related:["DEC-126"] },
];

export const tasks: Task[] = [
  { id:"TASK-101", title:"Define Event Schema v1", owner:"Data", status:"Backlog", priority:"P1", decision:"DEC-128", document:"DOC-040", comments:2 },
  { id:"TASK-105", title:"Connector framework", owner:"Engineering", status:"Backlog", priority:"P1", decision:"DEC-118", document:"DOC-040", comments:1 },
  { id:"TASK-108", title:"Search indexing", owner:"Engineering", status:"Backlog", priority:"P2", decision:"DEC-128", document:"DOC-040", comments:3 },
  { id:"TASK-102", title:"Product Passport v1.3", owner:"Product", status:"In Progress", priority:"P0", due:"Sep 4", decision:"DEC-126", document:"DOC-010", outcome:"Ship Passport lifecycle and inventory write-back states.", comments:4 },
  { id:"TASK-103", title:"Context Engine prototype", owner:"AI", status:"In Progress", priority:"P0", decision:"DEC-125", document:"DOC-030", comments:2 },
  { id:"TASK-104", title:"Decision Register module", owner:"Core", status:"In Progress", priority:"P1", decision:"DEC-128", document:"DOC-001", comments:1 },
  { id:"TASK-106", title:"Flow documentation MVP", owner:"Product", status:"Review", priority:"P1", decision:"DEC-120", document:"DOC-040", outcome:"Mermaid source, preview, links, and versions complete.", comments:3 },
  { id:"TASK-107", title:"Version history UI", owner:"Design", status:"Review", priority:"P2", decision:"DEC-128", document:"DOC-001", comments:1 },
  { id:"TASK-109", title:"Auth & roles", owner:"Engineering", status:"Done", priority:"P0", decision:"DEC-116", document:"DOC-040", outcome:"RLS-backed role model implemented.", comments:2 },
  { id:"TASK-110", title:"Handbook baseline", owner:"Core", status:"Done", priority:"P0", decision:"DEC-128", document:"DOC-001", outcome:"Six canonical domains published.", comments:3 },
  { id:"TASK-111", title:"Change Log module", owner:"Core", status:"Done", priority:"P1", decision:"DEC-128", document:"DOC-001", outcome:"Material changes trace to rationale and decision.", comments:1 },
];

export const flows: Flow[] = [
  { id:"FLOW-001", title:"Decision Loop", description:"From signal and evidence through human authority to auditable outcome.", status:"Published", owner:"Core", updated:"Aug 30", related:["DEC-128","DOC-001","TASK-106"], mermaid:`flowchart TD
 A[Event / Signal] --> B[Context Engine]
 B --> C[Evidence / Confidence]
 C --> D{Decision Gate}
 D -->|Monitor| E[Observe Only]
 D -->|Approve| F[Human / Agent Action]
 F --> G[Outcome]
 G --> H[Graph Update]
 H -.-> D` },
  { id:"FLOW-002", title:"Product Passport Lifecycle", description:"Canonical Passport states from creation through retirement.", status:"Published", owner:"Product", updated:"Aug 29", related:["DEC-126","DOC-010","TASK-102"], mermaid:`flowchart LR
 A[Create] --> B[Enrich] --> C[Verify] --> D[Publish]
 D --> E[Transact] --> F[Support]
 F --> G{Outcome}
 G --> H[Return]
 G --> I[Retire]` },
  { id:"FLOW-003", title:"Data Ingestion", description:"Permissioned ingestion with validation and provenance.", status:"Published", owner:"Data", updated:"Aug 28", related:["DEC-127","DOC-040"], mermaid:`flowchart LR
 A[Source] --> B[Validate] --> C[Normalize]
 C --> D[Attach Provenance] --> E[Policy Check] --> F[Canonical Store]` },
  { id:"FLOW-004", title:"Agent Action", description:"Future-safe action boundary with explicit human authority.", status:"Draft", owner:"Core", updated:"Aug 27", related:["DEC-125","DOC-030"], mermaid:`flowchart TD
 A[Context] --> B[Recommendation]
 B --> C{Authority}
 C -->|Reject| D[Record rationale]
 C -->|Approve| E[Execute]
 E --> F[Audit event]` },
  { id:"FLOW-005", title:"Checkout / Outcome", description:"Commercial outcome writes back to the Product Passport.", status:"Draft", owner:"Product", updated:"Aug 26", related:["DEC-126","DOC-010"], mermaid:`flowchart LR
 A[Checkout] --> B[Order] --> C[Fulfillment] --> D[Outcome]
 D --> E[Passport event]
 D --> F[Economic Graph]` },
  { id:"FLOW-006", title:"Graph Write", description:"Attributable policy-checked writes to the three graphs.", status:"Published", owner:"Data", updated:"Aug 25", related:["DEC-127","DOC-020"], mermaid:`flowchart LR
 A[Event] --> B[Permission] --> C[Evidence]
 C --> D{Graph}
 D --> E[Trust]
 D --> F[Contribution]
 D --> G[Economic]` },
  { id:"FLOW-007", title:"Consent / Revocation", description:"User authority over context use and downstream writes.", status:"Draft", owner:"Legal", updated:"Aug 24", related:["DOC-040"], mermaid:`flowchart LR
 A[Consent] --> B[Scoped use] --> C[Audit]
 D[Revocation] --> E[Stop future use] --> F[Record effect]` },
];

export const versions: Version[] = [
  { id:"VER-001", pageSlug:"master-core", pageTitle:"01. Master Core", version:"v1.3", author:"Sina", date:"Aug 30, 2026", summary:"Current context language refined", decision:"DEC-128", previousContent:"Every feature must feed the Graph or use it for context.", content:"Every feature must either feed the Graph with higher-quality data, or use the Graph for Context, Decision, Action, and Economic Value." },
  { id:"VER-002", pageSlug:"master-core", pageTitle:"01. Master Core", version:"v1.2", author:"Ali", date:"Aug 28, 2026", summary:"Context language refined", decision:"DEC-125", previousContent:"Context explains what matters.", content:"Context explains what matters now, why it matters, and what should happen next." },
  { id:"VER-003", pageSlug:"master-core", pageTitle:"01. Master Core", version:"v1.1", author:"Sina", date:"Aug 25, 2026", summary:"Graph naming aligned", decision:"DEC-127", previousContent:"Identity, value, and trust graphs.", content:"Trust, Contribution, and Economic Graphs." },
  { id:"VER-004", pageSlug:"product-passport", pageTitle:"02. Product Passport", version:"v1.3", author:"Product", date:"Aug 29, 2026", summary:"Added returns and inventory write-back", decision:"DEC-126", previousContent:"Create → verify → publish → transact.", content:"Create → enrich → verify → publish → transact → support → return or retire." },
  { id:"VER-005", pageSlug:"three-graphs", pageTitle:"03. 3 Graphs", version:"v1.2", author:"Data", date:"Aug 28, 2026", summary:"Added confidence and provenance rules", decision:"DEC-127", content:"Every graph edge exposes source, confidence, recency, and permission." },
  { id:"VER-006", pageSlug:"architecture", pageTitle:"05. Architecture", version:"v1.1", author:"Engineering", date:"Aug 27, 2026", summary:"Added RLS and audit boundary", decision:"DEC-128", content:"Supabase Auth and RLS protect every exposed table; sensitive mutations append audit events." },
];

export const changes: Change[] = [
  { id:"CHG-001", at:"2026-08-30 10:24", type:"decision", object:"DEC-128", what:"Pangaan Core Architecture approved", why:"Freeze the canonical core model", owner:"Sina", before:"Working Proposal", after:"Approved", decision:"DEC-128" },
  { id:"CHG-002", at:"2026-08-30 09:58", type:"document", object:"Product Passport", what:"Lifecycle updated to v1.3", why:"Add inventory write-back and returns", owner:"Product", before:"v1.2", after:"v1.3", decision:"DEC-126" },
  { id:"CHG-003", at:"2026-08-29 16:10", type:"flow", object:"Decision Loop", what:"Approval branch documented", why:"Human authority must remain explicit", owner:"Core", before:"FLOW-001 v1", after:"FLOW-001 v2", decision:"DEC-128" },
  { id:"CHG-004", at:"2026-08-28 14:35", type:"document", object:"Context Engine", what:"Promoted to working proposal", why:"Terminology needs team review", owner:"Core", before:"Draft", after:"Working Proposal", decision:"DEC-125" },
  { id:"CHG-005", at:"2026-08-27 11:08", type:"decision", object:"DEC-121", what:"Direction deprecated", why:"Seller-first Passport wedge has stronger evidence", owner:"Strategy", before:"Approved", after:"Deprecated", decision:"DEC-121" },
  { id:"CHG-006", at:"2026-08-26 15:12", type:"task", object:"Auth & roles", what:"Role enforcement completed", why:"Private preview requires database-backed authorization", owner:"Engineering", before:"Review", after:"Done", decision:"DEC-116" },
  { id:"CHG-007", at:"2026-08-25 12:00", type:"system", object:"Search index", what:"Historical versions included", why:"Search must expose concept drift without outranking canonical truth", owner:"Engineering", before:"Current objects only", after:"Current + historical", decision:"DEC-128" },
];

export const comments: Comment[] = [
  { id:"COM-001", objectId:"DOC-001", author:"Ali", at:"09:42", body:"Should Product Passport be called a protocol object?", resolved:false },
  { id:"COM-002", objectId:"DOC-001", author:"Sina", at:"10:05", body:"Not yet. Keep protocol framing in long-term architecture.", resolved:false },
  { id:"COM-003", objectId:"DEC-128", author:"Nima", at:"Yesterday", body:"I linked the updated architecture decision to the Decision Loop.", resolved:true },
  { id:"COM-004", objectId:"TASK-102", author:"Ali", at:"Today", body:"API contract is ready for review.", resolved:false },
  { id:"COM-005", objectId:"TASK-102", author:"Nima", at:"Today", body:"Need one more failure-state test for write-back.", resolved:false },
  { id:"COM-006", objectId:"FLOW-001", author:"Sina", at:"Today", body:"Keep auto-execution out of MVP.", resolved:false },
  { id:"COM-007", objectId:"FLOW-001", author:"Ali", at:"Today", body:"Agreed. Observe / suggest / approve first.", resolved:false },
];

export const pinnedCore = handbookPages.slice(0, 5);
