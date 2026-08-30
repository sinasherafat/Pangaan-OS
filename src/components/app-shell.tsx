"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { searchWorkspace } from "@/lib/search";
import { isSearchShortcut } from "@/lib/permissions";

const nav=[
  ["Overview","/"],["Handbook","/handbook"],["Decisions","/decisions"],["Change Log","/changes"],["Tasks","/tasks"],["Flows","/flows"],["Search","/search"],["Versions","/versions"],["Team","/team"],["Settings","/settings"]
];

export function AppShell({children}:{children:React.ReactNode}){
  const pathname=usePathname(); const router=useRouter(); const [open,setOpen]=useState(false); const [q,setQ]=useState(""); const [active,setActive]=useState(0);
  const results=useMemo(()=>searchWorkspace(q).slice(0,8),[q]);
  useEffect(()=>{const onKey=(e:KeyboardEvent)=>{if(isSearchShortcut(e)){e.preventDefault();setOpen(true)} if(e.key==="Escape")setOpen(false)};window.addEventListener("keydown",onKey);return()=>window.removeEventListener("keydown",onKey)},[]);
  const modalKey=(e:React.KeyboardEvent)=>{if(e.key==="ArrowDown"){e.preventDefault();setActive(x=>Math.min(x+1,results.length-1))}if(e.key==="ArrowUp"){e.preventDefault();setActive(x=>Math.max(x-1,0))}if(e.key==="Enter"&&results[active]){router.push(results[active].route);setOpen(false)}};
  return <div className="shell">
    <header className="topbar"><Link href="/" className="brand">Pangaan<span> OS</span></Link><button className="global-search" onClick={()=>setOpen(true)} aria-label="Open global search">⌕ <span>Search Pangaan OS…</span><kbd>⌘K</kbd></button><div className="system"><span className="sync">SYNCED</span><span className="avatar">SS</span></div></header>
    <aside className="sidebar"><nav className="nav">{nav.map(([label,href])=>{const active=href==="/"?pathname===href:pathname.startsWith(href);return <Link key={href} href={href} className={`nav-link ${active?"active":""}`}><span className="nav-icon"/>{label}</Link>})}</nav><div className="workspace-id"><span className="avatar"/><div><strong>Pangaan Core Team</strong><span>Internal workspace</span></div></div><div className="version-label">v0.1 · INTERNAL</div></aside>
    <main className="main">{!process.env.NEXT_PUBLIC_SUPABASE_URL&&<div className="notice">Preview data mode · connect Supabase to enable authenticated persistence.</div>}{children}</main>
    {open&&<div className="search-modal-backdrop" onMouseDown={()=>setOpen(false)}><div className="search-modal" onMouseDown={e=>e.stopPropagation()} onKeyDown={modalKey}><input autoFocus className="input" value={q} onChange={e=>setQ(e.target.value)} placeholder="Search documents, decisions, tasks, flows, comments, versions…"/><div className="modal-results">{results.length?results.map((x,i)=><button key={`${x.type}-${x.id}`} className={`modal-result ${i===active?"active":""}`} onMouseEnter={()=>setActive(i)} onClick={()=>{router.push(x.route);setOpen(false)}}><span className={`badge ${x.status.toLowerCase().replaceAll(" ","-")}`}>{x.type}</span><span>{x.title}</span>{x.historical&&<span className="historical">Historical</span>}<small>{x.owner}</small></button>):<div className="empty">Type to search the Pangaan workspace.</div>}</div></div></div>}
  </div>
}
