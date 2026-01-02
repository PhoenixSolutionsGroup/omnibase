// Configure auth proxy URL from API URL
// This module must be imported before any @ory/* imports

const apiUrl = process.env.NEXT_PUBLIC_OMNIBASE_API_URL?.replace(/\/$/, "");

if (!apiUrl) {
  throw new Error(
    "NEXT_PUBLIC_OMNIBASE_API_URL must be set in environment variables. " +
      "This is required for OmniBase authentication to work."
  );
}

if (!process.env.NEXT_PUBLIC_ORY_SDK_URL) {
  process.env.NEXT_PUBLIC_ORY_SDK_URL = `${apiUrl}/api/v1/auth/proxy`;
}
