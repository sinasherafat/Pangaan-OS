import { NextResponse } from "next/server";import { getWorkspaceContext } from "@/lib/data";
export async function GET(_request:Request,{params}:{params:Promise<{type:string;id:string}>}){const {type,id}=await params;const context=await getWorkspaceContext(type,id);return context?NextResponse.json(context):NextResponse.json({error:"Object not found"},{status:404});}
