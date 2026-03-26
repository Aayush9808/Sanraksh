/**
 * Smoke tests: verify all page modules can be imported without throwing.
 * Catches broken imports, missing dependencies, and syntax errors at CI time.
 */

describe("Page module imports", () => {
  it("imports landing page", async () => {
    const mod = await import("../app/page");
    expect(mod.default).toBeDefined();
  });

  it("imports login page", async () => {
    const mod = await import("../app/login/page");
    expect(mod.default).toBeDefined();
  });

  it("imports register page", async () => {
    const mod = await import("../app/register/page");
    expect(mod.default).toBeDefined();
  });

  it("imports dashboard layout", async () => {
    const mod = await import("../app/dashboard/layout");
    expect(mod.default).toBeDefined();
  });

  it("imports loading boundary", async () => {
    const mod = await import("../app/dashboard/loading");
    expect(mod.default).toBeDefined();
  });

  it("imports error boundary", async () => {
    const mod = await import("../app/dashboard/error");
    expect(mod.default).toBeDefined();
  });
});

describe("Shared component imports", () => {
  it("imports OrbitalDock", async () => {
    const mod = await import("../components/ui/OrbitalDock");
    expect(mod.default).toBeDefined();
  });

  it("imports CommandPalette", async () => {
    const mod = await import("../components/ui/CommandPalette");
    expect(mod.default).toBeDefined();
  });

  it("imports BentoCard", async () => {
    const mod = await import("../components/ui/BentoCard");
    expect(mod.default).toBeDefined();
  });
});
