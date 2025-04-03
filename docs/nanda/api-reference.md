# NANDA Server API Reference

This document provides a detailed reference for the NANDA Server Framework API.

## Core Functions

### createServer

Creates a new NANDA server instance.

```typescript
function createServer(config: IServerConfig): INandaServer
```

#### Parameters

- `config`: Server configuration object (see IServerConfig)

#### Returns

- An `INandaServer` instance

#### Example

```typescript
import { createServer } from '@modelcontextprotocol/sdk/nanda';

const server = createServer({
  name: 'My Server',
  description: 'A simple MCP server',
});
```

## Interfaces

### IServerConfig

Configuration for the NANDA server.

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

### INandaServer

The main server interface.

```typescript
interface INandaServer {
  app: Express;                   // Express application
  config: IServerConfig;          // Server configuration
  
  start(port?: number): Promise<void>; // Start the server
  stop(): Promise<void>;                // Stop the server
  
  addCapability(capability: IServerCapability): void; // Add a capability
  getRouter(path: string): Router;      // Get a router for a path
  registerPlugin(plugin: IServerPlugin): void; // Register a plugin
  setHooks(hooks: IServerHooks): void;  // Set server lifecycle hooks
}
```

### IServerCapability

Defines a server capability.

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

### ICapabilityParameter

Defines a parameter for a capability.

```typescript
interface ICapabilityParameter {
  name: string;                   // Parameter name
  description: string;            // Parameter description
  type: string;                   // Parameter type
  required: boolean;              // Whether parameter is required
  default?: string;               // Default value
}
```

### CapabilityHandler

Function type for handling capability requests.

```typescript
type CapabilityHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<unknown> | unknown;
```

### IServerPlugin

Plugin interface for extending server functionality.

```typescript
interface IServerPlugin {
  name: string;                   // Plugin name
  initialize: (server: INandaServer) => void; // Initialize function
  config?: Record<string, unknown>; // Plugin configuration
}
```

### IServerHooks

Hooks for server lifecycle events.

```typescript
interface IServerHooks {
  beforeStart?: (server: INandaServer) => Promise<void> | void;
  afterStart?: (server: INandaServer) => Promise<void> | void;
  beforeStop?: (server: INandaServer) => Promise<void> | void;
  afterStop?: (server: INandaServer) => Promise<void> | void;
}
```

## Methods

### INandaServer.start

Starts the server and listens for connections.

```typescript
start(port?: number): Promise<void>
```

#### Parameters

- `port` (optional): Port to listen on (overrides config.port)

#### Returns

- A Promise that resolves when the server has started

#### Example

```typescript
await server.start(8000);
```

### INandaServer.stop

Stops the server and closes all connections.

```typescript
stop(): Promise<void>
```

#### Returns

- A Promise that resolves when the server has stopped

#### Example

```typescript
await server.stop();
```

### INandaServer.addCapability

Adds a capability to the server.

```typescript
addCapability(capability: IServerCapability): void
```

#### Parameters

- `capability`: The capability to add

#### Example

```typescript
server.addCapability({
  name: 'echo',
  description: 'Echo back the input',
  type: 'tool',
  handler: async (req, res) => {
    const { message } = req.body;
    return { echo: message };
  },
});
```

### INandaServer.getRouter

Gets an Express router for a specific path.

```typescript
getRouter(path: string): Router
```

#### Parameters

- `path`: The path for the router

#### Returns

- An Express Router instance

#### Example

```typescript
const router = server.getRouter('/api/custom');
router.get('/hello', (req, res) => {
  res.json({ message: 'Hello, world!' });
});
```

### INandaServer.registerPlugin

Registers a plugin with the server.

```typescript
registerPlugin(plugin: IServerPlugin): void
```

#### Parameters

- `plugin`: The plugin to register

#### Example

```typescript
server.registerPlugin({
  name: 'logger',
  initialize: (server) => {
    server.app.use((req, res, next) => {
      console.log(`${req.method} ${req.path}`);
      next();
    });
  },
});
```

### INandaServer.setHooks

Sets lifecycle hooks for the server.

```typescript
setHooks(hooks: IServerHooks): void
```

#### Parameters

- `hooks`: The hooks to set

#### Example

```typescript
server.setHooks({
  beforeStart: async (server) => {
    console.log('Server is about to start');
  },
  afterStop: async (server) => {
    console.log('Server has stopped');
  },
});
```

## Middleware

### errorMiddleware

Error handling middleware that formats errors as JSON responses.

```typescript
function errorMiddleware(
  err: Error & { status?: number; errors?: unknown },
  req: Request,
  res: Response,
  _next: NextFunction
): void
```

### notFoundMiddleware

Not found (404) middleware.

```typescript
function notFoundMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void
```

## Error Handling

When an error occurs in a capability handler or middleware, it's caught by the error middleware and formatted as a JSON response:

```typescript
{
  status: 500,           // HTTP status code
  message: "Error message",
  error: "ErrorType",
  details: { ... }       // Error details (in development only)
}
```

To throw a custom error:

```typescript
const error: Error & { status?: number } = new Error('Invalid input');
error.status = 400;  // HTTP status code
throw error;
```