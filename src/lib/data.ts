import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { Change, Comment, Decision, Flow, HandbookPage, ObjectType, Person, SearchResult, Task, Version } from "@/lib/types";

type LinkRow = { source_type: string; source_id: string; target_type: string; target_id: string };

function fail(context: string, error: { message: string } | null) { if (error) throw new Error(`${context}: ${error.message}`); }
function day(value: string) { return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(value)); }
function minute(value: string) { return new Intl.DateTimeFormat("sv-SE", { dateStyle: "short", timeStyle: "short", timeZone: "UTC" }).format(new Date(value)); }
function initials(name: string) { return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase(); }
function relatedFor(type: string, id: string, links: LinkRow[]) { return links.flatMap((link) => link.source_type === type && link.source_id === id ? [link.target_id] : link.target_type === type && link.target_id === id ? [link.source_id] : []); }
function sectionsFromContent(content: unknown) { if (!content || typeof content !== "object" || Array.isArray(content)) return []; return Object.entries(content).map(([title, body]) => ({ title, body: typeof body === "string" ? body : JSON.stringify(body) })); }
function contentText(content: unknown) { return sectionsFromContent(content).map(({ title, body }) => `${title}\n${body}`).join("\n\n"); }

export async function getPeople(): Promise<Person[]> {
  const supabase = await createClient(); const { data, error } = await supabase.from("profiles").select("*").order("name"); fail("Unable to load team", error);
  return (data ?? []).map((row) => ({ id: row.id, name: row.name, email: row.email, role: row.role, initials: initials(row.name) }));
}

export async function getHandbookPages(): Promise<HandbookPage[]> {
  const supabase = await createClient();
  const [{ data: pages, error: pagesError }, { data: versions, error: versionsError }, { data: links, error: linksError }, { data: glossary, error: glossaryError }] = await Promise.all([
    supabase.from("handbook_pages").select("*").order("title"), supabase.from("page_versions").select("*"), supabase.from("object_links").select("source_type,source_id,target_type,target_id"), supabase.from("glossary_terms").select("term,definition").order("term"),
  ]);
  fail("Unable to load Handbook", pagesError); fail("Unable to load Handbook versions", versionsError); fail("Unable to load object links", linksError); fail("Unable to load glossary", glossaryError);
  const versionById = new Map((versions ?? []).map((row) => [row.id, row]));
  return (pages ?? []).map((row) => {
    const current = row.current_version_id ? versionById.get(row.current_version_id) : undefined;
    const sections = row.slug === "glossary" && !current ? (glossary ?? []).map((term) => ({ title: term.term, body: term.definition })) : sectionsFromContent(current?.content);
    return { id: row.id, slug: row.slug, title: row.title, domain: row.domain, status: row.status, owner: row.owner_label, updated: day(row.updated_at), summary: sections[0]?.body ?? "Canonical Pangaan documentation.", sections, tags: row.tags, related: relatedFor("handbook", row.slug, links ?? []) };
  });
}

export async function getVersions(): Promise<Version[]> {
  const supabase = await createClient();
  const [{ data: rows, error }, { data: pages, error: pagesError }, { data: decisions, error: decisionsError }] = await Promise.all([supabase.from("page_versions").select("*").order("created_at", { ascending: false }), supabase.from("handbook_pages").select("id,slug,title,domain"), supabase.from("decisions").select("id,decision_code")]);
  fail("Unable to load versions", error); fail("Unable to load version pages", pagesError); fail("Unable to load version decisions", decisionsError);
  const pageById = new Map((pages ?? []).map((row) => [row.id, row])); const decisionById = new Map((decisions ?? []).map((row) => [row.id, row.decision_code])); const grouped = new Map<string, NonNullable<typeof rows>>();
  for (const row of rows ?? []) grouped.set(row.page_id, [...(grouped.get(row.page_id) ?? []), row]);
  return (rows ?? []).map((row) => { const page = pageById.get(row.page_id); const pageRows = grouped.get(row.page_id) ?? []; const previous = pageRows[pageRows.findIndex((candidate) => candidate.id === row.id) + 1]; return { id: row.id, pageSlug: page?.slug ?? "handbook", pageTitle: page?.title ?? "Handbook page", version: row.version, author: row.author_label, date: day(row.created_at), summary: row.change_summary, decision: row.linked_decision_id ? decisionById.get(row.linked_decision_id) : undefined, content: contentText(row.content), previousContent: previous ? contentText(previous.content) : undefined }; });
}

export async function getDecisions(): Promise<Decision[]> {
  const supabase = await createClient(); const [{ data: rows, error }, { data: replacements, error: replacementsError }, { data: links, error: linksError }] = await Promise.all([supabase.from("decisions").select("*").order("decision_code", { ascending: false }), supabase.from("decision_replacements").select("decision_id,replaces_decision_id"), supabase.from("object_links").select("source_type,source_id,target_type,target_id")]);
  fail("Unable to load decisions", error); fail("Unable to load decision replacements", replacementsError); fail("Unable to load object links", linksError); const codeById = new Map((rows ?? []).map((row) => [row.id, row.decision_code]));
  return (rows ?? []).map((row) => ({ id: row.decision_code, title: row.title, status: row.status, canonical: row.canonical_text, reason: row.reason, owner: row.owner_label, date: day(row.updated_at), sources: row.sources, replaces: codeById.get((replacements ?? []).find((item) => item.decision_id === row.id)?.replaces_decision_id ?? ""), related: relatedFor("decision", row.decision_code, links ?? []) }));
}

export async function getChanges(): Promise<Change[]> {
  const supabase = await createClient(); const [{ data: rows, error }, { data: decisions, error: decisionsError }] = await Promise.all([supabase.from("change_entries").select("*").order("created_at", { ascending: false }), supabase.from("decisions").select("id,decision_code")]); fail("Unable to load Change Log", error); fail("Unable to load linked decisions", decisionsError); const codeById = new Map((decisions ?? []).map((row) => [row.id, row.decision_code]));
  return (rows ?? []).map((row) => ({ id: row.id, at: minute(row.created_at), type: (["document", "decision", "flow", "task", "system"].includes(row.change_type) ? row.change_type : "system") as Change["type"], object: row.object_id, what: row.what_changed, why: row.reason, owner: row.author_label, before: row.before_ref ?? "—", after: row.after_ref ?? "—", decision: row.linked_decision_id ? codeById.get(row.linked_decision_id) ?? "—" : "—" }));
}

export async function getComments(objectType?: string, objectId?: string): Promise<Comment[]> {
  const supabase = await createClient(); let request = supabase.from("comments").select("*").is("archived_at", null).order("created_at"); if (objectType) request = request.eq("object_type", objectType); if (objectId) request = request.eq("object_id", objectId);
  const [{ data: rows, error }, { data: profiles, error: profilesError }] = await Promise.all([request, supabase.from("profiles").select("id,name")]); fail("Unable to load comments", error); fail("Unable to load comment authors", profilesError); const nameById = new Map((profiles ?? []).map((row) => [row.id, row.name]));
  return (rows ?? []).map((row) => ({ id: row.id, objectId: row.object_id, author: nameById.get(row.author_id) ?? "Team member", at: minute(row.created_at), body: row.body, resolved: Boolean(row.resolved_at) }));
}

export async function getTasks(): Promise<Task[]> {
  const supabase = await createClient(); const [{ data: rows, error }, { data: links, error: linksError }, { data: comments, error: commentsError }] = await Promise.all([supabase.from("tasks").select("*").order("task_code"), supabase.from("object_links").select("source_type,source_id,target_type,target_id"), supabase.from("comments").select("object_id").is("archived_at", null)]); fail("Unable to load tasks", error); fail("Unable to load task links", linksError); fail("Unable to load task comments", commentsError);
  return (rows ?? []).map((row) => { const related = relatedFor("task", row.task_code, links ?? []); return { id: row.task_code, title: row.title, owner: row.owner_label, status: row.status, priority: row.priority, due: row.due_at ? day(row.due_at) : undefined, decision: related.find((id) => id.startsWith("DEC-")) ?? "—", document: related.find((id) => !id.startsWith("DEC-") && !id.startsWith("FLOW-") && !id.startsWith("TASK-")) ?? "—", outcome: row.outcome ?? undefined, comments: (comments ?? []).filter((item) => item.object_id === row.task_code).length }; });
}

export async function getFlows(): Promise<Flow[]> {
  const supabase = await createClient(); const [{ data: rows, error }, { data: links, error: linksError }] = await Promise.all([supabase.from("flows").select("*").order("flow_code"), supabase.from("object_links").select("source_type,source_id,target_type,target_id")]); fail("Unable to load flows", error); fail("Unable to load flow links", linksError);
  return (rows ?? []).map((row) => ({ id: row.flow_code, title: row.title, description: row.description, status: row.status, owner: row.owner_label, mermaid: row.mermaid_source, related: relatedFor("flow", row.flow_code, links ?? []), updated: day(row.updated_at) }));
}

export async function searchWorkspace(query: string, filters: { type?: ObjectType | "all"; status?: string; owner?: string; domain?: string } = {}): Promise<SearchResult[]> {
  const supabase = await createClient(); const { data, error } = await supabase.rpc("search_workspace", { search_query: query.trim(), type_filter: filters.type && filters.type !== "all" ? filters.type : null, status_filter: filters.status || null, owner_filter: filters.owner || null, domain_filter: filters.domain || null }); fail("Unable to search workspace", error);
  return (data ?? []).map((row) => ({ id: row.object_id, type: row.object_type as ObjectType, title: row.title, status: row.status, owner: row.owner_label, domain: row.domain, date: "", snippet: row.snippet.replace(/<[^>]+>/g, ""), route: row.route, historical: row.historical, score: row.rank }));
}

export async function getWorkspaceContext(type: string, id: string) {
  const [handbook, decisions, tasks, flows, comments, versions, changes] = await Promise.all([getHandbookPages(), getDecisions(), getTasks(), getFlows(), getComments(type, id), getVersions(), getChanges()]);
  const object = type === "decision" ? decisions.find((item) => item.id === id) : type === "task" ? tasks.find((item) => item.id === id) : type === "flow" ? flows.find((item) => item.id === id) : handbook.find((item) => item.slug === id || item.id === id);
  return object ? { object, comments, versions: type === "handbook" ? versions.filter((item) => item.pageSlug === id) : [], changes: changes.filter((item) => item.object === id) } : null;
}
