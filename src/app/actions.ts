"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { Json } from "@/lib/database.types";
import { createClient } from "@/lib/supabase/server";

const commentSchema = z.object({ objectType: z.enum(["handbook", "decision", "task", "flow"]), objectId: z.string().min(3).max(100), body: z.string().trim().min(1).max(4000) });
const taskSchema = z.object({ taskCode: z.string().regex(/^TASK-\d{3,}$/), title: z.string().min(3).max(180), ownerLabel: z.string().min(1).max(100), status: z.enum(["Backlog", "In Progress", "Review", "Done"]), priority: z.enum(["P0", "P1", "P2", "P3"]), dueAt: z.string().optional(), outcome: z.string().max(2000).optional() });
const flowSchema = z.object({ flowCode: z.string().regex(/^FLOW-\d{3,}$/), title: z.string().min(3).max(180), description: z.string().max(1000), mermaidSource: z.string().min(8).max(30000), status: z.enum(["Draft", "Published"]), ownerLabel: z.string().min(1).max(100) });
const decisionSchema = z.object({ decisionCode: z.string().regex(/^DEC-\d{3,}$/), title: z.string().min(3).max(180), status: z.enum(["Approved", "Working Proposal", "Deprecated", "Open Question"]), canonicalText: z.string().min(10).max(10000), reason: z.string().min(10).max(10000), ownerLabel: z.string().min(1).max(100), sources: z.string().max(2000).optional() });
const handbookSchema = z.object({ slug: z.string().min(3).max(120), markdown: z.string().min(10).max(50000), summary: z.string().min(3).max(500), decisionCode: z.string().regex(/^DEC-\d{3,}$/).optional().or(z.literal("")) });
const changeSchema = z.object({ objectType: z.string().min(2).max(60), objectId: z.string().min(2).max(120), changeType: z.enum(["document", "decision", "flow", "task", "system"]), whatChanged: z.string().min(3).max(500), reason: z.string().min(3).max(2000), beforeRef: z.string().max(500).optional(), afterRef: z.string().max(500).optional(), decisionCode: z.string().regex(/^DEC-\d{3,}$/).optional().or(z.literal("")) });

async function authed() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error("Authentication required");
  const { data: profile, error: profileError } = await supabase.from("profiles").select("name,role").eq("id", data.user.id).single();
  if (profileError) throw profileError;
  return { supabase, user: data.user, profile };
}

function parseMarkdown(markdown: string): Json {
  const sections: Record<string, string> = {};
  let title = "Overview";
  for (const block of markdown.trim().split(/\n(?=##\s)/)) {
    const match = block.match(/^##\s+([^\n]+)\n?([\s\S]*)$/);
    if (match) { title = match[1].trim(); sections[title] = match[2].trim(); }
    else sections[title] = block.trim();
  }
  return sections;
}

export async function createComment(input: z.input<typeof commentSchema>) {
  const value = commentSchema.parse(input); const { supabase, user } = await authed();
  const { error } = await supabase.from("comments").insert({ object_type: value.objectType, object_id: value.objectId, body: value.body, author_id: user.id });
  if (error) throw error; revalidatePath("/", "layout");
}

export async function saveHandbookVersion(input: z.input<typeof handbookSchema>) {
  const value = handbookSchema.parse(input); const { supabase } = await authed();
  const { error } = await supabase.rpc("save_handbook_revision", { page_slug: value.slug, revision_content: parseMarkdown(value.markdown), revision_summary: value.summary, decision_code: value.decisionCode || null });
  if (error) throw error; revalidatePath("/", "layout");
}

export async function upsertTask(input: z.input<typeof taskSchema>) {
  const value = taskSchema.parse(input); const { supabase, user, profile } = await authed();
  const { data: before } = await supabase.from("tasks").select("status").eq("task_code", value.taskCode).maybeSingle();
  const { error } = await supabase.from("tasks").upsert({ task_code: value.taskCode, title: value.title, owner_label: value.ownerLabel, status: value.status, priority: value.priority, due_at: value.dueAt || null, outcome: value.outcome || null, ...(before ? {} : { created_by: user.id }) }, { onConflict: "task_code" });
  if (error) throw error;
  const { error: changeError } = await supabase.from("change_entries").insert({ object_type: "task", object_id: value.taskCode, change_type: "task", what_changed: `${value.title} ${before ? "updated" : "created"}`, reason: value.outcome || "Task record updated", before_ref: before?.status ?? null, after_ref: value.status, author_id: user.id, author_label: profile.name });
  if (changeError) throw changeError;
  revalidatePath("/", "layout");
}

export async function upsertFlow(input: z.input<typeof flowSchema>) {
  const value = flowSchema.parse(input); const { supabase, user, profile } = await authed();
  const { data: before } = await supabase.from("flows").select("status,updated_at").eq("flow_code", value.flowCode).maybeSingle();
  const { error } = await supabase.from("flows").upsert({ flow_code: value.flowCode, title: value.title, description: value.description, mermaid_source: value.mermaidSource, status: value.status, owner_label: value.ownerLabel, ...(before ? {} : { created_by: user.id }) }, { onConflict: "flow_code" });
  if (error) throw error;
  const { error: changeError } = await supabase.from("change_entries").insert({ object_type: "flow", object_id: value.flowCode, change_type: "flow", what_changed: `${value.title} ${before ? "updated" : "created"}`, reason: "Mermaid source saved", before_ref: before?.updated_at ?? null, after_ref: new Date().toISOString(), author_id: user.id, author_label: profile.name });
  if (changeError) throw changeError;
  revalidatePath("/", "layout");
}

export async function upsertDecision(input: z.input<typeof decisionSchema>) {
  const value = decisionSchema.parse(input); const { supabase, user, profile } = await authed();
  const { data: before } = await supabase.from("decisions").select("status").eq("decision_code", value.decisionCode).maybeSingle();
  const { data: saved, error } = await supabase.from("decisions").upsert({ decision_code: value.decisionCode, title: value.title, status: value.status, canonical_text: value.canonicalText, reason: value.reason, owner_label: value.ownerLabel, sources: value.sources?.split(",").map((source) => source.trim()).filter(Boolean) ?? [], ...(before ? {} : { created_by: user.id }) }, { onConflict: "decision_code" }).select("id").single();
  if (error) throw error;
  const { error: changeError } = await supabase.from("change_entries").insert({ object_type: "decision", object_id: value.decisionCode, change_type: "decision", what_changed: `${value.title} ${before ? "updated" : "created"}`, reason: value.reason, before_ref: before?.status ?? null, after_ref: value.status, linked_decision_id: saved.id, author_id: user.id, author_label: profile.name });
  if (changeError) throw changeError;
  revalidatePath("/", "layout");
}

export async function createChange(input: z.input<typeof changeSchema>) {
  const value = changeSchema.parse(input); const { supabase, user, profile } = await authed();
  const { data: linkedDecision, error: decisionError } = value.decisionCode ? await supabase.from("decisions").select("id").eq("decision_code", value.decisionCode).maybeSingle() : { data: null, error: null };
  if (decisionError) throw decisionError;
  const linkedDecisionId = linkedDecision?.id ?? null;
  const { error } = await supabase.from("change_entries").insert({ object_type: value.objectType, object_id: value.objectId, change_type: value.changeType, what_changed: value.whatChanged, reason: value.reason, before_ref: value.beforeRef || null, after_ref: value.afterRef || null, linked_decision_id: linkedDecisionId, author_id: user.id, author_label: profile.name });
  if (error) throw error; revalidatePath("/", "layout");
}
