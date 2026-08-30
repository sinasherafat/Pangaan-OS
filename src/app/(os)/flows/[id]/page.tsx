import { PageHead } from "@/components/page-head";import { FlowsView } from "@/components/flows-view";
export default async function FlowDetail({params}:{params:Promise<{id:string}>}){const {id}=await params;return <><PageHead title="Flows" description="Edit Mermaid source, preview the sanitized diagram, and save an immutable version."/><FlowsView initialId={id}/></>}

