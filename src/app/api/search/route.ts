import { NextRequest,NextResponse } from "next/server";import { searchWorkspace } from "@/lib/search";import type { ObjectType } from "@/lib/types";
export async function GET(request:NextRequest){const q=request.nextUrl.searchParams.get("q")??"";const type=(request.nextUrl.searchParams.get("type")??"all") as ObjectType|"all";return NextResponse.json({results:searchWorkspace(q,type)});}

