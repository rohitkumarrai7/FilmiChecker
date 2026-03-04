import { isValidImdbId, sanitizeImdbId } from "@/lib/validators";

describe("isValidImdbId", () => {
  it("accepts a standard 7-digit IMDb ID", () => {
    expect(isValidImdbId("tt0133093")).toBe(true);
  });

  it("accepts an 8-digit IMDb ID", () => {
    expect(isValidImdbId("tt99999999")).toBe(true);
  });

  it("rejects a too-short IMDb ID", () => {
    expect(isValidImdbId("tt12")).toBe(false);
  });

  it("rejects an empty string", () => {
    expect(isValidImdbId("")).toBe(false);
  });

  it("rejects an ID missing the tt prefix", () => {
    expect(isValidImdbId("0133093")).toBe(false);
  });

  it("rejects an ID with letters in the digit section", () => {
    expect(isValidImdbId("tt013309x")).toBe(false);
  });

  it("rejects a 9-digit IMDb ID (too long)", () => {
    expect(isValidImdbId("tt123456789")).toBe(false);
  });
});

describe("sanitizeImdbId", () => {
  it("trims surrounding whitespace", () => {
    expect(sanitizeImdbId("  tt0133093  ")).toBe("tt0133093");
  });

  it("converts to lowercase", () => {
    expect(sanitizeImdbId("TT0133093")).toBe("tt0133093");
  });
});
