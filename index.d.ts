/**
 * struct-fsraw Type Definitions
 *
 * @license Apache-2.0
 * @copyright 2015-2025 Alex Stevovich
 */

export interface StructFsOptions {
    /** Include file creation and modification timestamps */
    meta?: boolean;
    /** Include file sizes in bytes */
    size?: boolean;
    /** Recursively scan subdirectories */
    recursive?: boolean;
    /** Remove unnecessary symlink metadata unless required */
    prune?: boolean;
    /** Custom key mapping object */
    keys?: Record<string, string>;
}

export interface FileStructure {
    /** Absolute path of the file or directory */
    path: string;
    /** Type of file: 'd' (directory) or 'f' (file) */
    type: 'd' | 'f';
    /** Indicates if the file is a symbolic link */
    symlink: boolean;
    /** Symlink target path (if applicable) */
    symlink_target?: string | null;
    /** Resolved absolute path of the symlink target (if applicable) */
    symlink_resolved?: string | null;
    /** File size in bytes (if enabled) */
    size?: number;
    /** File creation timestamp (if enabled) */
    created_at?: Date;
    /** File modification timestamp (if enabled) */
    modified_at?: Date;
    /** Array of children for directories (if applicable) */
    children?: FileStructure[];
}

/**
 * Retrieves the filesystem structure of a directory.
 * @param dir The directory to scan.
 * @param options Optional parameters to customize the scan.
 * @returns A promise that resolves to a structured representation of the directory.
 */
export function structFsRaw(
    dir: string,
    options?: StructFsOptions,
): Promise<FileStructure>;

/**
 * Returns the default key mappings for compact mode.
 */
export function getKeys(): Record<string, string>;

export default structFsRaw;
