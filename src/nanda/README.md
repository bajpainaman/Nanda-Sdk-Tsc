# NANDA Server Framework

A modular framework that forks the MCP protocol while maintaining backward compatibility, with enhanced features for discovery, verification, and analytics.

## Overview

The NANDA Server Framework is a fork of the MCP protocol that provides an easy way to create and manage MCP-compatible servers. While extending the basic MCP protocol with additional capabilities for server discovery, verification, and usage analytics, it maintains full backward compatibility with MCP.

## Features

- **Simple API**: Create an MCP server with minimal configuration
- **Modular Design**: Add only the components you need
- **Plugin Architecture**: Extend functionality through plugins
- **TypeScript Support**: Full TypeScript support with strong typing
- **Express Integration**: Built on Express for familiarity and extensibility

## Directory Structure

- `/core/` - Core server functionality
- `/discovery/` - Server discovery features
- `/auth/` - Authentication and authorization
- `/analytics/` - Usage tracking and reporting
- `/verification/` - Server verification tools
- `/webhooks/` - Event notification system

## Usage

Here's a basic example of creating an MCP server:

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

See the [examples directory](/examples/nanda) for more usage examples.

## Development Status

The NANDA Server Framework is currently in development. The following components are implemented:

- [x] Core server framework
- [ ] Authentication and authorization
- [ ] Server discovery
- [ ] Analytics
- [ ] Verification
- [ ] Webhooks

## Contributing

Contributions are welcome! See the [CONTRIBUTING.md](../../CONTRIBUTING.md) file for details.