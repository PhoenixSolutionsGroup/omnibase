import { test, expect } from "@playwright/test";
import { createUserProfile } from "../helpers/registration";

test("Create tenant and switch to new tenant", async ({ page }) => {
  await createUserProfile(page);

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
    .fill(`${Date.now()}-testtenant1@gmail.com`);
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
