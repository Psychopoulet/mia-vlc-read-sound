// deps

    // natives
    const { strictEqual } = require("node:assert");
    const { join } = require("node:path");

    // locals
    const main = require(join(__dirname, "..", "lib", "src", "main.cts"));
    const Orchestrator = require(join(__dirname, "..", "lib", "src", "Orchestrator.ts")).default;
    const descriptor = require(join(__dirname, "..", "lib", "src", "Descriptor.ts"));

// tests

describe("orchestrator", () => {

    it("should export the orchestrator", () => {

        strictEqual(main, Orchestrator, "main export is not the orchestrator");
        strictEqual(typeof descriptor, "object", "descriptor types must load");

    });

    it("should register a sound reader and play through the mediator", async () => {

        const values = {};
        const container = {
            "set": (key, value) => {

                values[key] = value;

            }
        };
        const orchestrator = new Orchestrator({
            "externalResourcesDirectory": ""
        });
        let played = "";

        orchestrator._Mediator = {
            "checkParameters": () => {
                return Promise.resolve();
            },
            "readSound": (_url, body) => {

                played = body.sound;

                return Promise.resolve();

            }
        };

        await orchestrator._initWorkSpace(container);
        await values["sound-reader"]("beep.mp3");

        strictEqual(played, "beep.mp3");

    });

});
