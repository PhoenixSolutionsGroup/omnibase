import { fileOperations } from "./01-file-operations";

export async function StorageTests() {
  await fileOperations();
}

export default StorageTests;
