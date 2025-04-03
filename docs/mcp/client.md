# MCP Client API

This document provides an overview of the MCP client API in the TypeScript SDK.

## Client Class

The main entry point for client functionality is the `Client` class:

```typescript
import { Client } from '@modelcontextprotocol/sdk';

const client = new Client({
  serverUrl: 'https://example.com/mcp',
});

await client.connect();
```

## Key Methods

### Initialization

```typescript
// Create a client with an HTTP server
const client = new Client({
  serverUrl: 'https://example.com/mcp',
});

// Create a client with a stdio transport
const stdioClient = new Client({
  transport: 'stdio',
});

// Connect to the server
await client.connect();
```

### Resources

```typescript
// List available resources
const resources = await client.listResources();

// Read a resource
const resource = await client.readResource({
  name: 'file.txt',
});

// Subscribe to resource updates
await client.subscribeResource({
  name: 'updates.txt',
});

// Unsubscribe from resource updates
await client.unsubscribeResource({
  name: 'updates.txt',
});
```

### Tools

```typescript
// List available tools
const tools = await client.listTools();

// Call a tool
const result = await client.callTool({
  name: 'calculator',
  input: {
    operation: 'add',
    a: 5,
    b: 3,
  },
});
```

### Prompts

```typescript
// List available prompts
const prompts = await client.listPrompts();

// Get a specific prompt
const prompt = await client.getPrompt({
  name: 'code-explanation',
});
```

### Completions

```typescript
// Request a completion
const completion = await client.complete({
  prompt: 'Explain how to use MCP',
  tools: ['search', 'code-analysis'],
  resources: ['mcp-documentation.txt'],
});
```

## Client Options

The `Client` constructor accepts several options:

```typescript
const client = new Client({
  // Server URL (for HTTP transport)
  serverUrl: 'https://example.com/mcp',
  
  // Transport type (defaults to 'sse')
  transport: 'sse', // 'sse', 'stdio', or 'websocket'
  
  // Transport-specific options
  transportOptions: {
    // SSE specific options
    headers: {
      'Authorization': 'Bearer token',
    },
    
    // Stdio specific options
    command: 'node server.js',
    cwd: '/path/to/directory',
  },
  
  // Client information
  clientInfo: {
    name: 'My MCP Client',
    version: '1.0.0',
  },
  
  // Capabilities
  capabilities: {
    tools: true,
    prompts: true,
    resources: true,
  },
});
```

## Error Handling

Errors from the MCP server are wrapped in `McpError` objects:

```typescript
try {
  const result = await client.callTool({
    name: 'calculator',
    input: {
      operation: 'divide',
      a: 5,
      b: 0,
    },
  });
} catch (error) {
  if (error instanceof McpError) {
    console.error(`MCP Error: ${error.code} - ${error.message}`);
    // Handle specific error codes
    if (error.code === ErrorCode.InvalidParams) {
      // Handle invalid parameters
    }
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## Progress Updates

For long-running operations, you can receive progress updates:

```typescript
const result = await client.callTool(
  {
    name: 'file-processor',
    input: {
      files: ['large-file.txt'],
    },
  },
  {
    onProgress: (progress) => {
      console.log(`Progress: ${progress.percentage}%`);
      console.log(`Status: ${progress.status}`);
    },
  }
);
```

## Authentication

The client supports various authentication methods:

```typescript
// Basic authentication
const client = new Client({
  serverUrl: 'https://example.com/mcp',
  transportOptions: {
    headers: {
      'Authorization': 'Basic ' + btoa('username:password'),
    },
  },
});

// OAuth authentication
import { OAuthProvider } from '@modelcontextprotocol/sdk/auth';

const authProvider = new OAuthProvider({
  clientId: 'your-client-id',
  clientSecret: 'your-client-secret',
  tokenUrl: 'https://example.com/oauth/token',
});

const client = new Client({
  serverUrl: 'https://example.com/mcp',
  auth: authProvider,
});
```

## Closing the Connection

When you're done with the client, close the connection:

```typescript
await client.close();
```

## Examples

For complete examples of using the MCP client, see the [examples directory](../../examples/).