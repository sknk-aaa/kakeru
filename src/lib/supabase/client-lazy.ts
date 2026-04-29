export async function createBrowserSupabaseClient() {
  const { createClient } = await import("./client");
  return createClient();
}
