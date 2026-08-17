// deps

    // natives
    const { strictEqual, rejects } = require("node:assert");

    // externals
    const Container = require("node-containerpattern");

    // locals
    const { createSpawnMock } = require("./utils/spawnMock");
    const {
        createMockVlc, createMediator, loadDescriptor
    } = require("./utils/mediatorTestHelpers");

// tests

describe("Mediator VLC read sound — init", () => {

    let descriptor = null;

    before(async () => {
        descriptor = await loadDescriptor();
    });

    it("should fail when VLC is unavailable", async () => {

        const container = new Container();
        container.set("vlc", createMockVlc({
            "available": false
        }));

        const mediator = await createMediator(descriptor, {
            "container": container,
            "init": false
        });

        await rejects(() => {
            return mediator.init(container);
        }, /VLC is not available/);

        await mediator.release();

    });

    it("should create VLC with log debug output", async () => {

        const logs = [];
        const spawn = createSpawnMock();
        const container = new Container();

        container.set("log", {
            "debug": (message) => {
                logs.push(message);
            }
        });

        container.set("vlc-options", {
            "binary": process.execPath,
            "spawn": spawn
        });

        const mediator = await createMediator(descriptor, {
            "container": container
        });

        strictEqual(0 < logs.length, true);

        await mediator.release();

    });

});

describe("Mediator VLC read sound — readSound", () => {

    let descriptor = null;
    let mediator = null;
    let playedSound = null;

    before(async () => {
        descriptor = await loadDescriptor();
    });

    beforeEach(async () => {

        playedSound = null;

        mediator = await createMediator(descriptor, {
            "vlc": {
                "isAvailable": () => {
                    return Promise.resolve(true);
                },
                "play": (sound) => {
                    playedSound = sound;
                    return Promise.resolve();
                }
            }
        });

    });

    afterEach(async () => {

        const instance = mediator;
        mediator = null;

        if (null !== instance) {
            await instance.release();
        }

    });

    it("should delegate playback to VLC", async () => {

        await mediator.readSound({}, {
            "sound": "file:///tmp/chime.mp3"
        });

        strictEqual(playedSound, "file:///tmp/chime.mp3");

    });

    it("should reject when VLC is not initialized", async () => {

        const instance = mediator;
        mediator = null;
        await instance.release();

        await rejects(() => {
            return instance.readSound({}, {
                "sound": "sound.mp3"
            });
        }, /VLC is not initialized/);

    });

    it("should propagate playback errors", async () => {

        const failingMediator = await createMediator(descriptor, {
            "vlc": createMockVlc({
                "playError": new Error("playback failed")
            })
        });

        await rejects(() => {
            return failingMediator.readSound({}, {
                "sound": "sound.mp3"
            });
        }, /playback failed/);

        await failingMediator.release();

    });

});

describe("Mediator VLC read sound — front files", () => {

    let descriptor = null;
    let mediator = null;

    before(async () => {
        descriptor = await loadDescriptor();
    });

    beforeEach(async () => {

        mediator = await createMediator(descriptor, {
            "vlc": createMockVlc()
        });

    });

    afterEach(async () => {

        const instance = mediator;
        mediator = null;

        if (null !== instance) {
            await instance.release();
        }

    });

    it("should read front index", async () => {

        const html = await mediator.getFrontIndex();

        strictEqual(typeof html, "string");
        strictEqual(html.includes("mia-vlc-read-sound"), true);
        strictEqual(html.includes("{{plugin.name}}"), false);

    });

    it("should read front app bundle", async () => {

        const js = await mediator.getFrontApp();

        strictEqual(typeof js, "string");
        strictEqual(0 < js.length, true);

    });

    it("should read front app map", async () => {

        const map = await mediator.getFrontAppMap();

        strictEqual(typeof map, "string");
        strictEqual(0 < map.length, true);

    });

});
