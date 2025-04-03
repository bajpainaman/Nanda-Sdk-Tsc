# MCP Server API

This document provides an overview of the MCP server API in the TypeScript SDK.

## Server Class

The main entry point for server functionality is the `McpServer` class:

```typescript
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

const server = new McpServer();
```

## Key Components

### Resources

Resources are files or data that can be provided to a language model for context:

```typescript
// Add a static resource
server.addResource({
  name: "hello.txt",
  content: "Hello, world!",
});

// Add a resource from a file
server.addResourceFile("example.json", "/path/to/example.json");

// Add a dynamic resource
server.addResourceHandler("stats.txt", async (params) => {
  return `Server stats: ${JSON.stringify(await getStats())}`;
});
```

### Resource Templates

Resource templates allow for parameterized resources:

```typescript
// Add a resource template
server.addResourceTemplate(
  "user/{id}/profile.json",
  ({ id }) => getUser(id)
);
```

### Tools

Tools are functions that can be called by a language model:

```typescript
// Add a tool
server.addTool({
  name: "calculator",
  description: "Calculate mathematical expressions",
  schema: calculatorSchema,
  handler: async ({ operation, a, b }) => {
    switch (operation) {
      case "add": return { result: a + b };
      case "subtract": return { result: a - b };
      case "multiply": return { result: a * b };
      case "divide":
        if (b === 0) throw new Error("Division by zero");
        return { result: a / b };
      default: throw new Error(`Unknown operation: ${operation}`);
    }
  },
});
```

### Prompts

Prompts are ready-to-use prompts that can be retrieved by clients:

```typescript
// Add a prompt
server.addPrompt({
  name: "code-explanation",
  prompt: "Explain the following code in detail:",
  parameters: [
    {
      name: "code",
      description: "The code to explain",
      schema: { type: "string" },
    },
  ],
});
```

### Completions

You can handle completion requests to generate text:

```typescript
// Set a completion handler
server.setCompletionHandler(async (request) => {
  // Process the request and return a completion
  const { prompt, resources, tools } = request;
  
  // In a real implementation, you would call an LLM here
  const completion = `Response to: ${prompt}`;
  
  return { completion };
});
```

## Starting the Server

To start the server with a transport:

```typescript
import { StdioTransport } from '@modelcontextprotocol/sdk/server/transports/stdio.js';

// Create a transport
const transport = new StdioTransport();

// Connect the server to the transport
server.connect(transport);
```

## Error Handling

The server includes utilities for handling errors:

```typescript
import { ErrorCodes } from '@modelcontextprotocol/sdk/server/mcp.js';

// In a tool handler
server.addTool({
  name: "example",
  handler: async (params) => {
    if (!params.required) {
      throw {
        code: ErrorCodes.InvalidParams,
        message: "Missing required parameter",
      };
    }
    // Continue with normal processing
  },
});
```

## Progress Updates

For long-running operations, you can send progress updates:

```typescript
server.addTool({
  name: "processor",
  handler: async (params, context) => {
    // Start a long-running operation
    for (let i = 0; i < 100; i++) {
      // Do some work
      await doWork();
      
      // Send progress update
      context.sendProgress({
        percentage: i + 1,
        status: i === 99 ? "Completing" : "Processing",
      });
    }
    
    return { status: "Completed" };
  },
});
```

## Authentication

The server supports authentication:

```typescript
import { BearerAuthProvider } from '@modelcontextprotocol/sdk/server/auth.js';

// Create an authentication provider
const authProvider = new BearerAuthProvider({
  validate: async (token) => {
    // Validate the token
    if (token === "valid-token") {
      return { userId: "user123" };
    }
    return null;
  },
});

// Use the auth provider with the server
server.setAuthProvider(authProvider);
```

## Advanced Usage

For more advanced usage, you can use the lower-level `Server` class:

```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';

// Create a server
const server = new Server();

// Register request handlers
server.registerRequestHandler('tools/call', async (request) => {
  // Handle tool call requests
});

// Connect to a transport
const transport = new StdioTransport();
server.connect(transport);
```

## Example Server

Here's a complete example of a simple MCP server:

```typescript
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioTransport } from '@modelcontextprotocol/sdk/server/transports/stdio.js';

// Create a server
const server = new McpServer();

// Add a resource
server.addResource({
  name: "hello.txt",
  content: "Hello, world!",
});

// Add a tool
server.addTool({
  name: "echo",
  description: "Echo the input",
  schema: {
    type: "object",
    properties: {
      message: { type: "string" },
    },
    required: ["message"],
  },
  handler: async ({ message }) => {
    return { echo: message };
  },
});

// Add a prompt
server.addPrompt({
  name: "greeting",
  prompt: "Say hello to {name}",
  parameters: [
    {
      name: "name",
      description: "The name to greet",
      schema: { type: "string" },
    },
  ],
});

// Set a completion handler
server.setCompletionHandler(async (request) => {
  const { prompt } = request;
  return { completion: `Response to: ${prompt}` };
});

// Connect to stdio transport
const transport = new StdioTransport();
server.connect(transport);
```

## NANDA Server Framework

For a higher-level server framework with additional features, see the [NANDA Server Framework](../nanda/index.md). NANDA provides:

- Easier server setup with minimal configuration
- Plugin architecture for extensibility
- Advanced features like discovery, analytics, and verification
- Built-in error handling and middleware

Example using NANDA:

```typescript
import { createServer } from '@modelcontextprotocol/sdk/nanda';

const server = createServer({
  name: 'My MCP Server',
  description: 'A simple MCP server',
  capabilities: [
    {
      name: 'echo',
      description: 'Echo the input',
      type: 'tool',
      handler: async (req, res) => {
        const { message } = req.body;
        return { echo: message };
      },
    },
  ],
});

server.start(8000);
```

For more details, see the [NANDA documentation](../nanda/index.md).