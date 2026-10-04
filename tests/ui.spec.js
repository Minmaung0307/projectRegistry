import { test, expect } from "@playwright/test";
test("Myanmar CRUD, account mappings, modal cancel and delete", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("dialog", () => {
    throw new Error("Unexpected native dialog");
  });
  await page.goto("/");
  await page.getByRole("button", { name: "နမူနာ စမ်းသုံးမည်" }).click();
  await page.getByRole("button", { name: "ပရောဂျက်အသစ်", exact: true }).click();
  await page
    .getByRole("textbox", { name: "ပရောဂျက်အမည် *", exact: true })
    .fill("စမ်းသပ် app");
  await page.getByRole("button", { name: "ပြင်ဆင်မှု ပယ်ဖျက်မည်" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByRole("button", { name: "မလုပ်သေးပါ" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(
    page.getByRole("textbox", { name: "ပရောဂျက်အမည် *", exact: true }),
  ).toHaveValue("စမ်းသပ် app");
  await page.getByRole("button", { name: "အကောင့်မှတ်တမ်း ထည့်မည်" }).click();
  await page.getByLabel("လူအမည် / အကောင့်အညွှန်း").fill("မောင်မောင်");
  await page.getByLabel("တာဝန် / Role", { exact: true }).fill("TA");
  await page
    .getByLabel("ဒီ app မှာ အသုံးပြုသော email")
    .fill("alex+ta@example.com");
  await page.getByRole("button", { name: "ပရောဂျက် သိမ်းမည်" }).click();
  await expect(
    page.getByRole("heading", { name: "စမ်းသပ် app" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "ပရောဂျက် ပြင်မည်", exact: true })
    .click();
  await page
    .getByRole("textbox", { name: "ပရောဂျက်အမည် *", exact: true })
    .fill("ပြင်ပြီး app");
  await page.getByRole("button", { name: "ပရောဂျက် သိမ်းမည်" }).click();
  await page
    .getByRole("button", { name: "ပရောဂျက်အားလုံး", exact: true })
    .click();
  await page
    .getByRole("textbox", { name: "ပရောဂျက်နှင့် email ရှာရန်" })
    .fill("alex+ta@example.com");
  await expect(
    page.getByRole("heading", { name: "ပြင်ပြီး app" }),
  ).toBeVisible();
  await page.getByRole("button", { name: /ပြင်ပြီး app/ }).click();
  await page.getByRole("button", { name: "ပရောဂျက် ဖျက်မည်" }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "မလုပ်သေးပါ" })
    .click();
  await expect(
    page.getByRole("heading", { name: "ပြင်ပြီး app" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "ပရောဂျက် ဖျက်မည်" }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "အပြီးဖျက်မည်" })
    .click();
  await expect(
    page.getByRole("heading", { name: "ကိုက်ညီသော ပရောဂျက် မတွေ့ပါ" }),
  ).toBeVisible();
  await page
    .getByRole("textbox", { name: "ပရောဂျက်နှင့် email ရှာရန်" })
    .fill("");
  await page.screenshot({
    path: test.info().outputPath("dashboard.png"),
    fullPage: true,
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  expect(errors).toEqual([]);
});
test("install guidance and safe discard", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "App ထည့်သွင်းရန်" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "နမူနာ စမ်းသုံးမည်" }).click();
  await page.getByRole("button", { name: "ပရောဂျက်အသစ်", exact: true }).click();
  await page.getByRole("button", { name: "ပြင်ဆင်မှု ပယ်ဖျက်မည်" }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "ပယ်ဖျက်မည်", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "သင့်ပရောဂျက်များ." }),
  ).toBeVisible();
});

test('logout is available while editing and cancellation preserves changes', async ({page})=>{
 await page.goto('/');await page.getByRole('button',{name:'နမူနာ စမ်းသုံးမည်'}).click();
 await page.getByRole('button',{name:'ပရောဂျက်အသစ်',exact:true}).click();
 const name=page.getByRole('textbox',{name:'ပရောဂျက်အမည် *',exact:true});await name.fill('မသိမ်းရသေး');
 const logout=page.getByRole('button',{name:'နမူနာမှ ထွက်မည်'});await expect(logout).toBeEnabled();await logout.click();
 await page.getByRole('dialog').getByRole('button',{name:'မလုပ်သေးပါ'}).click();await expect(name).toHaveValue('မသိမ်းရသေး');
 await logout.click();await page.getByRole('dialog').getByRole('button',{name:'မသိမ်းဘဲ ထွက်မည်'}).click();await expect(page.getByRole('button',{name:'Google / Gmail ဖြင့် ဝင်မည်'})).toBeVisible();
 await page.getByRole('button',{name:'နမူနာ စမ်းသုံးမည်'}).click();await expect(page.getByRole('dialog')).toHaveCount(0);await page.getByRole('button',{name:'နမူနာမှ ထွက်မည်'}).click();await expect(page.getByRole('button',{name:'Google / Gmail ဖြင့် ဝင်မည်'})).toBeVisible();
});
