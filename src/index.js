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
 * file_name: src/index.js
 * purpose: Core functionality and exports combined.
 *
 * @system
 *
 * generated_on: 2025-03-15T02:26:35.619Z
 * certified_version: 1.0.0
 * file_uuid: 5eb475a8-731e-4363-a052-cefbfd2e23ea
 * file_size: 5114 bytes
 * file_hash: 276048f2fcd32d43f21643335b4499862eea47cf7ae0437c4e8775524830c21d
 * mast_hash: 249f825a123d38329cecb352dadd75bf0bbf20ede1008775768ab08b10c85fef
 * generated_by: preamble on npm!
 *
 * [Preamble Metadata]
 ********************************************************/
import fs from 'fs/promises';
import path from 'path';

// Key mapping function to dynamically get the correct key name
function getKey(keys, key) {
    return keys?.[key] || key; // Use mapped key if available, otherwise use full key
}

export function getKeys() {
    return {
        path: 'p',
        type: 't',
        symlink: 'sl',
        symlink_target: 'sl_t',
        symlink_resolved: 'sl_r',
        children: 'c',
        size: 's',
        created_at: 'm_c',
        modified_at: 'm_m',
    };
}

export async function struct(dir, options = {}, depth = 0) {
    if (!dir) {
        throw new Error("The 'dir' parameter is required.");
    }

    const {
        meta = false,
        size = false,
        recursive = false,
        prune = false,
        keys = {}, // Custom key mapping object
    } = options;

    // **Kick off fs.lstat early**
    const statsPromise = fs.lstat(dir);

    // **Start readdir if at depth 0 or recursive mode is enabled**
    const dirContentsPromise =
        depth === 0 || recursive ? fs.readdir(dir).catch(() => null) : null;

    // **Await file metadata**
    let stats;
    try {
        stats = await statsPromise;
    } catch (err) {
        console.error(`Error reading file stats: ${dir}`, err);

        return null;
    }

    const symlink = stats.isSymbolicLink();
    const displayPath = path.resolve(dir);

    // **Start symlink resolution asynchronously**
    const symlinkTargetPromise = symlink
        ? fs.realpath(dir).catch(() => null)
        : Promise.resolve(null);

    // **Construct file object with dynamic keys**
    const fileObject = {
        [getKey(keys, 'path')]: displayPath,
        [getKey(keys, 'type')]: stats.isDirectory() ? 'd' : 'f',
        [getKey(keys, 'symlink')]: symlink,
    };

    // **Await symlink resolution in parallel**
    const symlink_target = await symlinkTargetPromise;

    if (!prune || symlink) {
        fileObject[getKey(keys, 'symlink_target')] = symlink_target;
        fileObject[getKey(keys, 'symlink_resolved')] = symlink_target
            ? path.resolve(symlink_target)
            : null;
    }

    if (size) {
        fileObject[getKey(keys, 'size')] = stats.size;
    }

    if (meta) {
        fileObject[getKey(keys, 'created_at')] = stats.birthtime;
        fileObject[getKey(keys, 'modified_at')] = stats.mtime;
    }

    if (symlink) {
        return fileObject; // **Return early for symlinks (no recursion)**
    }

    // **Ensure directories always have `children: []` when recursive is false**
    if (stats.isDirectory()) {
        fileObject[getKey(keys, 'children')] = []; // Default to empty array

        const dirContents = await dirContentsPromise;
        if (dirContents) {
            fileObject[getKey(keys, 'children')] = await Promise.all(
                dirContents.map(async (child) => {
                    const childPath = path.join(dir, child);

                    if (recursive) {
                        return struct(childPath, options, depth + 1);
                    }

                    // **Only include top-level files & directories, no recursion**
                    const childStats = await fs.lstat(childPath);

                    return {
                        [getKey(keys, 'path')]: path.resolve(childPath),
                        [getKey(keys, 'type')]: childStats.isDirectory()
                            ? 'd'
                            : 'f',
                        [getKey(keys, 'symlink')]: childStats.isSymbolicLink(),
                        [getKey(keys, 'children')]: childStats.isDirectory()
                            ? []
                            : undefined, // Ensure directories always have empty `children`
                    };
                }),
            );
        }
    }

    return fileObject;
}

export default struct;
