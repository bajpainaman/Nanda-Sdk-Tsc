# NANDA Server Examples

This document provides examples of using the NANDA Server Framework to build various types of MCP servers.

## Basic Server

A minimal server with a single capability:

```typescript
import { createServer } from '@modelcontextprotocol/sdk/nanda';

const server = createServer({
  name: 'Basic Server',
  description: 'A simple MCP server example',
  types: ['tool'],
  tags: ['example', 'basic'],
  capabilities: [
    {
      name: 'echo',
      description: 'Echo back the input',
      type: 'tool',
      parameters: [
        {
          name: 'message',
          description: 'The message to echo',
          type: 'string',
          required: true,
        },
      ],
      handler: async (req, res) => {
        const { message } = req.body;
        return { echo: message };
      },
    },
  ],
});

server.start(8000);
```

## Multi-Capability Server

A server with multiple capabilities:

```typescript
import { createServer } from '@modelcontextprotocol/sdk/nanda';

const server = createServer({
  name: 'Multi-Capability Server',
  description: 'A server with multiple capabilities',
  types: ['agent', 'tool'],
  tags: ['example', 'multiple'],
  capabilities: [
    {
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
        {
          name: 'max_tokens',
          description: 'Maximum tokens to generate',
          type: 'number',
          required: false,
          default: '100',
        },
      ],
      handler: async (req, res) => {
        const { prompt, max_tokens = 100 } = req.body;
        
        // In a real implementation, this would call an AI model
        const generatedText = `This is a response to "${prompt}" with max_tokens=${max_tokens}. This is just a demonstration.`;
        
        return {
          text: generatedText,
          tokens: generatedText.split(' ').length,
        };
      },
    },
    {
      name: 'text-summarization',
      description: 'Summarize text',
      type: 'tool',
      parameters: [
        {
          name: 'text',
          description: 'The text to summarize',
          type: 'string',
          required: true,
        },
      ],
      handler: async (req, res) => {
        const { text } = req.body;
        
        // In a real implementation, this would use an AI model
        const summary = `Summary of text (length: ${text.length}): ${text.substring(0, 50)}...`;
        
        return { summary };
      },
    },
  ],
});

server.start(8000);
```

## Using Custom Express Middleware

Add custom middleware to your server:

```typescript
import { createServer } from '@modelcontextprotocol/sdk/nanda';
import rateLimit from 'express-rate-limit';

const server = createServer({
  name: 'Server with Middleware',
  description: 'A server with custom middleware',
  // ...capabilities
});

// Add rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later',
});

server.app.use(limiter);

// Add request timing middleware
server.app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${duration}ms`);
  });
  
  next();
});

server.start(8000);
```

## Plugin-Based Server

A server with multiple plugins:

```typescript
import { createServer, IServerPlugin, INandaServer } from '@modelcontextprotocol/sdk/nanda';

// Authentication plugin
const authPlugin: IServerPlugin = {
  name: 'auth',
  initialize: (server: INandaServer) => {
    // Get a router for auth endpoints
    const router = server.getRouter('/api/auth');
    
    // Simple in-memory user store
    const users = new Map();
    
    // Add login endpoint
    router.post('/login', (req, res) => {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: 'Username and password required' });
      }
      
      // In a real implementation, this would validate credentials
      // For demo, just create a user if it doesn't exist
      if (!users.has(username)) {
        users.set(username, { username, password });
      }
      
      const user = users.get(username);
      
      if (user.password !== password) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      // In a real implementation, this would use JWT
      const token = Buffer.from(`${username}:${Date.now()}`).toString('base64');
      
      return res.json({ token });
    });
    
    // Add auth middleware
    const authenticate = (req, res, next) => {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      const token = authHeader.substring(7);
      
      // In a real implementation, this would validate the token
      try {
        const decoded = Buffer.from(token, 'base64').toString();
        const [username] = decoded.split(':');
        
        if (!users.has(username)) {
          return res.status(401).json({ error: 'Invalid token' });
        }
        
        req.user = { username };
        next();
      } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
      }
    };
    
    // Expose the middleware to the server
    server.app.set('authenticate', authenticate);
    
    console.log('Auth plugin initialized');
  },
};

// Logging plugin
const loggingPlugin: IServerPlugin = {
  name: 'logging',
  initialize: (server: INandaServer) => {
    server.app.use((req, res, next) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
      next();
    });
    
    console.log('Logging plugin initialized');
  },
};

// Create server with plugins
const server = createServer({
  name: 'Plugin-Based Server',
  description: 'A server with multiple plugins',
  plugins: [authPlugin, loggingPlugin],
  capabilities: [
    {
      name: 'protected-resource',
      description: 'A protected resource that requires authentication',
      type: 'tool',
      handler: async (req, res) => {
        // Get the authenticate middleware
        const authenticate = req.app.get('authenticate');
        
        // Apply authentication
        authenticate(req, res, () => {
          // This is called if authentication succeeds
          return res.json({
            message: 'You accessed a protected resource',
            user: req.user,
          });
        });
      },
    },
  ],
});

server.start(8000);
```

## Server with External API Integration

Integrate with external APIs in your capabilities:

```typescript
import { createServer } from '@modelcontextprotocol/sdk/nanda';
import axios from 'axios';

const server = createServer({
  name: 'API Integration Server',
  description: 'A server that integrates with external APIs',
  capabilities: [
    {
      name: 'weather',
      description: 'Get weather information for a location',
      type: 'tool',
      parameters: [
        {
          name: 'location',
          description: 'The location to get weather for',
          type: 'string',
          required: true,
        },
      ],
      handler: async (req, res) => {
        const { location } = req.body;
        
        try {
          // In a real implementation, you would use an actual weather API
          // This is a mock for demonstration
          const response = await axios.get(`https://api.example.com/weather?location=${encodeURIComponent(location)}`);
          
          return {
            location,
            temperature: response.data.temperature,
            conditions: response.data.conditions,
            forecast: response.data.forecast,
          };
        } catch (error) {
          // Handle API errors
          const apiError = new Error(`Weather API error: ${error.message}`);
          apiError.status = 502; // Bad Gateway
          throw apiError;
        }
      },
    },
  ],
});

server.start(8000);
```

## Complete Server Example

A more comprehensive server with multiple features:

```typescript
import { createServer, IServerPlugin, INandaServer } from '@modelcontextprotocol/sdk/nanda';
import path from 'path';

// Authentication plugin
const authPlugin = {
  name: 'auth',
  initialize: (server) => {
    // ... auth implementation
  },
};

// Create server
const server = createServer({
  name: 'Complete MCP Server',
  description: 'A comprehensive MCP server example',
  url: 'https://api.example.com',
  documentationUrl: 'https://docs.example.com',
  types: ['agent', 'tool'],
  tags: ['example', 'comprehensive'],
  apiSpec: path.join(__dirname, 'openapi.yaml'),
  validateApi: true,
  plugins: [authPlugin],
  capabilities: [
    // ... capabilities
  ],
});

// Add custom routes
const router = server.getRouter('/api/custom');

router.get('/status', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    version: '1.0.0',
  });
});

// Set lifecycle hooks
server.setHooks({
  beforeStart: async () => {
    console.log('Server is about to start');
    // Initialize resources, connect to databases, etc.
  },
  afterStop: async () => {
    console.log('Server has stopped');
    // Release resources, close connections, etc.
  },
});

// Start server
server.start(8000).catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down...');
  await server.stop();
  process.exit(0);
});
```

All these examples and more can be found in the [examples directory](../../examples/nanda) of the SDK.