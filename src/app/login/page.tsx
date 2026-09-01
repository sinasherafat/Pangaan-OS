"use client";
import { FormEvent,useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "@/app/login/actions";

export default function Login(){
 const router=useRouter();const [message,setMessage]=useState("");const [loading,setLoading]=useState(false);
 async function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();setLoading(true);setMessage("");const form=new FormData(e.currentTarget);const result=await signIn({email:String(form.get("email")),password:String(form.get("password"))});if(!result.ok){setMessage(result.message);setLoading(false);return}router.push("/");router.refresh()}
 return <main className="login"><section className="panel login-card"><div className="brand" style={{padding:0}}>Pangaan<span> OS</span></div><h1>Internal workspace</h1><p className="muted">Sign in with your Pangaan account. Access is role-controlled and audited.</p><form onSubmit={submit}><label htmlFor="email" className="tiny muted">Email</label><input id="email" required name="email" type="email" className="input" autoComplete="email"/><label htmlFor="password" className="tiny muted">Password</label><input id="password" required name="password" type="password" className="input" autoComplete="current-password"/>{message&&<div className="notice">{message}</div>}<button className="btn mint-btn" disabled={loading}>{loading?"Signing in…":"Sign in"}</button></form></section></main>
}
