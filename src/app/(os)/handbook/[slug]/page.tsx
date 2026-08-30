import { PageHead } from "@/components/page-head"; import { HandbookView } from "@/components/handbook-view";
export default async function HandbookPage({params}:{params:Promise<{slug:string}>}){const {slug}=await params;return <><PageHead title="Handbook / Wiki" description="Living documentation with versions, related decisions, and contextual discussion."/><HandbookView slug={slug}/></>}

