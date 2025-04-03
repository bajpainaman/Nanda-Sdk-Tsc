# Reputation System Examples

This directory contains example implementations that demonstrate how to use the NANDA Reputation System toolkit.

## Examples

1. `weighted-algorithm.ts`: Example implementation of a custom weighted reputation algorithm.
2. `review-system.ts`: Example implementation of a review management system for servers.

## Note

These examples are designed to demonstrate the API design and implementation patterns. They currently work with the prototype implementation of the reputation system. As the reputation system evolves, these examples may need to be updated.

## Running the Examples

To run an example:

```bash
# Build the SDK
npm run build

# Run an example (note: you'll need to fix the imports to point to the built version)
ts-node examples/reputation/weighted-algorithm.ts
```