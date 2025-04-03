# TypeScript SDK Examples

This directory contains example implementations that demonstrate how to use the MCP/NANDA TypeScript SDK.

## Examples

- `reputation/`: Examples showing how to use the reputation system toolkit
  - `weighted-algorithm.ts`: Implementing a custom reputation algorithm
  - `review-system.ts`: Managing server reviews

- `nanda/`: Examples showing how to build MCP servers using the NANDA framework
  - `simple-server.ts`: Basic MCP server with text and image generation
  - `plugin-server.ts`: Advanced server with plugins for analytics and auth

## Running Examples

To run an example:

```bash
# Build the SDK
npm run build

# Run an example
npx ts-node examples/path/to/example.ts
```

## Notes

### Reputation System

The reputation system examples demonstrate the API design and usage patterns. They work with the prototype implementation, which includes the algorithm utilities, storage adapters, and badge generation features. The client implementations (for making API requests) are currently in prototype form.

### NANDA Server Framework

The NANDA server examples show how to create MCP-compatible servers using the NANDA framework. The core functionality is implemented, but some advanced features like discovery, verification, and webhooks are still in development.