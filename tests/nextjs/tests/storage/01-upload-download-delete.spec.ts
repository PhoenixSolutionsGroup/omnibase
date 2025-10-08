import { test, expect } from "@playwright/test";
import { createUserProfile } from "../helpers/registration";

test("Upload, download, and delete file", async ({ page }) => {
  await createUserProfile(page);

  await page
    .getByRole("link", { name: "📁 Storage Test file upload," })
    .nth(1)
    .click();

  // Create a mock file in memory
  const mockFileContent = JSON.stringify(
    { test: "data", timestamp: Date.now() },
    null,
    2
  );
  const mockFile = {
    name: "test-file.json",
    mimeType: "application/json",
    buffer: Buffer.from(mockFileContent),
  };

  await page.getByRole("button", { name: "Select a file to upload" }).click();
  await page
    .getByRole("button", { name: "Select a file to upload" })
    .setInputFiles(mockFile);
  await page.getByRole("button", { name: "Upload File" }).click();
  await expect(page.getByRole("main")).toContainText(
    "✅ File uploaded successfully!"
  );

  // This is the file path that needs to be used for pasting into download, and deletion (In this case it resolved to 42b5ab3a-06ca-4dea-8191-87b631516ef0/bdf15863-5fa5-4b67-990e-1fa755196796/1759893697-json.html)
  const filePath = await page
    .locator("form")
    .filter({ hasText: "Select a file to uploadUpload" })
    .getByRole("code")
    .textContent();

  await page
    .getByRole("textbox", { name: "File path to download" })
    .fill(filePath || "");
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download File" }).click();
  const download = await downloadPromise;
  await expect(page.getByRole("main")).toContainText(
    "✅ Download URL generated!"
  );
  await page.getByRole("textbox", { name: "File path to delete" }).click();
  await page
    .getByRole("textbox", { name: "File path to delete" })
    .fill(filePath || "");
  await page.getByRole("button", { name: "Delete File" }).click();
  await expect(page.getByRole("main")).toContainText(
    "✅ File deleted successfully!"
  );
});
