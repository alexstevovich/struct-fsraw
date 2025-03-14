/* *******************************************************
 * struct-fsraw
 * 
 * @license
 * 
 * Apache-2.0
 * 
 * Copyright 2015-2025 Alex Stevovich
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * 
 * @meta
 *
 * package_name: struct-fsraw
 * file_name: gen/index.cjs
 * purpose: Core functionality and exports combined.
 *  
 * @system
 *
 * generated_on: 2025-03-14T23:28:48.089Z
 * certified_version: 1.0.0
 * file_uuid: 5eb475a8-731e-4363-a052-cefbfd2e23ea
 * file_size: 5854 bytes
 * file_hash: c067008f3f8948730385e07f69ecffd2469e39981bb61691a73a1d7889ab6a6e
 * mast_hash: faa91525f9d26dee32c58ef01ef6cf56ea9e74b789814d7d7ffed582ced92fb4
 * generated_by: preamble on npm!
 *
 * [Preamble Metadata]
********************************************************/ 
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var index_exports = {};
__export(index_exports, {
  default: () => index_default,
  getKeys: () => getKeys,
  structFsRaw: () => structFsRaw
});
module.exports = __toCommonJS(index_exports);
var import_promises = __toESM(require("fs/promises"), 1);
var import_path = __toESM(require("path"), 1);

function getKey(keys, key) {
  return keys?.[key] || key;
}
function getKeys() {
  return {
    path: "p",
    type: "t",
    symlink: "sl",
    symlink_target: "sl_t",
    symlink_resolved: "sl_r",
    children: "c",
    size: "s",
    created_at: "m_c",
    modified_at: "m_m"
  };
}
async function structFsRaw(dir, options = {}, depth = 0) {
  if (!dir) {
    throw new Error("The 'dir' parameter is required.");
  }
  const {
    meta = false,
    size = false,
    recursive = false,
    prune = false,
    keys = {}
    // Custom key mapping object
  } = options;
  const statsPromise = import_promises.default.lstat(dir);
  const dirContentsPromise = depth === 0 || recursive ? import_promises.default.readdir(dir).catch(() => null) : null;
  let stats;
  try {
    stats = await statsPromise;
  } catch (err) {
    console.error(`Error reading file stats: ${dir}`, err);
    return null;
  }
  const symlink = stats.isSymbolicLink();
  const displayPath = import_path.default.resolve(dir);
  const symlinkTargetPromise = symlink ? import_promises.default.realpath(dir).catch(() => null) : Promise.resolve(null);
  const fileObject = {
    [getKey(keys, "path")]: displayPath,
    [getKey(keys, "type")]: stats.isDirectory() ? "d" : "f",
    [getKey(keys, "symlink")]: symlink
  };
  const symlink_target = await symlinkTargetPromise;
  if (!prune || symlink) {
    fileObject[getKey(keys, "symlink_target")] = symlink_target;
    fileObject[getKey(keys, "symlink_resolved")] = symlink_target ? import_path.default.resolve(symlink_target) : null;
  }
  if (size) {
    fileObject[getKey(keys, "size")] = stats.size;
  }
  if (meta) {
    fileObject[getKey(keys, "created_at")] = stats.birthtime;
    fileObject[getKey(keys, "modified_at")] = stats.mtime;
  }
  if (symlink) {
    return fileObject;
  }
  if (stats.isDirectory()) {
    fileObject[getKey(keys, "children")] = [];
    const dirContents = await dirContentsPromise;
    if (dirContents) {
      fileObject[getKey(keys, "children")] = await Promise.all(
        dirContents.map(async (child) => {
          const childPath = import_path.default.join(dir, child);
          if (recursive) {
            return structFsRaw(childPath, options, depth + 1);
          }
          const childStats = await import_promises.default.lstat(childPath);
          return {
            [getKey(keys, "path")]: import_path.default.resolve(childPath),
            [getKey(keys, "type")]: childStats.isDirectory() ? "d" : "f",
            [getKey(keys, "symlink")]: childStats.isSymbolicLink(),
            [getKey(keys, "children")]: childStats.isDirectory() ? [] : void 0
            // Ensure directories always have empty `children`
          };
        })
      );
    }
  }
  return fileObject;
}
var index_default = structFsRaw;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getKeys,
  structFsRaw
});
