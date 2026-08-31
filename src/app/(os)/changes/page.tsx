import { ChangesView } from "@/components/changes-view";import { PageHead } from "@/components/page-head";import { getChanges } from "@/lib/data";
export default async function Changes(){const changes=await getChanges();return <><PageHead title="Change Log" description="Chronological internal memory: what changed, why, and which decision caused it."/><ChangesView changes={changes}/></>}
