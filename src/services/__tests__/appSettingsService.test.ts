import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

let getHackedMode: any;
let setHackedMode: any;
let supabase: any;

const originalConsoleError = console.error;
beforeAll(() => {
  console.error = vi.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});

describe("appSettingsService", () => {
  beforeAll(async () => {
    vi.doMock("@/lib/supabase", () => ({
      supabase: {
        from: vi.fn(),
      },
    }));

    const module = await import("@/services/appSettingsService");
    getHackedMode = module.getHackedMode;
    setHackedMode = module.setHackedMode;

    const supabaseModule = await import("@/lib/supabase");
    supabase = supabaseModule.supabase;
  });

  afterAll(() => {
    vi.doUnmock("@/lib/supabase");
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getHackedMode", () => {
    it("returns true when DB value is 'true'", async () => {
      vi.mocked(supabase).from = vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => ({
              data: { value: "true" },
              error: null,
            })),
          })),
        })),
      })) as any;

      const result = await getHackedMode();
      expect(result).toBe(true);
    });

    it("returns false when DB value is 'false'", async () => {
      vi.mocked(supabase).from = vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => ({
              data: { value: "false" },
              error: null,
            })),
          })),
        })),
      })) as any;

      const result = await getHackedMode();
      expect(result).toBe(false);
    });

    it("returns false on DB error (graceful degradation)", async () => {
      vi.mocked(supabase).from = vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => ({
              data: null,
              error: { message: "connection refused" },
            })),
          })),
        })),
      })) as any;

      const result = await getHackedMode();
      expect(result).toBe(false);
    });
  });

  describe("setHackedMode", () => {
    it("resolves without throwing when DB update succeeds", async () => {
      vi.mocked(supabase).from = vi.fn(() => ({
        update: vi.fn(() => ({
          eq: vi.fn(() => ({
            error: null,
          })),
        })),
      })) as any;

      await expect(setHackedMode(true)).resolves.toBeUndefined();
    });

    it("resolves when setting value to false", async () => {
      vi.mocked(supabase).from = vi.fn(() => ({
        update: vi.fn(() => ({
          eq: vi.fn(() => ({
            error: null,
          })),
        })),
      })) as any;

      await expect(setHackedMode(false)).resolves.toBeUndefined();
    });

    it("throws when DB update returns an error", async () => {
      vi.mocked(supabase).from = vi.fn(() => ({
        update: vi.fn(() => ({
          eq: vi.fn(() => ({
            error: { message: "update failed" },
          })),
        })),
      })) as any;

      await expect(setHackedMode(true)).rejects.toThrow("update failed");
    });
  });
});
