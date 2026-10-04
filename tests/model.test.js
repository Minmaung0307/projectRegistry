import { describe, it, expect } from "vitest";
import {
  blankProject,
  projectSchema,
  filterProjects,
  sampleProjects,
} from "../src/model";
describe("project validation and discovery", () => {
  it("requires a meaningful project name", () => {
    expect(
      projectSchema.safeParse({ ...blankProject(), name: "  " }).success,
    ).toBe(false);
  });
  it("accepts custom roles and exact per-app emails", () => {
    const p = {
      ...blankProject(),
      name: "Test",
      members: [
        {
          name: "Alex",
          role: "Reviewer",
          email: "Alex+review@example.com",
          notes: "",
        },
      ],
    };
    expect(projectSchema.parse(p).members[0].email).toBe(
      "Alex+review@example.com",
    );
  });
  it("rejects unsafe links, malformed emails, and secret fields", () => {
    for (const patch of [
      { productionUrl: "javascript:alert(1)" },
      { githubEmail: "invalid" },
      { token: "secret" },
    ])
      expect(
        projectSchema.safeParse({ ...blankProject(), name: "Test", ...patch })
          .success,
      ).toBe(false);
  });
  it("finds nested account emails and combines filters", () => {
    expect(
      filterProjects(
        sampleProjects,
        "STUDENT@example.com",
        "Active",
        "Production",
      ),
    ).toHaveLength(1);
    expect(
      filterProjects(sampleProjects, "student@example.com", "Archived", "All"),
    ).toHaveLength(0);
  });
  it("rejects malformed members and excessive mappings", () => {
    expect(
      projectSchema.safeParse({
        ...blankProject(),
        name: "Test",
        members: [{ role: "Admin", email: "a@example.com" }],
      }).success,
    ).toBe(false);
    expect(
      projectSchema.safeParse({
        ...blankProject(),
        name: "Test",
        members: Array(13).fill({
          role: "Admin",
          name: "A",
          email: "a@example.com",
          notes: "",
        }),
      }).success,
    ).toBe(false);
  });
});
