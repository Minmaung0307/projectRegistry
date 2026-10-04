import { groups } from "./model";
const labels = {
  Overview: "အကျဉ်းချုပ်",
  "Project name": "ပရောဂျက်အမည်",
  Description: "အကြောင်းအရာ",
  Status: "အခြေအနေ",
  Environment: "အသုံးပြုရာအဆင့်",
  "Framework / tech stack": "အသုံးပြုထားသော နည်းပညာများ",
  "Source code": "မူရင်းကုဒ်",
  "Local repository path": "စက်ထဲရှိ repo လမ်းကြောင်း",
  "GitHub account / organization": "GitHub အကောင့် / အဖွဲ့အစည်း",
  "GitHub email": "GitHub မှာ သုံးထားသော email",
  "GitHub repository URL": "GitHub repo လိပ်စာ",
  Branch: "Branch အမည်",
  "Firebase Google account email": "Firebase မှာ သုံးထားသော Google email",
  "Firebase project name": "Firebase ပရောဂျက်အမည်",
  "Firebase project ID": "Firebase ပရောဂျက် ID",
  "Hosting site": "Hosting ဆိုက်အမည်",
  Deployment: "ဖြန့်ချိမှု",
  "Production URL": "လက်ရှိအသုံးပြုသော URL",
  "Custom domain": "ကိုယ်ပိုင် domain",
  "Deployment method": "ဖြန့်ချိသည့်နည်းလမ်း",
  "Last deployed date": "နောက်ဆုံးဖြန့်ချိသည့်ရက်",
  Notes: "မှတ်စုများ",
  "Project notes": "ပရောဂျက်မှတ်စုများ",
  "Person / label": "လူအမည် / အကောင့်အညွှန်း",
  Role: "တာဝန် / Role",
  "Email used in this app": "ဒီ app မှာ အသုံးပြုသော email",
  Active: "အသုံးပြုနေဆဲ",
  "In progress": "လုပ်ဆောင်နေဆဲ",
  "On hold": "ခေတ္တရပ်ထား",
  Archived: "သိမ်းဆည်းထား",
  Production: "အမှန်တကယ်အသုံးပြုမှု",
  Staging: "မဖြန့်ချိမီ စမ်းသပ်မှု",
  Development: "တည်ဆောက်နေဆဲ",
};
export const labelOf = (v) => labels[v] || v;
export const fieldLabel = (k) =>
  labelOf(
    groups.flatMap(([, fs]) => fs).find(([key]) => key === k)?.[1] ||
      {
        members: "အကောင့်မှတ်တမ်း",
        email: "Email",
        role: "တာဝန်",
        name: "အမည်",
      }[k] ||
      k,
  );
export function validationMessage(issue) {
  return (
    issue.path
      .map((k) => (typeof k === "number" ? k + 1 : fieldLabel(k)))
      .join(" › ") +
    ": " +
    (issue.code === "too_big"
      ? "သတ်မှတ်ထားသော အများဆုံးပမာဏထက် ကျော်နေပါတယ်။"
      : issue.code === "too_small"
        ? "ဒီအချက်ကို ဖြည့်ပေးပါ။"
        : "မှန်ကန်သော အချက်အလက် ဖြည့်ပေးပါ။ Email၊ URL နှင့် ရက်စွဲပုံစံကို စစ်ပါ။")
  );
}
