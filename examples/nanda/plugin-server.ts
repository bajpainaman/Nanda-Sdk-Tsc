/**
 * MCP server example with plugins using the NANDA framework
 */
import { createServer, IServerPlugin, INandaServer } from '../../src/nanda/index.js';

/**
 * Simple analytics plugin
 */
const analyticsPlugin: IServerPlugin = {
  name: 'analytics',
  initialize: (server: INandaServer) => {
    // Get a router for analytics endpoints
    const router = server.getRouter('/api/analytics');
    
    // Track request counts
    const requestCounts: Record<string, number> = {};
    
    // Add middleware to track requests
    server.app.use((req, res, next) => {
      const path = req.path;
      requestCounts[path] = (requestCounts[path] || 0) + 1;
      next();
    });
    
    // Add endpoint to get analytics
    router.get('/stats', (req, res) => {
      res.json({
        total_requests: Object.values(requestCounts).reduce((total, count) => total + count, 0),
        request_counts: requestCounts,
      });
    });
    
    console.log('Analytics plugin initialized');
  },
  config: {
    trackRequests: true,
  },
};

/**
 * Example plugin to add authentication capabilities
 */
const authPlugin: IServerPlugin = {
  name: 'auth',
  initialize: (server: INandaServer) => {
    // Get a router for auth endpoints
    const router = server.getRouter('/api/auth');
    
    // Simple in-memory user store (would use a database in production)
    const users: Record<string, { username: string; password: string }> = {
      'user1': { username: 'user1', password: 'password1' },
      'user2': { username: 'user2', password: 'password2' },
    };
    
    // Add login endpoint
    router.post('/login', (req, res) => {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
      }
      
      const user = users[username];
      
      if (!user || user.password !== password) {
        return res.status(401).json({ error: 'Invalid username or password' });
      }
      
      // In a real implementation, you would generate a JWT token
      return res.json({
        username,
        token: `fake-jwt-token-for-${username}`,
      });
    });
    
    console.log('Auth plugin initialized');
  },
};

/**
 * Create a server with plugins
 */
const server = createServer({
  name: 'Plugin-Based MCP Server',
  description: 'An MCP server example with plugins',
  types: ['agent', 'tool'],
  tags: ['example', 'plugins'],
  plugins: [analyticsPlugin, authPlugin],
  capabilities: [
    {
      name: 'text-generation',
      description: 'Generate text based on a prompt',
      type: 'agent',
      handler: async (req, res) => {
        const { prompt = 'Default prompt' } = req.body;
        
        return {
          text: `Response for: ${prompt}`,
          generated_at: new Date().toISOString(),
        };
      },
    },
  ],
});

// Define server hooks
server.setHooks({
  beforeStart: async (server) => {
    console.log('Server is about to start...');
  },
  afterStart: async (server) => {
    console.log('Server has started!');
  },
  beforeStop: async (server) => {
    console.log('Server is about to stop...');
  },
  afterStop: async (server) => {
    console.log('Server has stopped!');
  },
});

// Start the server
server.start(8000).then(() => {
  console.log('Server started successfully');
  console.log('Try the following endpoints:');
  console.log('- GET /api - Get server info');
  console.log('- POST /api/capabilities/text-generation - Generate text');
  console.log('- GET /api/analytics/stats - Get analytics');
  console.log('- POST /api/auth/login - Login (with username/password in body)');
});

// Handle shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down server...');
  await server.stop();
  process.exit(0);
});