// deps

    // natives
    const { join } = require("node:path");
    const { strictEqual, rejects } = require("node:assert");

    // locals
    const { createSpawnMock } = require("./utils/spawnMock");
    const VLCModule = require(join(__dirname, "..", "lib", "cjs", "utils", "VLC.js"));
    const VLC = VLCModule.default;
    const { PLAY_FLAGS, QUIT_MRL } = VLCModule;

// tests

describe("VLC", () => {

    it("should probe availability with headless flags", async () => {

        const spawn = createSpawnMock();
        const vlc = new VLC({
            "binary": process.execPath,
            "spawn": spawn
        });

        strictEqual(await vlc.isAvailable(), true);
        strictEqual(spawn.calls.length, 1);
        strictEqual(spawn.calls[0].args.includes(QUIT_MRL), true);

    });

    it("should return false when availability probe fails", async () => {

        const spawn = createSpawnMock({
            "exitCode": 1,
            "stderr": "probe failed"
        });

        const vlc = new VLC({
            "binary": process.execPath,
            "spawn": spawn
        });

        strictEqual(await vlc.isAvailable(), false);

    });

    it("should play a sound with headless flags", async () => {

        const spawn = createSpawnMock();
        const vlc = new VLC({
            "binary": process.execPath,
            "spawn": spawn
        });

        await vlc.play("C:\\sounds\\alert.mp3");

        strictEqual(spawn.calls.length, 1);
        strictEqual(spawn.calls[0].cmd, process.execPath);

        PLAY_FLAGS.forEach((flag) => {
            strictEqual(spawn.calls[0].args.includes(flag), true);
        });

        strictEqual(spawn.calls[0].args.includes("C:\\sounds\\alert.mp3"), true);
        strictEqual(spawn.calls[0].args[spawn.calls[0].args.length - 1], QUIT_MRL);

    });

    it("should reject when the binary is missing", async () => {

        const spawn = createSpawnMock();
        const vlc = new VLC({
            "binary": "/missing/vlc",
            "env": {
                "PATH": ""
            },
            "platform": "linux",
            "spawn": spawn
        });

        await rejects(() => {
            return vlc.play("sound.mp3");
        }, /VLC binary not found/);

    });

    it("should reject spawn ENOENT errors", async () => {

        const error = new Error("spawn ENOENT");
        error.code = "ENOENT";

        const spawn = createSpawnMock({
            "error": error
        });

        const vlc = new VLC({
            "binary": process.execPath,
            "spawn": spawn
        });

        await rejects(() => {
            return vlc.play("sound.mp3");
        }, /VLC binary not found/);

    });

    it("should reject non-zero exit codes", async () => {

        const spawn = createSpawnMock({
            "exitCode": 2,
            "stderr": "playback failed"
        });

        const vlc = new VLC({
            "binary": process.execPath,
            "spawn": spawn
        });

        await rejects(() => {
            return vlc.play("sound.mp3");
        }, /playback failed/);

    });

    it("should log debug messages when configured", async () => {

        const logs = [];
        const spawn = createSpawnMock();

        const vlc = new VLC({
            "binary": process.execPath,
            "spawn": spawn,
            "debug": (message) => {
                logs.push(message);
            }
        });

        await vlc.play("sound.mp3");

        strictEqual(logs.length, 1);
        strictEqual(logs[0].includes(process.execPath), true);

    });

});
