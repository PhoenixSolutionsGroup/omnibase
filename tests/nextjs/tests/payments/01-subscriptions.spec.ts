import { test, expect } from "@playwright/test";
import { createUserProfile } from "../helpers/registration";

test("Subscribe to monthly Starter Plan", async ({ page }) => {
  await createUserProfile(page);

  await page
    .getByRole("link", { name: "💳 Payments Test Stripe" })
    .nth(1)
    .click();
  await page.getByRole("button", { name: "Start Free Trial" }).click();
  await expect(page.getByTestId("product-summary-total-amount")).toContainText(
    "$9.99"
  );
  await page.getByRole("textbox", { name: "Card number" }).click();
  await page
    .getByRole("textbox", { name: "Card number" })
    .fill("4242 4242 4242 42422");
  await page.getByRole("textbox", { name: "Card number" }).press("Tab");
  await page.getByRole("textbox", { name: "Expiration" }).fill("03 / 29");
  await page.getByRole("textbox", { name: "Expiration" }).press("Tab");
  await page.getByRole("textbox", { name: "CVC" }).fill("000");
  await page.getByRole("textbox", { name: "CVC" }).press("Tab");
  await page.getByRole("textbox", { name: "Cardholder name" }).fill("John Doe");
  await page.getByTestId("hosted-payment-submit-button").click();

  await page
    .getByRole("link", { name: "💳 Payments Test Stripe" })
    .nth(1)
    .click();
  await page.getByRole("link", { name: "Open Customer Portal" }).click();
  await page.waitForLoadState("networkidle");

  await expect(page.getByTestId("page-container-main")).toContainText(
    "Starter Plan"
  );
  await expect(page.getByTestId("page-container-main")).toContainText(
    "$9.99 per month"
  );
});

test("Subscribe to yearly Starter Plan", async ({ page }) => {
  await createUserProfile(page);

  await page
    .getByRole("link", { name: "💳 Payments Test Stripe" })
    .nth(1)
    .click();
  await page.getByRole("button", { name: "Yearly" }).click();
  await page.getByRole("button", { name: "Start Free Trial" }).click();
  await expect(page.getByTestId("product-summary-total-amount")).toContainText(
    "$99.99"
  );
  await page.getByRole("textbox", { name: "Card number" }).click();
  await page
    .getByRole("textbox", { name: "Card number" })
    .fill("4242 4242 4242 42422");
  await page.getByRole("textbox", { name: "Card number" }).press("Tab");
  await page.getByRole("textbox", { name: "Expiration" }).fill("03 / 296");
  await page.getByRole("textbox", { name: "Expiration" }).press("Tab");
  await page.getByRole("textbox", { name: "CVC" }).fill("000");
  await page.getByRole("textbox", { name: "Cardholder name" }).click();
  await page.getByRole("textbox", { name: "Cardholder name" }).fill("John Doe");
  await page.getByTestId("checkout-container").click();
  await page.getByTestId("hosted-payment-submit-button").click();

  await page
    .getByRole("link", { name: "💳 Payments Test Stripe" })
    .nth(1)
    .click();
  await page.getByRole("link", { name: "Open Customer Portal" }).click();
  await page.waitForLoadState("networkidle");
  await expect(page.getByTestId("page-container-main")).toContainText(
    "$99.99 per year"
  );
  await expect(page.getByTestId("page-container-main")).toContainText(
    "Starter Plan"
  );
});
