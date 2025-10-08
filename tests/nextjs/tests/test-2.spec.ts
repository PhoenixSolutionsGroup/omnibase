import { test, expect } from "@playwright/test";

test("test", async ({ page }) => {
  await page
    .getByRole("link", { name: "🏢 Tenants Test tenant" })
    .nth(1)
    .click();
  await page.getByRole("textbox", { name: "Tenant Name" }).click();
  await page
    .getByRole("textbox", { name: "Tenant Name" })
    .fill("Test Tenant 1");
  await page.getByRole("textbox", { name: "billing@acme.com" }).click();
  await page
    .getByRole("textbox", { name: "billing@acme.com" })
    .fill("testtenant113190739070931@gmail.com");
  await page
    .getByRole("textbox", { name: "billing@acme.com" })
    .press("ControlOrMeta+ArrowLeft");
  await page
    .getByRole("textbox", { name: "billing@acme.com" })
    .press("ArrowLeft");
  await page
    .getByRole("textbox", { name: "billing@acme.com" })
    .press("ArrowLeft");
  await page
    .getByRole("textbox", { name: "billing@acme.com" })
    .press("ArrowLeft");
  await page
    .getByRole("textbox", { name: "billing@acme.com" })
    .press("ArrowLeft");
  await page
    .getByRole("textbox", { name: "billing@acme.com" })
    .press("ArrowLeft");
  await page
    .getByRole("textbox", { name: "billing@acme.com" })
    .press("ArrowLeft");
  await page
    .getByRole("textbox", { name: "billing@acme.com" })
    .press("ArrowLeft");
  await page
    .getByRole("textbox", { name: "billing@acme.com" })
    .press("ArrowLeft");
  await page
    .getByRole("textbox", { name: "billing@acme.com" })
    .press("ArrowRight");
  await page
    .getByRole("textbox", { name: "billing@acme.com" })
    .fill("testtenant1@gmail.com");
  await page
    .getByRole("textbox", { name: "billing@acme.com" })
    .press("ArrowLeft");
  await page
    .getByRole("textbox", { name: "billing@acme.com" })
    .press("ArrowLeft");
  await page
    .getByRole("textbox", { name: "billing@acme.com" })
    .press("ArrowLeft");
  await page
    .getByRole("textbox", { name: "billing@acme.com" })
    .press("ArrowLeft");
  await page
    .getByRole("textbox", { name: "billing@acme.com" })
    .press("ArrowLeft");
  await page
    .getByRole("textbox", { name: "billing@acme.com" })
    .press("ArrowLeft");
  await page
    .getByRole("textbox", { name: "billing@acme.com" })
    .press("ArrowLeft");
  await page
    .getByRole("textbox", { name: "billing@acme.com" })
    .press("ArrowLeft");
  await page
    .getByRole("textbox", { name: "billing@acme.com" })
    .press("ArrowLeft");
  await page.getByRole("textbox", { name: "billing@acme.com" }).click();
  await page
    .getByRole("textbox", { name: "billing@acme.com" })
    .press("ArrowLeft");
  await page
    .getByRole("textbox", { name: "billing@acme.com" })
    .press("ArrowLeft");
  await page
    .getByRole("textbox", { name: "billing@acme.com" })
    .press("ArrowLeft");
  await page
    .getByRole("textbox", { name: "billing@acme.com" })
    .press("ArrowLeft");
  await page
    .getByRole("textbox", { name: "billing@acme.com" })
    .press("ArrowLeft");
  await page
    .getByRole("textbox", { name: "billing@acme.com" })
    .press("ArrowLeft");
  await page
    .getByRole("textbox", { name: "billing@acme.com" })
    .press("ArrowLeft");
  await page
    .getByRole("textbox", { name: "billing@acme.com" })
    .press("ArrowLeft");
  await page
    .getByRole("textbox", { name: "billing@acme.com" })
    .press("ArrowLeft");
  await page
    .getByRole("textbox", { name: "billing@acme.com" })
    .press("ArrowLeft");
  await page
    .getByRole("textbox", { name: "billing@acme.com" })
    .press("ArrowLeft");
  await page
    .getByRole("textbox", { name: "billing@acme.com" })
    .press("ArrowLeft");
  await page
    .getByRole("textbox", { name: "billing@acme.com" })
    .press("ArrowLeft");
  await page
    .getByRole("textbox", { name: "billing@acme.com" })
    .press("ArrowLeft");
  await page
    .getByRole("textbox", { name: "billing@acme.com" })
    .press("ArrowLeft");
  await page
    .getByRole("textbox", { name: "billing@acme.com" })
    .press("ArrowLeft");
  await page
    .getByRole("textbox", { name: "billing@acme.com" })
    .press("ArrowLeft");
  await page
    .getByRole("textbox", { name: "billing@acme.com" })
    .press("ArrowLeft");
  await page
    .getByRole("textbox", { name: "billing@acme.com" })
    .press("ArrowLeft");
  await page
    .getByRole("textbox", { name: "billing@acme.com" })
    .press("ArrowLeft");
  await page
    .getByRole("textbox", { name: "billing@acme.com" })
    .press("ArrowLeft");
  await page
    .getByRole("textbox", { name: "billing@acme.com" })
    .press("ArrowLeft");
  await page
    .getByRole("textbox", { name: "billing@acme.com" })
    .press("ArrowLeft");
  await page
    .getByRole("textbox", { name: "billing@acme.com" })
    .press("ArrowLeft");
  await page
    .getByRole("textbox", { name: "billing@acme.com" })
    .press("ArrowLeft");
  await page
    .getByRole("textbox", { name: "billing@acme.com" })
    .fill("21948918431-testtenant1@gmail.com");
  await page.getByRole("textbox", { name: "billing@acme.com" }).click();
  await page.getByRole("textbox", { name: "billing@acme.com" }).click();
  await page.getByRole("button", { name: "Create Tenant" }).click();
  await page
    .getByRole("link", { name: "🏢 Tenants Test tenant" })
    .nth(1)
    .click();
  await expect(page.locator("main")).toContainText("Test Tenant 1");
  await page.getByRole("combobox").click();
  await page.getByRole("option", { name: "John Doe" }).click();
  await expect(page.locator("main")).toContainText("John Doe");
});
