# NANDA Server Plugins

The NANDA Server Framework includes a plugin architecture that allows you to extend server functionality. This guide explains how to use and create plugins.

## What Are Plugins?

Plugins are modular components that add features to your NANDA server. They can:

- Add routes and endpoints
- Register middleware
- Add new capabilities
- Provide utilities and services
- Hook into server events

## Using Plugins

To use a plugin, include it in your server configuration:

```typescript
import { createServer } from '@modelcontextprotocol/sdk/nanda';
import { authPlugin } from './plugins/auth.js';
import { metricsPlugin } from './plugins/metrics.js';

const server = createServer({
  name: 'My Server',
  description: 'Server with plugins',
  plugins: [
    authPlugin,
    metricsPlugin({ logToConsole: true }),
  ],
});

server.start(8000);
```

## Creating a Plugin

A plugin is an object that implements the `IServerPlugin` interface:

```typescript
import { IServerPlugin, INandaServer } from '@modelcontextprotocol/sdk/nanda';

// Simple logging plugin
export const loggingPlugin: IServerPlugin = {
  name: 'logging',
  initialize: (server: INandaServer) => {
    // Add middleware to log requests
    server.app.use((req, res, next) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
      next();
    });
    
    console.log('Logging plugin initialized');
  },
  config: {
    // Optional plugin configuration
    logLevel: 'info',
  },
};
```

## Plugin With Configuration

You can create factory functions that return configured plugins:

```typescript
import { IServerPlugin, INandaServer } from '@modelcontextprotocol/sdk/nanda';

// Plugin configuration interface
interface MetricsConfig {
  logToConsole?: boolean;
  collectInterval?: number;
}

// Metrics plugin factory
export function metricsPlugin(config: MetricsConfig = {}): IServerPlugin {
  return {
    name: 'metrics',
    initialize: (server: INandaServer) => {
      const logToConsole = config.logToConsole ?? false;
      const collectInterval = config.collectInterval ?? 60000; // 1 minute
      
      // Add metrics endpoint
      const router = server.getRouter('/api/metrics');
      
      // Track metrics
      const metrics = {
        requestCount: 0,
        errorCount: 0,
        responseTime: {
          total: 0,
          count: 0,
        },
      };
      
      // Add middleware to track metrics
      server.app.use((req, res, next) => {
        const start = Date.now();
        
        // Track response time on end
        res.on('finish', () => {
          const duration = Date.now() - start;
          metrics.requestCount++;
          
          if (res.statusCode >= 400) {
            metrics.errorCount++;
          }
          
          metrics.responseTime.total += duration;
          metrics.responseTime.count++;
          
          if (logToConsole) {
            console.log(`Request to ${req.path}: ${duration}ms, status: ${res.statusCode}`);
          }
        });
        
        next();
      });
      
      // Add endpoint to get metrics
      router.get('/', (req, res) => {
        const avgResponseTime = metrics.responseTime.count > 0
          ? metrics.responseTime.total / metrics.responseTime.count
          : 0;
          
        res.json({
          requestCount: metrics.requestCount,
          errorCount: metrics.errorCount,
          errorRate: metrics.requestCount > 0
            ? (metrics.errorCount / metrics.requestCount) * 100
            : 0,
          avgResponseTime,
        });
      });
      
      // Reset metrics periodically
      const resetInterval = setInterval(() => {
        if (logToConsole) {
          console.log('Resetting metrics');
        }
        
        metrics.requestCount = 0;
        metrics.errorCount = 0;
        metrics.responseTime = {
          total: 0,
          count: 0,
        };
      }, collectInterval);
      
      // Clean up on server stop
      server.setHooks({
        beforeStop: async () => {
          clearInterval(resetInterval);
        },
      });
      
      console.log('Metrics plugin initialized');
    },
  };
}
```

## Adding Routes With Plugins

Plugins can add new routes to your server:

```typescript
import { IServerPlugin, INandaServer } from '@modelcontextprotocol/sdk/nanda';

// Health check plugin
export const healthPlugin: IServerPlugin = {
  name: 'health',
  initialize: (server: INandaServer) => {
    // Get a router for health endpoints
    const router = server.getRouter('/health');
    
    // Add health check endpoint
    router.get('/', (req, res) => {
      res.json({
        status: 'ok',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
      });
    });
    
    // Add detailed health check
    router.get('/details', (req, res) => {
      res.json({
        status: 'ok',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
      });
    });
    
    console.log('Health plugin initialized');
  },
};
```

## Plugin Dependencies

If a plugin depends on another plugin, you can check for it in the initialize function:

```typescript
import { IServerPlugin, INandaServer } from '@modelcontextprotocol/sdk/nanda';

// Admin panel plugin (depends on auth plugin)
export const adminPlugin: IServerPlugin = {
  name: 'admin',
  initialize: (server: INandaServer) => {
    // Check if auth plugin is registered
    if (!server.hasPlugin('auth')) {
      throw new Error('Admin plugin requires auth plugin');
    }
    
    // Get auth plugin
    const authPlugin = server.getPlugin('auth');
    
    // Get router for admin endpoints
    const router = server.getRouter('/api/admin');
    
    // Add admin endpoints
    router.get('/dashboard', authPlugin.middleware.requireAdmin, (req, res) => {
      res.json({
        message: 'Admin dashboard',
        user: req.user,
      });
    });
    
    console.log('Admin plugin initialized');
  },
};
```

Note that to support this, we would need to add `hasPlugin` and `getPlugin` methods to the server interface.

## Best Practices

When creating plugins:

1. **Single Responsibility**: Each plugin should have a focused purpose
2. **Proper Cleanup**: Use hooks to clean up resources when the server stops
3. **Configuration**: Make plugins configurable for different use cases
4. **Error Handling**: Handle errors gracefully and provide useful messages
5. **Documentation**: Document your plugin's features and configuration options

## Example Plugins

See the examples directory for more plugin examples:

- Authentication plugin for user management
- Rate limiting plugin to prevent abuse
- CORS plugin for cross-origin support
- Database plugin for persistence