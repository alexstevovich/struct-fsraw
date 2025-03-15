# struct-fsraw

Filesystem Structure Extraction for Node.js

**Archtype**: Node.js package

**struct-fsraw** retrieves a structured representation of a directory, including file metadata, file size, symlinks.

## Details

- **Recursive Scanning:** Optional recursive traversal.
- **Symlink Support:** Detect and resolve symbolic links, with an option to prune unnecessary symlink data.
- **Metadata Inclusion:** Optionally include file creation and modification timestamps.
- **Size Inclusion:** Optionally include file sizes.
- **Custom Key Mapping:** Easily switch between full key names and a compact representation using a key mapping object.

## Install

```sh
npm install struct-fsraw
```

## Usage

### Basic Example

```js
import struct from 'struct-fsraw';

const structure = await struct('./my-directory');
console.log(JSON.stringify(structure, null, 2));
```

**Output:**

```json
{
    "path": "/absolute/path/to/my-directory",
    "type": "d",
    "symlink": false,
    "children": [
        {
            "path": "/absolute/path/to/my-directory/file.txt",
            "type": "f",
            "symlink": false
        }
    ]
}
```

### Advanced Example

```js
import { struct, getKeys } from 'struct-fsraw';

const keyMapping = getKeys(); // Retrieve the default compact key mapping

const fileTree = await struct('./path/to/directory', {
    meta: true, // Include creation and modification times
    size: true, // Include file sizes
    recursive: true, // Recursively scan directories (default)
    prune: false, // Do not prune symlink data
    keys: keyMapping, // Use custom/compact key names
});

console.log(JSON.stringify(fileTree, null, 2));
```

## ⚙️ API Reference

### `struct(dir, options = {})`

Scans a directory and returns its structured representation.

| Parameter | Type   | Default    | Description                    |
| --------- | ------ | ---------- | ------------------------------ |
| `dir`     | string | (Required) | Path of the directory to scan. |
| `options` | object | `{}`       | Optional configuration.        |

### 🔹 Options

| Option      | Type    | Default | Description                                          |
| ----------- | ------- | ------- | ---------------------------------------------------- |
| `meta`      | boolean | `false` | Include file creation and modification timestamps.   |
| `size`      | boolean | `false` | Include file sizes in bytes.                         |
| `recursive` | boolean | `true`  | Recursively scan subdirectories.                     |
| `prune`     | boolean | `false` | Remove unnecessary symlink metadata unless required. |
| `keys`      | object  | `{}`    | Customize key names for output.                      |

## Related Packages

- [https://github.com/alexstevovich/struct-fs](https://github.com/alexstevovich/struct-fs) – A lighter fs struct that returns only file/dir names in a nested hierarchy and respects .ignore directives.

<sub>_These links might be suffixed with "-node" in the future if conflicts arise._</sub>

## Links

### Development Homepage

[https://github.com/alexstevovich/struct-fs](https://github.com/alexstevovich/struct-fs)

<sub>_This link might be suffixed with "-node" in the future if conflicts arise._</sub>

## License

Licensed under the [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0).
