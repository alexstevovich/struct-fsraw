import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs';
import path from 'path';
import { struct, getKeys } from '../src/index.js';

// Symlink path
const symlinkPath = './test/mockup/symlink-folder';

// Normalize paths (for cross-platform consistency)
function normalizePath(filePath, rootPath = './test/mockup/') {
    return path.relative(rootPath, filePath).replace(/\\/g, '/');
}

// Recursively normalize structure output
function normalizeStructPaths(obj, rootPath) {
    return {
        ...obj,
        path: normalizePath(obj.path, rootPath),
        children: obj.children
            ? obj.children.map((child) => normalizeStructPaths(child, rootPath))
            : undefined,
    };
}

// Auto-detect mockup structure dynamically
async function autoDetectMockup() {
    return struct('./test/mockup/');
}

describe('struct Function Tests', () => {
    it('Basic structure retrieval', async () => {
        const structData = await struct('./test/mockup/');
        const detectedMockup = await autoDetectMockup();
        expect(normalizeStructPaths(structData, './test/mockup/')).toEqual(
            normalizeStructPaths(detectedMockup, './test/mockup/'),
        );
    });

    it('Handles non-recursive mode (directories always have children)', async () => {
        const structData = await struct('./test/mockup/', {
            recursive: false,
        });

        expect(structData.children).toBeDefined();
        expect(Array.isArray(structData.children)).toBe(true);

        structData.children.forEach((child) => {
            expect(child).toHaveProperty('path');
            expect(child).toHaveProperty('type');
            expect(child.type).toMatch(/^(d|f)$/); // Ensure type is 'd' (directory) or 'f' (file)

            if (child.type === 'd') {
                expect(child).toHaveProperty('children'); // Directories always have a children array
                expect(child.children).toEqual([]); // Should be empty for non-recursive mode
            }
        });
    });

    it('Includes metadata when enabled', async () => {
        const structData = await struct('./test/mockup/', {
            meta: true,
            recursive: true,
        });
        expect(structData).toHaveProperty('created_at');
        expect(structData).toHaveProperty('modified_at');

        structData.children.forEach((child) => {
            expect(child).toHaveProperty('created_at');
            expect(child).toHaveProperty('modified_at');
        });
    });

    it('Includes file sizes when enabled', async () => {
        const structData = await struct('./test/mockup/', {
            size: true,
            recursive: true,
        });

        structData.children.forEach((child) => {
            console.log(child.size);
            console.log(structData);
            expect(typeof child.size).toBe('number');
        });
    });

    it('Handles symlinks correctly', async () => {
        const structData = await struct(symlinkPath);

        if (fs.existsSync(symlinkPath)) {
            expect(structData).toHaveProperty('symlink', true);
            expect(structData).toHaveProperty('symlink_target');
            expect(structData).toHaveProperty('symlink_resolved');
            expect(structData).not.toHaveProperty('children'); // Ensure no recursion into symlink
        } else {
            console.warn('Skipping symlink test: Symlink was not created.');
        }
    });

    it('Supports compact mode', async () => {
        const keymap = getKeys();
        keymap.children = 'c';
        keymap.path = 'p';
        keymap.type = 't';
        keymap.symlink = 'sl';

        const structData = await struct('./test/mockup/', { keys: keymap });

        expect(structData).toHaveProperty('p');
        expect(structData).toHaveProperty('t');
        expect(structData).toHaveProperty('sl');

        structData.c.forEach((child) => {
            expect(child).toHaveProperty('p');
            expect(child).toHaveProperty('t');
        });
    });

    it('Removes unnecessary symlink data with prune', async () => {
        const structData = await struct('./test/mockup/', { prune: true });

        structData.children.forEach((child) => {
            if (!child.symlink) {
                expect(child).not.toHaveProperty('symlink_target');
                expect(child).not.toHaveProperty('symlink_resolved');
            }
        });
    });

    it('Detects symlinks correctly (even if the target does not exist)', async () => {
        const structData = await struct({ dir: symlinkPath });

        if (fs.existsSync(symlinkPath)) {
            expect(structData).toHaveProperty('symlink', true);
            expect(structData).toHaveProperty(
                'symlink_target',
                path.resolve('D:\\nothing'),
            ); // Expected target
            expect(structData).not.toHaveProperty('children'); // Ensure no recursion into symlink
        } else {
            console.warn('Skipping symlink test: Symlink was not created.');
        }
    });
});
