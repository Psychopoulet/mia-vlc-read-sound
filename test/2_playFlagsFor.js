// deps

    // natives
    const { join } = require("node:path");
    const { deepStrictEqual } = require("node:assert");

    // locals
    const playFlagsFor = require(join(__dirname, "..", "lib", "src", "utils", "playFlagsFor.ts")).default;

// consts

    const LINUX_FLAGS = [
        "--intf",
        "dummy",
        "--no-video",
        "--no-osd",
        "--no-spu",
        "--no-interact",
        "--quiet",
        "--play-and-exit",
        "--no-volume-save",
        "--audio-visual=none"
    ];

    const WINDOWS_FLAGS = [
        "--intf",
        "dummy",
        "--dummy-quiet",
        "--no-video",
        "--no-osd",
        "--no-spu",
        "--no-interact",
        "--quiet",
        "--play-and-exit",
        "--no-volume-save",
        "--audio-visual=none"
    ];

// tests

describe("playFlagsFor", () => {

    it("should return headless flags without dummy-quiet on linux", () => {

        deepStrictEqual(playFlagsFor("linux"), LINUX_FLAGS);

    });

    it("should return the same flags on darwin as on linux", () => {

        deepStrictEqual(playFlagsFor("darwin"), LINUX_FLAGS);

    });

    it("should insert dummy-quiet after dummy on windows", () => {

        deepStrictEqual(playFlagsFor("win32"), WINDOWS_FLAGS);

    });

    it("should not leak dummy-quiet into later linux calls", () => {

        playFlagsFor("win32");

        deepStrictEqual(playFlagsFor("linux"), LINUX_FLAGS);

    });

});
