import type { DecisionStatus,Role } from "./types";
export const canEditCanonical=(role:Role)=>role==="Admin"||role==="Editor";
export const canWriteTaskOrComment=(role:Role)=>role!=="Viewer";
export const canSetDecisionStatus=(role:Role,status:DecisionStatus)=>role==="Admin"||role==="Editor"||((role==="Contributor")&&(status==="Working Proposal"||status==="Open Question"));
export const isSearchShortcut=(event:Pick<KeyboardEvent,"metaKey"|"ctrlKey"|"key">)=>(event.metaKey||event.ctrlKey)&&event.key.toLowerCase()==="k";

