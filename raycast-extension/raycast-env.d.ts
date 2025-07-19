/// <reference types="@raycast/api">

/* 🚧 🚧 🚧
 * This file is auto-generated from the extension's manifest.
 * Do not modify manually. Instead, update the `package.json` file.
 * 🚧 🚧 🚧 */

/* eslint-disable @typescript-eslint/ban-types */

type ExtensionPreferences = {}

/** Preferences accessible in all the extension's commands */
declare type Preferences = ExtensionPreferences

declare namespace Preferences {
  /** Preferences accessible in the `save-url` command */
  export type SaveUrl = ExtensionPreferences & {}
  /** Preferences accessible in the `quick-note` command */
  export type QuickNote = ExtensionPreferences & {}
  /** Preferences accessible in the `save-clipboard` command */
  export type SaveClipboard = ExtensionPreferences & {}
}

declare namespace Arguments {
  /** Arguments passed to the `save-url` command */
  export type SaveUrl = {}
  /** Arguments passed to the `quick-note` command */
  export type QuickNote = {}
  /** Arguments passed to the `save-clipboard` command */
  export type SaveClipboard = {}
}

