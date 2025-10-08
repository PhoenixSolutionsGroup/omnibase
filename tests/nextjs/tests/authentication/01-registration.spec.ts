import { test, expect } from "@playwright/test";
import { createUserProfile } from "../helpers/registration";

test("Create New User", async ({ page }) => {
  const email = `${Date.now()}@gmail.com`,
    firstName = "John",
    lastName = "Doe",
    password = "OHWEGOIPWEHGOPIWE128479821",
    baseUrl = "http://127.0.0.1:3000",
    mailhogUrl = "http://127.0.0.1:4436";

  // Navigate to sign up page
  await page.goto(`${baseUrl}/`);
  await page.getByRole("link", { name: "Sign up" }).click();

  // Fill in registration form (step 1: email and names)
  await page.getByRole("textbox", { name: "E-Mail *" }).waitFor();
  await page.getByRole("textbox", { name: "E-Mail *" }).fill(email);
  await page.getByRole("textbox", { name: "First Name" }).fill(firstName);
  await page.getByRole("textbox", { name: "Last Name" }).fill(lastName);
  await page.getByRole("button", { name: "Sign up", exact: true }).click();

  // Fill in password (step 2)
  await page.getByRole("textbox", { name: "Password *" }).waitFor();
  await page.getByRole("textbox", { name: "Password *" }).fill(password);
  await page.getByRole("button", { name: "Sign up" }).click();

  // Go to email verification UI and search for email
  await page.goto(mailhogUrl);
  await page.getByRole("button", { name: "   Search" }).click();
  await page.getByLabel("To:").click();
  await page.getByLabel("To:").fill(email);
  await page
    .getByLabel("Search Mail")
    .getByText("Search", { exact: true })
    .click();

  await page.waitForTimeout(100);
  await page.getByRole("link", { name: "Please verify your email" }).click();

  // Click verification link
  await page
    .getByRole("link", { name: "http://127.0.0.1:4433/self-" })
    .waitFor();
  await page.getByRole("link", { name: "http://127.0.0.1:4433/self-" }).click();

  // Submit verification
  await page.getByRole("button", { name: "Submit" }).waitFor();
  await page.getByRole("button", { name: "Submit" }).click();

  // Create organization
  await page.waitForLoadState("networkidle");
  await page.getByRole("button", { name: "Create Organization" }).click();

  // Verify final redirect
  await expect(page).toHaveURL("http://127.0.0.1:3000/", { timeout: 10000 });
});
