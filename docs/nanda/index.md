# NANDA Server Framework Documentation

The NANDA Server Framework is a fork of the MCP protocol that enhances it with additional capabilities while maintaining backwards compatibility with MCP. It provides a toolkit for building servers with extended features for discovery, verification, and analytics.

## Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Core Concepts](#core-concepts)
4. [Server Configuration](#server-configuration)
5. [Capabilities](#capabilities)
6. [Plugins](#plugins)
7. [API Reference](#api-reference)
8. [Advanced Topics](#advanced-topics)

## Introduction

The NANDA Server Framework is a fork of the MCP (Multi-Agent Communication Protocol) that provides a complete toolkit for building, managing, and discovering servers. While NANDA extends MCP with additional capabilities, it maintains full backwards compatibility with the core MCP protocol.

NANDA adds several features on top of MCP, including server discovery, verification mechanisms, and usage analytics, while ensuring that NANDA servers can still communicate with standard MCP clients.

### Key Features

- **Simple API**: Create an MCP server with minimal configuration
- **Modular Design**: Add only the components you need
- **Plugin Architecture**: Extend functionality through plugins
- **TypeScript Support**: Full TypeScript support with strong typing
- **Express Integration**: Built on Express for familiarity and extensibility

## Getting Started

### Installation

The NANDA Server Framework is a fork of the MCP protocol that's available in this TypeScript SDK:

```bash
npm install @modelcontextprotocol/sdk
```

### Basic Usage

Here's a minimal example of creating an MCP server:

```typescript
import { createServer } from '@modelcontextprotocol/sdk/nanda';

const server = createServer({
  name: 'My MCP Server',
  description: 'A simple MCP server',
  capabilities: [
    {
      name: 'text-generation',
      description: 'Generate text based on a prompt',
      type: 'agent',
      handler: async (req, res) => {
        const { prompt } = req.body;
        return { text: `Response for: ${prompt}` };
      },
    },
  ],
});

server.start(8000);
```

## Core Concepts

### Server

The core of the NANDA framework is the server object, which encapsulates an Express application with MCP-specific functionality. The server handles routing, middleware, and capability registration.

### Capabilities

Capabilities represent the functional abilities of an MCP server. Each capability has a name, description, type, and handler function that implements the capability's logic.

### Plugins

Plugins extend the server's functionality. They can add routes, middleware, and other features to the server. Plugins are registered with the server during initialization.

## Server Configuration

The `createServer` function accepts a configuration object with the following properties:

```typescript
interface IServerConfig {
  name: string;                   // Server name
  description: string;            // Server description
  url?: string;                   // Server URL
  documentationUrl?: string;      // Documentation URL
  capabilities?: IServerCapability[]; // Server capabilities
  types?: string[];               // Server types
  tags?: string[];                // Server tags
  port?: number;                  // Port to listen on (default: 8000)
  validateApi?: boolean;          // Enable API spec validation (default: true)
  apiSpec?: string;               // Path to API spec file
  plugins?: IServerPlugin[];      // Plugins to use
}
```

## Capabilities

Capabilities are the core functionality of an MCP server. Each capability represents a specific function that the server can perform.

### Defining Capabilities

A capability is defined with the following properties:

```typescript
interface IServerCapability {
  name: string;                   // Capability name
  description: string;            // Capability description
  type: string;                   // Capability type (agent, tool, etc.)
  parameters?: ICapabilityParameter[]; // Capability parameters
  examples?: string[];            // Usage examples
  handler?: CapabilityHandler;    // Function to handle capability requests
}
```

### Capability Handler

The capability handler is a function that processes capability requests:

```typescript
type CapabilityHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<unknown> | unknown;
```

### Example

```typescript
const textGenerationCapability: IServerCapability = {
  name: 'text-generation',
  description: 'Generate text based on a prompt',
  type: 'agent',
  parameters: [
    {
      name: 'prompt',
      description: 'The input prompt',
      type: 'string',
      required: true,
    },
  ],
  handler: async (req, res) => {
    const { prompt } = req.body;
    return { text: `Response for: ${prompt}` };
  },
};
```

## Plugins

Plugins extend the server's functionality. They can add routes, middleware, and other features to the server.

### Defining Plugins

A plugin is defined with the following properties:

```typescript
interface IServerPlugin {
  name: string;                  // Plugin name
  initialize: (server: INandaServer) => void; // Plugin initialization function
  config?: Record<string, unknown>; // Plugin configuration
}
```

### Example

```typescript
const analyticsPlugin: IServerPlugin = {
  name: 'analytics',
  initialize: (server) => {
    const router = server.getRouter('/api/analytics');
    
    // Set up analytics tracking
    const requests: any[] = [];
    
    server.app.use((req, res, next) => {
      requests.push({
        path: req.path,
        method: req.method,
        timestamp: new Date(),
      });
      next();
    });
    
    // Add endpoint to get analytics
    router.get('/stats', (req, res) => {
      res.json({
        total_requests: requests.length,
        paths: requests.reduce((acc, r) => {
          acc[r.path] = (acc[r.path] || 0) + 1;
          return acc;
        }, {}),
      });
    });
  },
};
```

## API Reference

### `createServer(config: IServerConfig): INandaServer`

Creates a new NANDA server instance.

### `INandaServer` Interface

The server object returned by `createServer`:

```typescript
interface INandaServer {
  app: Express;                   // Express application
  config: IServerConfig;          // Server configuration
  start: (port?: number) => Promise<void>; // Start the server
  stop: () => Promise<void>;      // Stop the server
  addCapability: (capability: IServerCapability) => void; // Add a capability
  getRouter: (path: string) => Router; // Get an Express router for a path
  registerPlugin: (plugin: IServerPlugin) => void; // Register a plugin
  setHooks: (hooks: IServerHooks) => void; // Set server lifecycle hooks
}
```

### Server Hooks

Server hooks are functions that are called at different points in the server's lifecycle:

```typescript
interface IServerHooks {
  beforeStart?: (server: INandaServer) => Promise<void> | void;
  afterStart?: (server: INandaServer) => Promise<void> | void;
  beforeStop?: (server: INandaServer) => Promise<void> | void;
  afterStop?: (server: INandaServer) => Promise<void> | void;
}
```

## Advanced Topics

### Error Handling

The NANDA framework includes a global error handler that catches errors thrown by handlers and middleware. It formats errors as JSON responses with status codes.

To throw an error from a handler:

```typescript
handler: async (req, res) => {
  const { prompt } = req.body;
  
  if (!prompt) {
    const error = new Error('Prompt is required');
    error.status = 400;
    throw error;
  }
  
  return { text: `Response for: ${prompt}` };
}
```

### Custom Middleware

You can add custom middleware to the server using Express's middleware API:

```typescript
const server = createServer({
  name: 'My MCP Server',
  // ...
});

// Add custom middleware
server.app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});
```

### Custom Routes

You can add custom routes using the `getRouter` method:

```typescript
const router = server.getRouter('/api/custom');

router.get('/hello', (req, res) => {
  res.json({ message: 'Hello, world!' });
});
```

### OpenAPI Integration

The NANDA framework can validate requests against an OpenAPI specification:

```typescript
const server = createServer({
  name: 'My MCP Server',
  apiSpec: '/path/to/openapi.yaml',
  validateApi: true,
});
```