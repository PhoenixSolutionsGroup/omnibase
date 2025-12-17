import * as fs from "fs";
import * as path from "path";
import * as os from "os";

export interface Profile {
  tenant_id: string;
  tenant_name: string;
  key_name: string;
  key_prefix: string;
  api_key: string;
  managed_hosting_url: string;
}

export interface CredentialsConfig {
  profiles: { [name: string]: Profile };
  active_profile: string;
}

export function getCredentialsPath(): string {
  const homeDir = os.homedir();
  return path.join(homeDir, ".omnibase", "credentials.json");
}

export function loadCredentials(): CredentialsConfig {
  const credentialsPath = getCredentialsPath();
  if (!fs.existsSync(credentialsPath)) {
    return { profiles: {}, active_profile: "" };
  }

  try {
    const content = fs.readFileSync(credentialsPath, "utf8");
    return JSON.parse(content);
  } catch (error) {
    return { profiles: {}, active_profile: "" };
  }
}

export function saveCredentials(config: CredentialsConfig): void {
  const credentialsPath = getCredentialsPath();
  const credentialsDir = path.dirname(credentialsPath);

  if (!fs.existsSync(credentialsDir)) {
    fs.mkdirSync(credentialsDir, { recursive: true });
  }

  fs.writeFileSync(credentialsPath, JSON.stringify(config, null, 2), {
    mode: 0o600, // Read/write only for owner
  });
}

export function getActiveProfile(): Profile | null {
  const config = loadCredentials();
  if (!config.active_profile || !config.profiles[config.active_profile]) {
    return null;
  }
  return config.profiles[config.active_profile];
}
