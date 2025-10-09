import { test, expect } from "@playwright/test";

test("Create New User", async ({ page }) => {
  const email = `${Date.now()}@gmail.com`,
    firstName = "John",
    lastName = "Doe",
    password = "OHWEGOIPWEHGOPIWE128479821",
    baseUrl = "http://127.0.0.1:3000",
    mailpitUrl = "http://127.0.0.1:8025";

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
  await page.goto(mailpitUrl + "/search?q=" + email.toLowerCase());
  await page.getByRole("link", { name: "no-reply@ory.kratos.sh To:" }).click();

  // Extract verification link from iframe
  const frame = page.locator("#preview-html").contentFrame();
  const verificationLink = frame.getByRole("link", {
    name: "http://127.0.0.1:4433/self-",
  });
  await verificationLink.waitFor();

  // Get the href attribute and navigate to it
  const verificationUrl = await verificationLink.getAttribute("href");
  if (!verificationUrl) {
    throw new Error("Verification URL not found");
  }

  await page.goto(verificationUrl);

  // Submit verification
  await page.getByRole("button", { name: "Submit" }).click();

  // Create organization
  await page.waitForLoadState("networkidle");
  await page.getByRole("button", { name: "Create Organization" }).click();

  // Verify final redirect
  await expect(page).toHaveURL("http://127.0.0.1:3000/", { timeout: 10000 });
});
