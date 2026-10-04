import { z } from "zod";
export const groups = [
  [
    "Overview",
    [
      ["name", "Project name"],
      ["description", "Description", "textarea"],
      ["status", "Status", "status"],
      ["environment", "Environment", "environment"],
      ["stack", "Framework / tech stack"],
    ],
  ],
  [
    "Source code",
    [
      ["localPath", "Local repository path"],
      ["githubAccount", "GitHub account / organization"],
      ["githubEmail", "GitHub email", "email"],
      ["githubRepo", "GitHub repository URL", "url"],
      ["branch", "Branch"],
    ],
  ],
  [
    "Firebase",
    [
      ["firebaseEmail", "Firebase Google account email", "email"],
      ["firebaseName", "Firebase project name"],
      ["firebaseId", "Firebase project ID"],
      ["hostingSite", "Hosting site"],
    ],
  ],
  [
    "Deployment",
    [
      ["productionUrl", "Production URL", "url"],
      ["domain", "Custom domain"],
      ["deployMethod", "Deployment method"],
      ["lastDeployed", "Last deployed date", "date"],
    ],
  ],
  ["Notes", [["notes", "Project notes", "textarea"]]],
];
export const statuses = ["Active", "In progress", "On hold", "Archived"];
export const environments = ["Production", "Staging", "Development"];
const text = z.string().max(2000);
const email = z.union([z.literal(""), z.string().email().max(254)]);
const url = z.union([
  z.literal(""),
  z
    .string()
    .url()
    .max(2000)
    .refine((v) => /^https?:\/\//i.test(v), "Use an http or https URL"),
]);
export const memberSchema = z
  .object({
    role: z.string().trim().min(1).max(80),
    name: z.string().trim().min(1).max(200),
    email: z.string().email().max(254),
    notes: text,
  })
  .strict();
export const projectSchema = z
  .object(
    Object.fromEntries(
      groups.flatMap(([, fields]) =>
        fields.map(([key, , type]) => [
          key,
          key === "name"
            ? z.string().trim().min(1, "Project name is required").max(200)
            : type === "email"
              ? email
              : type === "url"
                ? url
                : key === "status"
                  ? z.enum(statuses)
                  : key === "environment"
                    ? z.enum(environments)
                    : key === "lastDeployed"
                      ? z
                          .string()
                          .refine(
                            (v) =>
                              v === "" ||
                              (/^\d{4}-\d{2}-\d{2}$/.test(v) &&
                                !isNaN(Date.parse(v)) &&
                                new Date(v).toISOString().slice(0, 10) === v),
                            "Use a valid date",
                          )
                      : text,
        ]),
      ),
    ),
  )
  .extend({ members: z.array(memberSchema).max(12) })
  .strict();
export const blankProject = () => ({
  ...Object.fromEntries(groups.flatMap(([, fs]) => fs.map(([k]) => [k, ""]))),
  status: "In progress",
  environment: "Development",
  branch: "main",
  members: [],
});
export function filterProjects(projects, search, status, environment) {
  const q = search.toLowerCase().trim();
  return projects.filter(
    (p) =>
      (status === "All" || p.status === status) &&
      (environment === "All" || p.environment === environment) &&
      JSON.stringify(p).toLowerCase().includes(q),
  );
}
export const sampleProjects = [
  {
    ...blankProject(),
    id: "demo-college",
    name: "Panna College",
    description: "သင်ကြားရေးနှင့် ကျောင်းလုပ်ငန်းများအတွက် ဝက်ဘ်အက်ပ်။",
    status: "Active",
    environment: "Production",
    stack: "React · Firebase",
    githubAccount: "panna-team",
    githubEmail: "developer@example.com",
    githubRepo: "https://github.com/example/panna-college",
    localPath: "~/projects/panna-college",
    firebaseEmail: "college-admin@example.com",
    firebaseName: "Panna College",
    firebaseId: "panna-college-example",
    hostingSite: "panna-college-example",
    domain: "college.example.com",
    productionUrl: "https://college.example.com",
    deployMethod: "Firebase CLI",
    members: [
      {
        role: "Admin",
        name: "ကျောင်းစီမံသူ",
        email: "admin@example.com",
        notes: "အဓိက ဆက်သွယ်ရန်",
      },
      {
        role: "Student",
        name: "ကျောင်းသား စမ်းသပ်အကောင့်",
        email: "student@example.com",
        notes: "ကျောင်းသားဘက်မှ အသုံးပြုမှုကို စမ်းရန်",
      },
    ],
  },
  {
    ...blankProject(),
    id: "demo-studio",
    name: "Studio workspace",
    description: "အဖွဲ့ဝင်များနှင့် လုပ်ငန်းပရောဂျက်များကို စီမံရန်။",
    stack: "Next.js · Firestore",
    githubAccount: "studio-team",
    members: [
      {
        role: "Manager",
        name: "အဖွဲ့ခေါင်းဆောင်",
        email: "lead@example.com",
        notes: "",
      },
    ],
  },
  {
    ...blankProject(),
    id: "demo-shop",
    name: "Little Market",
    description: "ကုန်ပစ္စည်းများ ရောင်းချရန် ရိုးရှင်းသော အွန်လိုင်းဆိုင်။",
    status: "On hold",
    environment: "Staging",
    stack: "React · Vite",
  },
];
