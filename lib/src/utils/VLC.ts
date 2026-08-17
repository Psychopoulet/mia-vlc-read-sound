// deps

    // natives
    import { spawn, type ChildProcess, type SpawnOptions } from "node:child_process";
    import { access, constants } from "node:fs/promises";
    import { delimiter, extname, isAbsolute, join } from "node:path";

// types & interfaces

    export interface iVLCOptions {
        "binary"?: string;
        "debug"?: (message: string) => void;
        "env"?: NodeJS.ProcessEnv;
        "platform"?: NodeJS.Platform;
        "spawn"?: typeof spawn;
    }

// consts

    export const PLAY_FLAGS: string[] = [
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

    export const QUIT_MRL: string = "vlc://quit";

    const SPAWN_OPTIONS: SpawnOptions = {
        "windowsHide": true,
        "stdio": [
            "ignore",
            "pipe",
            "pipe"
        ]
    };

    const PROBE_SPAWN_OPTIONS: SpawnOptions = {
        "windowsHide": true,
        "stdio": "ignore"
    };

// private

    function _defaultEnv (): NodeJS.ProcessEnv {

        return process.env; // eslint-disable-line n/no-process-env

    }

    function _pushUnique (candidates: string[], value: string | undefined): void {

        if ("string" === typeof value && "" !== value && !candidates.includes(value)) {
            candidates.push(value);
        }

    }

    function _looksLikeFilePath (candidate: string): boolean {

        return isAbsolute(candidate) || candidate.includes("/") || candidate.includes("\\");

    }

    function _fileExists (file: string): Promise<boolean> {

        return access(file, constants.F_OK).then((): boolean => {
            return true;
        }).catch((): boolean => {
            return false;
        });

    }

    function _firstExisting (files: string[]): Promise<string | null> {

        if (0 === files.length) {
            return Promise.resolve(null);
        }

        const file: string = files[0];

        return _fileExists(file).then((exists: boolean): Promise<string | null> => {

            return exists ? Promise.resolve(file) : _firstExisting(files.slice(1));

        });

    }

// module

export default class VLC {

    // attributes

        private readonly _binaryHint: string | undefined;
        private readonly _debug: ((message: string) => void) | undefined;
        private readonly _env: NodeJS.ProcessEnv;
        private readonly _platform: NodeJS.Platform;
        private readonly _spawn: typeof spawn;

        private _binary: string | null;
        private _available: boolean | null;

    // constructor

    public constructor (options: iVLCOptions = {}) {

        this._binaryHint = options.binary;
        this._debug = options.debug;
        this._env = options.env ?? _defaultEnv();
        this._platform = options.platform ?? process.platform;
        this._spawn = options.spawn ?? spawn;

        this._binary = null;
        this._available = null;

    }

    // public

    public isAvailable (): Promise<boolean> {

        if (null !== this._available) {
            return Promise.resolve(this._available);
        }

        return this._resolveBinary().then((binary: string): Promise<boolean> => {
            return this._probe(binary);
        }).then((available: boolean): boolean => {

            this._available = available;

            return available;

        }).catch((): boolean => {

            this._available = false;

            return false;

        });

    }

    public play (sound: string): Promise<void> {

        return this._resolveBinary().then((binary: string): Promise<void> => {

            return this._execute(binary, [
                ...PLAY_FLAGS,
                sound,
                QUIT_MRL
            ]).then((): Promise<void> => {
                return Promise.resolve();
            });

        });

    }

    // private

    private _probe (binary: string): Promise<boolean> {

        return new Promise((resolve: (available: boolean) => void, reject: (err: Error) => void): void => {

            const args: string[] = [
                ...PLAY_FLAGS,
                QUIT_MRL
            ];

            if ("function" === typeof this._debug) {
                this._debug(binary + " " + args.join(" "));
            }

            let exited: boolean = false;

            const child: ChildProcess = this._spawn(binary, args, PROBE_SPAWN_OPTIONS);

            child.once("error", (err: NodeJS.ErrnoException): void => {

                if (!exited) {

                    exited = true;

                    if ("ENOENT" === err.code) {
                        reject(new Error("VLC binary not found: " + binary));
                    }
                    else {
                        reject(err);
                    }

                }

            });

            child.on("close", (code: number | null): void => {

                if (!exited) {

                    exited = true;
                    resolve(0 === code);

                }

            });

        });

    }

    private _resolveBinary (): Promise<string> {

        if ("string" === typeof this._binary) {
            return Promise.resolve(this._binary);
        }

        return this._firstLocated(this._candidatePaths()).then((binary: string | null): string => {

            if ("string" !== typeof binary) {
                throw new Error("VLC binary not found");
            }

            this._binary = binary;

            return binary;

        });

    }

    private _candidatePaths (): string[] {

        const candidates: string[] = [];

        _pushUnique(candidates, this._binaryHint);
        _pushUnique(candidates, this._env.VLC_PATH);

        this._platformDefaults().forEach((value: string): void => {
            _pushUnique(candidates, value);
        });

        return candidates;

    }

    private _platformDefaults (): string[] {

        if ("win32" === this._platform) {
            return this._windowsDefaults();
        }

        if ("darwin" === this._platform) {

            return [
                "/Applications/VLC.app/Contents/MacOS/VLC",
                "cvlc",
                "vlc"
            ];

        }

        return [
            "cvlc",
            "vlc"
        ];

    }

    private _windowsDefaults (): string[] {

        return [
            join(this._env.ProgramFiles ?? "C:\\Program Files", "VideoLAN", "VLC", "vlc.exe"),
            join(this._env["ProgramFiles(x86)"] ?? "C:\\Program Files (x86)", "VideoLAN", "VLC", "vlc.exe"),
            "vlc.exe",
            "vlc"
        ];

    }

    private _firstLocated (candidates: string[]): Promise<string | null> {

        if (0 === candidates.length) {
            return Promise.resolve(null);
        }

        return this._locateCandidate(candidates[0]).then((located: string | null): Promise<string | null> => {

            return "string" === typeof located ? Promise.resolve(located) : this._firstLocated(candidates.slice(1));

        });

    }

    private _locateCandidate (candidate: string): Promise<string | null> {

        if (_looksLikeFilePath(candidate)) {

            return _fileExists(candidate).then((exists: boolean): string | null => {
                return exists ? candidate : null;
            });

        }

        return this._locateOnPath(candidate);

    }

    private _locateOnPath (name: string): Promise<string | null> {

        const dirs: string[] = (this._env.PATH ?? this._env.Path ?? "").split(delimiter).filter((dir: string): boolean => {
            return "" !== dir;
        });

        const names: string[] = this._executableNames(name);
        const files: string[] = [];

        dirs.forEach((dir: string): void => {

            names.forEach((fileName: string): void => {
                files.push(join(dir, fileName));
            });

        });

        return _firstExisting(files);

    }

    private _executableNames (name: string): string[] {

        if ("win32" !== this._platform || "" !== extname(name)) {
            return [ name ];
        }

        const extensions: string[] = (this._env.PATHEXT ?? ".EXE;.CMD;.BAT").split(";").filter((ext: string): boolean => {
            return "" !== ext;
        });

        return [
            name,
            ...extensions.map((ext: string): string => {
                return name + ext;
            })
        ];

    }

    private _execute (binary: string, args: string[]): Promise<string> {

        return new Promise((resolve: (stdout: string) => void, reject: (err: Error) => void): void => {

            if ("function" === typeof this._debug) {
                this._debug(binary + " " + args.join(" "));
            }

            let exited: boolean = false;

            const child: ChildProcess = this._spawn(binary, args, SPAWN_OPTIONS);

            child.once("error", (err: NodeJS.ErrnoException): void => {

                if (!exited) {

                    exited = true;

                    if ("ENOENT" === err.code) {
                        reject(new Error("VLC binary not found: " + binary));
                    }
                    else {
                        reject(err);
                    }

                }

            });

            let stdout: string = "";
            let stderr: string = "";

            child.stdout?.on("data", (chunk: Buffer): void => {
                stdout += chunk.toString("utf-8");
            });

            child.stderr?.on("data", (chunk: Buffer): void => {
                stderr += chunk.toString("utf-8");
            });

            child.on("close", (code: number | null): void => {

                if (!exited) {

                    exited = true;

                    if (0 !== code) {
                        reject(new Error(stderr || stdout || "VLC exited with code " + String(code)));
                    }
                    else {
                        resolve(stdout);
                    }

                }

            });

        });

    }

}
