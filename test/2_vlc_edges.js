// deps

    // natives
    const { EventEmitter } = require("node:events");
    const { mkdtemp, rm } = require("node:fs/promises");
    const { tmpdir } = require("node:os");
    const { delimiter, join } = require("node:path");
    const { rejects, strictEqual } = require("node:assert");

    // locals
    const { createSpawnMock } = require("./utils/spawnMock");
    const VLC = require(join(__dirname, "..", "lib", "src", "utils", "VLC.ts")).default;

// consts

    const QUIT_MRL = "vlc://quit";

function _childSpawn (setup) {

    function spawn () {

        const child = new EventEmitter();

        setup(child);

        return child;

    }

    return spawn;

}

// tests

describe("VLC binary lookup edges", () => {

    let root = "";

    before(async () => {

        root = await mkdtemp(join(tmpdir(), "mia-vlc-"));

    });

    after(async () => {

        await rm(root, {
            "force": true,
            "recursive": true
        });

    });

    it("should report available on darwin when the hinted binary exists", async () => {

        const spawn = createSpawnMock();
        const vlc = new VLC({
            "binary": process.execPath,
            "env": {
                "PATH": ""
            },
            "platform": "darwin",
            "spawn": spawn
        });

        strictEqual(await vlc.isAvailable(), true);
        strictEqual(spawn.calls.length, 0);

    });

    it("should build default windows locations when ProgramFiles is unset", async () => {

        const spawn = createSpawnMock();
        const vlc = new VLC({
            "binary": process.execPath,
            "env": {
                "PATH": ""
            },
            "platform": "win32",
            "spawn": spawn
        });

        strictEqual(await vlc.isAvailable(), true);
        strictEqual(spawn.calls.length, 0);

    });

    it("should search PATH and expand windows executable names", async () => {

        const spawn = createSpawnMock();
        const vlc = new VLC({
            "env": {
                "PATH": delimiter + root,
                "PATHEXT": ".EXE;;.COM",
                "ProgramFiles": root,
                "ProgramFiles(x86)": root
            },
            "platform": "win32",
            "spawn": spawn
        });

        strictEqual(await vlc.isAvailable(), false);
        strictEqual(spawn.calls.length, 0);

    });

    it("should search Path when PATH is absent", async () => {

        const spawn = createSpawnMock();
        const vlc = new VLC({
            "env": {
                "Path": root
            },
            "platform": "linux",
            "spawn": spawn
        });

        strictEqual(await vlc.isAvailable(), false);
        strictEqual(spawn.calls.length, 0);

    });

    it("should search an empty path when no path variable is set", async () => {

        const spawn = createSpawnMock();
        const vlc = new VLC({
            "env": {},
            "platform": "linux",
            "spawn": spawn
        });

        strictEqual(await vlc.isAvailable(), false);
        strictEqual(spawn.calls.length, 0);

    });

});

describe("VLC play edges", () => {

    it("should reuse a resolved binary", async () => {

        const spawn = createSpawnMock();
        const vlc = new VLC({
            "binary": process.execPath,
            "platform": "linux",
            "spawn": spawn
        });

        await vlc.play("one.mp3");
        await vlc.play("two.mp3");

        strictEqual(spawn.calls.length, 2);
        strictEqual(spawn.calls[1].args[spawn.calls[1].args.length - 1], QUIT_MRL);

    });

    it("should use process defaults when options are omitted", async () => {

        const vlc = new VLC();

        strictEqual("boolean" === typeof await vlc.isAvailable(), true);

    }).timeout(20000);

    it("should read stdout from a successful play", async () => {

        const spawn = createSpawnMock({
            "stdout": "played"
        });
        const vlc = new VLC({
            "binary": process.execPath,
            "spawn": spawn
        });

        await vlc.play("sound.mp3");

        strictEqual(spawn.calls.length, 1);

    });

    it("should reject with stdout when stderr is empty", async () => {

        const spawn = createSpawnMock({
            "exitCode": 4,
            "stdout": "from-stdout"
        });
        const vlc = new VLC({
            "binary": process.execPath,
            "spawn": spawn
        });

        await rejects(() => {
            return vlc.play("sound.mp3");
        }, /from-stdout/);

    });

    it("should reject with a fallback message when output is empty", async () => {

        const spawn = createSpawnMock({
            "exitCode": 3
        });
        const vlc = new VLC({
            "binary": process.execPath,
            "spawn": spawn
        });

        await rejects(() => {
            return vlc.play("sound.mp3");
        }, /VLC exited with code 3/);

    });

    it("should ignore a close that follows a spawn error", async () => {

        const spawn = _childSpawn((child) => {

            child.stdout = new EventEmitter();

            process.nextTick(() => {

                const error = new Error("spawn EACCES");

                error.code = "EACCES";
                child.emit("error", error);
                child.emit("close", 1);

            });

        });
        const vlc = new VLC({
            "binary": process.execPath,
            "spawn": spawn
        });

        await rejects(() => {
            return vlc.play("sound.mp3");
        }, /spawn EACCES/);

    });

    it("should ignore a late spawn error after a successful close", async () => {

        const spawn = _childSpawn((child) => {

            child.stdout = new EventEmitter();
            child.stderr = new EventEmitter();

            process.nextTick(() => {

                child.emit("close", 0);
                child.emit("error", new Error("late"));

            });

        });
        const vlc = new VLC({
            "binary": process.execPath,
            "spawn": spawn
        });

        await vlc.play("sound.mp3");

    });

    it("should resolve when the child has no stdout stream", async () => {

        const spawn = _childSpawn((child) => {

            child.stderr = new EventEmitter();

            process.nextTick(() => {

                child.emit("close", 0);

            });

        });
        const vlc = new VLC({
            "binary": process.execPath,
            "spawn": spawn
        });

        await vlc.play("sound.mp3");

    });

});
