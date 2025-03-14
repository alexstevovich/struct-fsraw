import structureFsRaw from './src/index.js';

const fileSystemRepresentation = await structureFsRaw('./test/mockup/', {
    includeMeta: true,
});

console.log(JSON.stringify(fileSystemRepresentation, null, 2));
