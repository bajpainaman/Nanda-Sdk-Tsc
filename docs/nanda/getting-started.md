# Getting Started with NANDA Server Framework

This guide will help you quickly set up and start using the NANDA Server Framework to build MCP-compatible servers.

## Installation

The NANDA Server Framework is a fork of the MCP protocol that maintains backward compatibility. It is available in this TypeScript SDK:

```bash
npm install @modelcontextprotocol/sdk
```

## Quick Start

Here's a minimal example to create and start a NANDA server:

```typescript
import { createServer } from '@modelcontextprotocol/sdk/nanda';

// Create a server
const server = createServer({
  name: 'My First MCP Server',
  description: 'A simple server built with the NANDA framework',
  capabilities: [
    {
      name: 'echo',
      description: 'Echo back the input',
      type: 'tool',
      handler: async (req, res) => {
        const { message } = req.body;
        return { echo: message };
      },
    },
  ],
});

// Start the server
server.start(8000).then(() => {
  console.log('Server is running at http://localhost:8000');
});
```

Save this to a file (e.g., `server.ts`) and run it with:

```bash
npx ts-node server.ts
```

## Testing Your Server

Once your server is running, you can test it using curl:

```bash
# Get server info
curl http://localhost:8000/api

# Call the echo capability
curl -X POST http://localhost:8000/api/capabilities/echo \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello, NANDA!"}'
```

## Adding More Capabilities

Capabilities define what your server can do. Here's how to add multiple capabilities:

```typescript
import { createServer } from '@modelcontextprotocol/sdk/nanda';

const server = createServer({
  name: 'Multi-Capability Server',
  description: 'A server with multiple capabilities',
  capabilities: [
    {
      name: 'echo',
      description: 'Echo back the input',
      type: 'tool',
      handler: async (req, res) => {
        const { message } = req.body;
        return { echo: message };
      },
    },
    {
      name: 'reverse',
      description: 'Reverse the input string',
      type: 'tool',
      handler: async (req, res) => {
        const { message } = req.body;
        return { 
          reversed: message.split('').reverse().join('') 
        };
      },
    },
  ],
});

server.start(8000);
```

## Using Plugins

Plugins extend the functionality of your server. Here's how to use them:

```typescript
import { createServer, IServerPlugin, INandaServer } from '@modelcontextprotocol/sdk/nanda';

// Create a logging plugin
const loggingPlugin: IServerPlugin = {
  name: 'logging',
  initialize: (server: INandaServer) => {
    server.app.use((req, res, next) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
      next();
    });
  },
};

// Create a server with the plugin
const server = createServer({
  name: 'Server with Plugins',
  description: 'A server that uses plugins',
  plugins: [loggingPlugin],
  capabilities: [
    // ... your capabilities
  ],
});

server.start(8000);
```

## Server Lifecycle Hooks

You can hook into the server lifecycle to run code at specific points:

```typescript
import { createServer } from '@modelcontextprotocol/sdk/nanda';

const server = createServer({
  name: 'Server with Hooks',
  description: 'A server that uses lifecycle hooks',
  // ...
});

// Set hooks
server.setHooks({
  beforeStart: async (server) => {
    console.log('Server is about to start...');
    // Initialize resources, connect to databases, etc.
  },
  afterStart: async (server) => {
    console.log('Server has started!');
    // Register with service discovery, start background tasks, etc.
  },
  beforeStop: async (server) => {
    console.log('Server is about to stop...');
    // Prepare for shutdown, finish pending work, etc.
  },
  afterStop: async (server) => {
    console.log('Server has stopped!');
    // Release resources, close connections, etc.
  },
});

server.start(8000);

// Handle graceful shutdown
process.on('SIGINT', async () => {
  await server.stop();
  process.exit(0);
});
```

## Next Steps

- Explore the [API Reference](./api-reference.md) for detailed information
- See the [Examples](./examples.md) for more advanced use cases
- Learn about [Custom Plugins](./plugins.md) to extend your server