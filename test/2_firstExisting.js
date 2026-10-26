// deps

    // natives
    const { join } = require("node:path");
    const { strictEqual } = require("node:assert");

    // locals
    const firstExisting = require(join(__dirname, "..", "lib", "src", "utils", "firstExisting.ts")).default;

// consts

    const MISSING_A = join(__dirname, "missing-a");
    const MISSING_B = join(__dirname, "missing-b");

// tests

describe("firstExisting", () => {

    it("should return null for an empty list", async () => {

        strictEqual(await firstExisting([]), null);

    });

    it("should return the first existing file", async () => {

        strictEqual(await firstExisting([ process.execPath ]), process.execPath);

    });

    it("should skip missing files", async () => {

        const found = await firstExisting([
            MISSING_A,
            process.execPath,
            MISSING_B
        ]);

        strictEqual(found, process.execPath);

    });

    it("should skip directories", async () => {

        const found = await firstExisting([
            __dirname,
            process.execPath
        ]);

        strictEqual(found, process.execPath);

    });

    it("should return null when none exist", async () => {

        strictEqual(await firstExisting([ MISSING_A, MISSING_B ]), null);

    });

});
