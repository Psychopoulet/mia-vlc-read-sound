// deps

    // natives
    const { join } = require("node:path");
    const { deepStrictEqual, strictEqual, rejects } = require("node:assert");

    // locals
    const { createSpawnMock } = require("./utils/spawnMock");
    const VLC = require(join(__dirname, "..", "lib", "src", "utils", "VLC.ts")).default;
    const playFlagsFor = require(join(__dirname, "..", "lib", "src", "utils", "playFlagsFor.ts")).default;

// consts

    const QUIT_MRL = "vlc://quit";

// tests

describe("VLC", () => {

    it("should report available when the binary exists without spawning", async () => {

        const spawn = createSpawnMock();
        const vlc = new VLC({
            "binary": process.execPath,
            "spawn": spawn
        });

        strictEqual(await vlc.isAvailable(), true);
        strictEqual(spawn.calls.length, 0);
        strictEqual(await vlc.isAvailable(), true);
        strictEqual(spawn.calls.length, 0);

    });

    it("should return false when the binary is missing", async () => {

        const spawn = createSpawnMock();
        const vlc = new VLC({
            "binary": "/missing/vlc",
            "env": {
                "PATH": ""
            },
            "platform": "linux",
            "spawn": spawn
        });

        strictEqual(await vlc.isAvailable(), false);
        strictEqual(spawn.calls.length, 0);

    });

    it("should use VLC_PATH when no binary hint is given", async () => {

        const spawn = createSpawnMock();
        const vlc = new VLC({
            "env": {
                "PATH": "",
                "VLC_PATH": process.execPath
            },
            "platform": "linux",
            "spawn": spawn
        });

        strictEqual(await vlc.isAvailable(), true);
        strictEqual(spawn.calls.length, 0);

    });

});

describe("VLC play", () => {

    it("should spawn with linux play flags", async () => {

        const spawn = createSpawnMock();
        const vlc = new VLC({
            "binary": process.execPath,
            "platform": "linux",
            "spawn": spawn
        });

        await vlc.play("sound.mp3");

        strictEqual(spawn.calls.length, 1);
        strictEqual(spawn.calls[0].cmd, process.execPath);
        deepStrictEqual(spawn.calls[0].args, [
            ...playFlagsFor("linux"),
            "sound.mp3",
            QUIT_MRL
        ]);

    });

    it("should spawn with windows play flags", async () => {

        const spawn = createSpawnMock();
        const vlc = new VLC({
            "binary": process.execPath,
            "platform": "win32",
            "spawn": spawn
        });

        await vlc.play("C:\\sounds\\alert.mp3");

        deepStrictEqual(spawn.calls[0].args, [
            ...playFlagsFor("win32"),
            "C:\\sounds\\alert.mp3",
            QUIT_MRL
        ]);

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
        strictEqual(logs[0].includes("sound.mp3"), true);

    });

});

describe("VLC play errors", () => {

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

});
