import { test, expect } from "@playwright/test";
test("production manifest, icons, worker and offline shell", async ({
  page,
  context,
  request,
}) => {
  const manifest = await (await request.get("/manifest.webmanifest")).json();
  expect(manifest.display).toBe("standalone");
  expect(manifest.icons.some((i) => i.sizes === "512x512")).toBe(true);
  for (const path of [
    "/favicon.svg",
    "/icon-192.png",
    "/icon-512.png",
    "/apple-touch-icon.png",
    "/sw.js",
  ])
    expect((await request.get(path)).ok()).toBe(true);
  await page.goto("/");
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.waitForFunction(() => !!navigator.serviceWorker.controller);
  const keys = await page.evaluate(async () => {
    const cache = await caches.open(
      (await caches.keys()).find((k) => k.startsWith("folio-shell-")),
    );
    return (await cache.keys()).map((r) => r.url);
  });
  expect(keys.every((u) => new URL(u).origin === "http://127.0.0.1:4173")).toBe(
    true,
  );
  expect(keys.some((u) => u.includes("/assets/"))).toBe(true);
  await context.setOffline(true);
  await page.reload();
  await expect(
    page.getByRole("button", { name: "နမူနာ စမ်းသုံးမည်" }),
  ).toBeVisible();
  await expect(page.getByRole("status")).toContainText("အင်တာနက်");
  await context.setOffline(false);
});
test("install prompt action and installed state", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => {
    const e = new Event("beforeinstallprompt");
    e.prompt = async () => {
      window.promptCalled = true;
    };
    e.userChoice = Promise.resolve({ outcome: "accepted" });
    window.dispatchEvent(e);
  });
  await page.getByRole("button", { name: "App ထည့်သွင်းရန်" }).click();
  expect(await page.evaluate(() => window.promptCalled)).toBe(true);
  await page.evaluate(() => window.dispatchEvent(new Event("appinstalled")));
  await expect(
    page.getByRole("button", { name: "App ထည့်သွင်းရန်" }),
  ).toHaveCount(0);
});
