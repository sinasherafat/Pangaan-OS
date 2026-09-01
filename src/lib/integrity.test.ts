import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const migration = readFileSync(join(root, "supabase/migrations/20260831020000_runtime_source_of_truth.sql"), "utf8");

describe("database runtime integrity", () => {
  it("removes the bundled runtime seed source", () => {
    expect(() => readFileSync(join(root, "src/lib/seed.ts"), "utf8")).toThrow();
  });
  it("keeps search synchronized for every persisted object family", () => {
    for (const family of ["handbook", "decision", "task", "flow", "version", "change", "comment", "glossary"]) expect(migration).toContain(`${family}_search_sync`);
  });
  it("saves Handbook revisions transactionally", () => {
    expect(migration).toContain("function public.save_handbook_revision");
    expect(migration).toContain("for update");
    expect(migration).toContain("insert into public.page_versions");
    expect(migration).toContain("update public.handbook_pages set current_version_id");
  });
  it("points runtime search at the Supabase repository", () => {
    expect(readFileSync(join(root, "src/app/api/search/route.ts"), "utf8")).toContain("@/lib/data");
  });
});
