// Offline UI fixture only. Intercepts a reserved .invalid hostname, never a real project.
const originalFetch = globalThis.fetch;
globalThis.fetch = async (input, init) => {
  const url = new URL(input instanceof Request ? input.url : String(input));
  if (url.hostname !== "empty-database.invalid")
    return originalFetch(input, init);
  if (
    !url.pathname.startsWith("/rest/v1/") ||
    (init?.method ?? "GET") !== "GET"
  ) {
    throw new Error(
      "The empty database UI fixture supports read-only table requests only.",
    );
  }
  return new Response("[]", {
    headers: { "Content-Type": "application/json" },
  });
};
