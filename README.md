# mia-vlc-read-sound

Lire un son via VLC — plugin pour MIA.

## Badges

[![Lines of Code](https://sonarcloud.io/api/project_badges/measure?project=Psychopoulet_mia-vlc-read-sound&metric=ncloc)](https://sonarcloud.io/summary/new_code?id=Psychopoulet_mia-vlc-read-sound)
[![Issues](https://img.shields.io/github/issues/Psychopoulet/mia-vlc-read-sound.svg)](https://github.com/Psychopoulet/mia-vlc-read-sound/issues)
[![Pull requests](https://img.shields.io/github/issues-pr/Psychopoulet/mia-vlc-read-sound.svg)](https://github.com/Psychopoulet/mia-vlc-read-sound/pulls)

[![Reliability Rating](https://sonarcloud.io/api/project_badges/measure?project=Psychopoulet_mia-vlc-read-sound&metric=reliability_rating)](https://sonarcloud.io/summary/new_code?id=Psychopoulet_mia-vlc-read-sound)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=Psychopoulet_mia-vlc-read-sound&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=Psychopoulet_mia-vlc-read-sound)
[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=Psychopoulet_mia-vlc-read-sound&metric=sqale_rating)](https://sonarcloud.io/summary/new_code?id=Psychopoulet_mia-vlc-read-sound)
[![Vulnerabilities](https://sonarcloud.io/api/project_badges/measure?project=Psychopoulet_mia-vlc-read-sound&metric=vulnerabilities)](https://sonarcloud.io/summary/new_code?id=Psychopoulet_mia-vlc-read-sound)
[![Bugs](https://sonarcloud.io/api/project_badges/measure?project=Psychopoulet_mia-vlc-read-sound&metric=bugs)](https://sonarcloud.io/summary/new_code?id=Psychopoulet_mia-vlc-read-sound)

[![Known Vulnerabilities](https://snyk.io/test/github/Psychopoulet/mia-vlc-read-sound/badge.svg)](https://snyk.io/test/github/Psychopoulet/mia-vlc-read-sound)

## OpenAPI

[API Descriptor](./lib/data/Descriptor.json)

## Purpose

Play a sound on the MIA box through VLC, without opening a player window. Playback runs in the background and stops when the sound ends.

Use the plugin screen to test a file path or media URL. Other enabled plugins on the box can also request a sound to be played through this plugin.

## Prerequisites

- **VLC** must be installed on the host running MIA.
- If VLC is not on the system PATH, set the **`VLC_PATH`** environment variable to the VLC executable (for example `C:\Program Files\VideoLAN\VLC\vlc.exe` on Windows).

## How to play a sound

1. Open the plugin from the MIA menu (you must be signed in).
2. Wait until the plugin is initialized.
3. Enter a **local file path** or a **media URL** (for example `C:\sounds\alert.mp3`, `file:///…`, `http://…`).
4. Click **Play sound**. The button stays disabled until playback finishes.
5. On success, a confirmation message appears. On failure, an error dialog shows what went wrong.

Supported values are the same as for VLC itself: local paths and standard media URLs.
