// deps

    // natives
    const { join } = require("node:path");
    const { readFile } = require("node:fs/promises");

    // externals
    const Container = require("node-containerpattern");

    // locals
    const Mediator = require(join(__dirname, "..", "..", "lib", "cjs", "Mediator.js")).default;

// consts

    const RESOURCES_DIR = join(__dirname, "..", "..");

// module

function createMockVlc ({ available = true, playError = null } = {}) {

    return {
        "isAvailable": () => {
            return Promise.resolve(available);
        },
        "play": (sound) => {

            if (null !== playError) {
                return Promise.reject(playError);
            }

            return Promise.resolve(sound);

        }
    };

}

async function loadDescriptor () {

    return JSON.parse(await readFile(join(RESOURCES_DIR, "lib", "data", "Descriptor.json"), "utf-8"));

}

async function createMediator (descriptor, { container = null, init = true, vlc = null } = {}) {

    const instanceContainer = container ?? new Container();

    if (null !== vlc) {
        instanceContainer.set("vlc", vlc);
    }

    const mediator = new Mediator({
        "externalResourcesDirectory": RESOURCES_DIR,
        "descriptor": descriptor
    });

    if (init) {
        await mediator.init(instanceContainer);
    }

    return mediator;

}

module.exports = {
    createMockVlc,
    createMediator,
    loadDescriptor
};
