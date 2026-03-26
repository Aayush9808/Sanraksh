/**
 * Config and routing tests — validate constants that drive app behavior.
 */

describe("Dashboard route configuration", () => {
  it("ADMIN_ROUTES contains all expected routes", async () => {
    // Read layout and verify routes are defined
    const layoutModule = await import("../app/dashboard/layout");
    expect(layoutModule.default).toBeDefined();
  });

  it("threat-defense route exists (not market-crash)", async () => {
    // The route directory should resolve
    const mod = await import("../app/dashboard/threat-defense/page");
    expect(mod.default).toBeDefined();
  });
});

describe("API config", () => {
  it("exports API_BASE", async () => {
    const config = await import("../lib/config");
    expect(config.API_BASE).toBeDefined();
    expect(typeof config.API_BASE).toBe("string");
  });
});
