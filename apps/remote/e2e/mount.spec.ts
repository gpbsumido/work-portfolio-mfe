import { test, expect, type Page } from "@playwright/test";

const REMOTE_ORIGIN = "http://localhost:3100";

const harnessStatus = (page: Page) =>
  page.waitForFunction(() => window.__harness?.status !== "loading");

// The guided tour opens itself on a first visit and covers the page; these
// specs are about mounting, so start every visit as a returning one.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() =>
    window.localStorage.setItem("work-portfolio-tour-seen", "true"),
  );
});

test.describe("the built remote, mounted by a host over Module Federation", () => {
  test("mounts, and switches demos from the host's point of view", async ({
    page,
  }) => {
    const remoteRequests: string[] = [];
    page.on("request", (r) => {
      if (r.url().startsWith(REMOTE_ORIGIN)) remoteRequests.push(r.url());
    });

    await page.goto("/");
    await harnessStatus(page);
    expect(await page.evaluate(() => window.__harness.status)).toBe("mounted");
    await expect(
      page.getByRole("heading", { name: /projects · \d+ feature demos/ }),
    ).toBeVisible();

    await page.getByRole("button", { name: "Next feature" }).click();
    const changes = await page.evaluate(() => window.__harness.changes);
    expect(changes.at(-1)).toEqual(expect.any(String));
    await expect(page.getByTestId("demo-stage")).toBeVisible();

    // the code really came from the remote's origin, not the harness
    expect(remoteRequests.some((u) => u.endsWith("/mf-manifest.json"))).toBe(true);
  });

  test("opens the demo the host passes in", async ({ page }) => {
    await page.goto("/?feature=chart-library");
    await harnessStatus(page);
    await expect(
      page.getByRole("heading", { level: 1, name: "Chart library" }),
    ).toBeVisible();
  });

  test("brings its own stylesheet along with the exposed module", async ({
    page,
  }) => {
    await page.goto("/");
    await harnessStatus(page);
    // `flex` on the stage comes from the remote's Tailwind build, which the
    // harness never compiled; if it applies, the manifest's CSS was loaded
    const display = await page
      .getByRole("main", { name: "Demo stage" })
      .evaluate((el) => getComputedStyle(el).display);
    expect(display).toBe("flex");
  });

  test("unmount leaves nothing behind", async ({ page }) => {
    await page.goto("/");
    await harnessStatus(page);
    await page.evaluate(() => window.__harness.unmount?.());
    await expect(page.locator("#root")).toBeEmpty();

    await page.keyboard.press("ArrowRight");
    const changes = await page.evaluate(() => window.__harness.changes);
    expect(changes.filter((c) => c !== null)).toEqual([]);
  });
});
