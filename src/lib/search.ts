import { changes, comments, decisions, flows, handbookPages, tasks, versions } from "./seed";
import type { ObjectType, SearchResult } from "./types";

const normalize = (value: string) => value.toLocaleLowerCase().trim();

export function searchWorkspace(query: string, type?: ObjectType | "all"): SearchResult[] {
  const q = normalize(query);
  const rows: Omit<SearchResult, "score">[] = [
    ...handbookPages.map((x) => ({ id:x.id, type:"handbook" as const, title:x.title, status:x.status, owner:x.owner, domain:x.domain, date:x.updated, snippet:`${x.summary} ${x.sections.map(s=>s.body).join(" ")} ${x.tags.join(" ")}`, route:`/handbook/${x.slug}` })),
    ...decisions.map((x) => ({ id:x.id, type:"decision" as const, title:x.title, status:x.status, owner:x.owner, domain:"Governance", date:x.date, snippet:`${x.canonical} ${x.reason} ${x.sources.join(" ")}`, route:`/decisions/${x.id}` })),
    ...tasks.map((x) => ({ id:x.id, type:"task" as const, title:x.title, status:x.status, owner:x.owner, domain:"Execution", date:x.due ?? "", snippet:`${x.outcome ?? ""} ${x.decision} ${x.document}`, route:`/tasks/${x.id}` })),
    ...flows.map((x) => ({ id:x.id, type:"flow" as const, title:x.title, status:x.status, owner:x.owner, domain:"Flows", date:x.updated, snippet:`${x.description} ${x.mermaid}`, route:`/flows/${x.id}` })),
    ...changes.map((x) => ({ id:x.id, type:"change" as const, title:x.what, status:x.type, owner:x.owner, domain:"Change Log", date:x.at, snippet:`${x.object} ${x.why} ${x.before} ${x.after}`, route:"/changes" })),
    ...comments.map((x) => ({ id:x.id, type:"comment" as const, title:`Comment on ${x.objectId}`, status:x.resolved?"Resolved":"Open", owner:x.author, domain:"Discussion", date:x.at, snippet:x.body, route: routeForObject(x.objectId) })),
    ...versions.map((x) => ({ id:x.id, type:"version" as const, title:`${x.pageTitle} ${x.version}`, status:"Historical", owner:x.author, domain:"Version History", date:x.date, snippet:`${x.summary} ${x.content}`, route:"/versions", historical:true })),
  ];
  return rows
    .filter((x) => (type && type !== "all" ? x.type === type : true))
    .filter((x) => !q || normalize(x.title).includes(q) || normalize(x.snippet).includes(q))
    .map((x) => {
      const title = normalize(x.title); const body = normalize(x.snippet);
      const exact = q && title === q ? 120 : 0;
      const starts = q && title.startsWith(q) ? 70 : 0;
      const titleHit = q && title.includes(q) ? 45 : 0;
      const bodyHit = q && body.includes(q) ? 14 : 0;
      const canonical = ["Approved","Published"].includes(x.status) ? 8 : 0;
      const historyPenalty = x.historical ? -6 : 0;
      return { ...x, score: exact + starts + titleHit + bodyHit + canonical + historyPenalty };
    })
    .sort((a,b) => b.score-a.score || a.title.localeCompare(b.title));
}

function routeForObject(id: string) {
  if (id.startsWith("DOC-")) return `/handbook/${handbookPages.find(x=>x.id===id)?.slug ?? "master-core"}`;
  if (id.startsWith("DEC-")) return `/decisions/${id}`;
  if (id.startsWith("TASK-")) return `/tasks/${id}`;
  if (id.startsWith("FLOW-")) return `/flows/${id}`;
  return "/";
}
