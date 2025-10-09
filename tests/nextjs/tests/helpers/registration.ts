import type { Page } from "@playwright/test";

export interface RegistrationOptions {
  email?: string;
  firstName?: string;
  lastName?: string;
  password?: string;
  baseUrl?: string;
  mailpitUrl?: string;
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
    mailpitUrl = "http://127.0.0.1:8025",
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
    // Go to Mailpit and search for email
    await page.goto(mailpitUrl + "/search?q=" + email.toLowerCase());
    await page
      .getByRole("link", { name: "no-reply@ory.kratos.sh To:" })
      .click();

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
  }

  if (!skipOrganizationCreation) {
    // Create organization
    await page.getByRole("button", { name: "Create Organization" }).click();
  }

  return {
    email,
    firstName,
    lastName,
    password,
  };
}
