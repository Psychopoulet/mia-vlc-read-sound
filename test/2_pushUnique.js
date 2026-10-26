// deps

    // natives
    const { join } = require("node:path");
    const { deepStrictEqual } = require("node:assert");

    // locals
    const pushUnique = require(join(__dirname, "..", "lib", "src", "utils", "pushUnique.ts")).default;

// tests

describe("pushUnique", () => {

    it("should push a new value", () => {

        const candidates = [];

        pushUnique(candidates, "vlc");

        deepStrictEqual(candidates, [ "vlc" ]);

    });

    it("should ignore a missing value", () => {

        const candidates = [];

        pushUnique(candidates);

        deepStrictEqual(candidates, []);

    });

    it("should ignore an empty string", () => {

        const candidates = [ "vlc" ];

        pushUnique(candidates, "");

        deepStrictEqual(candidates, [ "vlc" ]);

    });

    it("should ignore a duplicate value", () => {

        const candidates = [ "vlc" ];

        pushUnique(candidates, "vlc");

        deepStrictEqual(candidates, [ "vlc" ]);

    });

});
