import { describe,expect,it } from "vitest";import { searchWorkspace } from "./search";
describe("workspace search",()=>{it("ranks exact canonical title above body and history",()=>{const rows=searchWorkspace("Product Passport v1.3");expect(rows[0].type).toBe("decision");expect(rows[0].historical).not.toBe(true)});it("filters by object type",()=>{expect(searchWorkspace("context","flow").every(x=>x.type==="flow")).toBe(true)});it("keeps historical revisions visibly marked",()=>{expect(searchWorkspace("inventory write-back").some(x=>x.type==="version"&&x.historical)).toBe(true)})});

