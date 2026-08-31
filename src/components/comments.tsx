"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createComment } from "@/app/actions";
import type { Comment } from "@/lib/types";

export function Comments({ objectType, objectId, comments }: { objectType: "handbook" | "decision" | "task" | "flow"; objectId: string; comments: Comment[] }) {
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  return <div><h3 className="section-title">Contextual discussion</h3>{comments.length ? comments.map((comment) => <div className="comment" key={comment.id}><span className="avatar">{comment.author.slice(0, 1)}</span><div><strong className="mint">{comment.author}</strong><span className="tiny muted"> · {comment.at}{comment.resolved ? " · resolved" : ""}</span><p>{comment.body}</p></div></div>) : <p className="tiny muted">No discussion yet.</p>}<form ref={formRef} onSubmit={(event) => { event.preventDefault(); const body = String(new FormData(event.currentTarget).get("body") ?? ""); startTransition(async () => { try { await createComment({ objectType, objectId, body }); formRef.current?.reset(); setMessage("Comment saved."); router.refresh(); } catch { setMessage("Unable to save comment."); } }); }}><input name="body" className="input" placeholder="Comment on this object…" aria-label="Add contextual comment" disabled={pending}/>{message && <p className="tiny muted">{message}</p>}</form></div>;
}
