import type { Page } from "@playwright/test";

export interface RegistrationOptions {
  email?: string;
  firstName?: string;
  lastName?: string;
  password?: string;
  baseUrl?: string;
  mailhogUrl?: string;
  skipEmailVerification?: boolean;
  skipOrganizationCreation?: boolean;
}

export interface RegistrationResult {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
}

/**
 * Creates a new user profile by completing the full registration flow
 * @param page - Playwright page object
 * @param options - Registration configuration options
 * @returns Registration details including email and password
 */
export async function createUserProfile(
  page: Page,
  options: RegistrationOptions = {}
): Promise<RegistrationResult> {
  const {
    email = `${Date.now()}@gmail.com`,
    firstName = "John",
    lastName = "Doe",
    password = "OHWEGOIPWEHGOPIWE128479821",
    baseUrl = "http://127.0.0.1:3000",
    mailhogUrl = "http://127.0.0.1:4436",
    skipEmailVerification = false,
    skipOrganizationCreation = false,
  } = options;

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

  if (!skipEmailVerification) {
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
    await page
      .getByRole("link", { name: "http://127.0.0.1:4433/self-" })
      .click();

    // Submit verification
    await page.getByRole("button", { name: "Submit" }).waitFor();
    await page.getByRole("button", { name: "Submit" }).click();
  }

  if (!skipOrganizationCreation) {
    // Create organization
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: "Create Organization" }).click();
  }

  return {
    email,
    firstName,
    lastName,
    password,
  };
}
