// deps

    // natives
    const { join } = require("node:path");
    const { strictEqual } = require("node:assert");

    // locals
    const looksLikeFilePath = require(join(__dirname, "..", "lib", "src", "utils", "looksLikeFilePath.ts")).default;

// tests

describe("looksLikeFilePath", () => {

    it("should detect an absolute unix path", () => {

        strictEqual(looksLikeFilePath("/usr/bin/vlc"), true);

    });

    it("should detect a windows path with backslashes", () => {

        strictEqual(looksLikeFilePath("C:\\Program Files\\VideoLAN\\VLC\\vlc.exe"), true);

    });

    it("should detect a relative path with a slash", () => {

        strictEqual(looksLikeFilePath("./vlc"), true);

    });

    it("should reject a bare command name", () => {

        strictEqual(looksLikeFilePath("vlc"), false);
        strictEqual(looksLikeFilePath("cvlc"), false);
        strictEqual(looksLikeFilePath("vlc.exe"), false);

    });

});
