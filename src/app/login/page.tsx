"use client";
import { FormEvent,useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function Login(){
 const router=useRouter();const [message,setMessage]=useState("");const [loading,setLoading]=useState(false);
 async function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();setLoading(true);const form=new FormData(e.currentTarget);try{const supabase=createClient();const {error}=await supabase.auth.signInWithPassword({email:String(form.get("email")),password:String(form.get("password"))});if(error)throw error;router.push("/");router.refresh()}catch(err){setMessage(err instanceof Error?err.message:"Unable to sign in");setLoading(false)}}
 return <main className="login"><section className="panel login-card"><div className="brand" style={{padding:0}}>Pangaan<span> OS</span></div><h1>Internal workspace</h1><p className="muted">Sign in with your Pangaan account. Access is role-controlled and audited.</p><form onSubmit={submit}><label className="tiny muted">Email</label><input required name="email" type="email" className="input" autoComplete="email"/><label className="tiny muted">Password</label><input required name="password" type="password" className="input" autoComplete="current-password"/>{message&&<div className="notice">{message}</div>}<button className="btn mint-btn" disabled={loading}>{loading?"Signing in…":"Sign in"}</button></form></section></main>
}
