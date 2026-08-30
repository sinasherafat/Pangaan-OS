export type Role = "Admin" | "Editor" | "Contributor" | "Viewer";
export type DecisionStatus = "Approved" | "Working Proposal" | "Deprecated" | "Open Question";
export type TaskStatus = "Backlog" | "In Progress" | "Review" | "Done";
export type Priority = "P0" | "P1" | "P2" | "P3";
export type ObjectType = "handbook" | "decision" | "change" | "task" | "flow" | "comment" | "version" | "glossary";

export interface Person { id: string; name: string; email: string; role: Role; initials: string }
export interface Version { id: string; pageSlug: string; pageTitle: string; version: string; author: string; date: string; summary: string; decision?: string; content: string; previousContent?: string }
export interface HandbookPage { id: string; slug: string; title: string; domain: string; status: DecisionStatus; owner: string; updated: string; summary: string; sections: { title: string; body: string }[]; tags: string[]; related: string[] }
export interface Decision { id: string; title: string; status: DecisionStatus; canonical: string; reason: string; owner: string; date: string; sources: string[]; replaces?: string; related: string[] }
export interface Task { id: string; title: string; owner: string; status: TaskStatus; priority: Priority; due?: string; decision: string; document: string; outcome?: string; comments: number }
export interface Flow { id: string; title: string; description: string; status: "Published" | "Draft"; owner: string; mermaid: string; related: string[]; updated: string }
export interface Change { id: string; at: string; type: "document" | "decision" | "flow" | "task" | "system"; object: string; what: string; why: string; owner: string; before: string; after: string; decision: string }
export interface Comment { id: string; objectId: string; author: string; at: string; body: string; resolved: boolean }
export interface SearchResult { id: string; type: ObjectType; title: string; status: string; owner: string; domain: string; date: string; snippet: string; route: string; historical?: boolean; score: number }

