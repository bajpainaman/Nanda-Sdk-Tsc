/**
 * Core NANDA server implementation
 */

import express, { Express, Router } from 'express';
import path from 'path';
import morgan from 'morgan';
import cors from 'cors';
import helmet from 'helmet';
import { middleware as OpenApiValidatorMiddleware } from 'express-openapi-validator';

import { 
  IServerConfig, 
  INandaServer, 
  IServerCapability,
  IServerPlugin,
  IServerHooks
} from './types.js';
import { errorMiddleware } from './middleware/error.js';
import { notFoundMiddleware } from './middleware/not-found.js';

/**
 * Default server configuration
 */
const defaultConfig: Partial<IServerConfig> = {
  port: 8000,
  validateApi: true,
};

/**
 * NANDA server implementation
 */
export class NandaServer implements INandaServer {
  /**
   * Express application instance
   */
  app: Express;
  
  /**
   * Server configuration
   */
  config: IServerConfig;
  
  /**
   * Server capabilities
   */
  private capabilities: Map<string, IServerCapability> = new Map();
  
  /**
   * Server plugins
   */
  private plugins: Map<string, IServerPlugin> = new Map();
  
  /**
   * Server routers
   */
  private routers: Map<string, Router> = new Map();
  
  /**
   * Server instance
   */
  private server: unknown;
  
  /**
   * Server hooks
   */
  private hooks: IServerHooks = {};
  
  /**
   * Constructor
   * 
   * @param config - Server configuration
   */
  constructor(config: IServerConfig) {
    this.config = { ...defaultConfig, ...config };
    this.app = express();
    
    // Initialize capabilities
    if (this.config.capabilities) {
      for (const capability of this.config.capabilities) {
        this.addCapability(capability);
      }
    }
    
    // Initialize plugins
    if (this.config.plugins) {
      for (const plugin of this.config.plugins) {
        this.registerPlugin(plugin);
      }
    }
    
    // Setup middleware
    this.setupMiddleware();
    
    // Setup routers
    this.setupRouters();
  }
  
  /**
   * Setup middleware
   */
  private setupMiddleware(): void {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(morgan('dev'));
    this.app.use(cors());
    this.app.use(helmet());
    
    // API validation if enabled and spec is provided
    if (this.config.validateApi && this.config.apiSpec) {
      this.app.use(
        OpenApiValidatorMiddleware({
          apiSpec: this.config.apiSpec,
          validateRequests: true,
          validateResponses: false,
          validateApiSpec: false,
        })
      );
      
      // Serve the OpenAPI spec
      const specPath = path.dirname(this.config.apiSpec);
      const specFile = path.basename(this.config.apiSpec);
      this.app.use('/spec', express.static(specPath));
      
      console.log(`API Spec available at http://localhost:${this.config.port}/spec/${specFile}`);
    }
  }
  
  /**
   * Setup routers
   */
  private setupRouters(): void {
    // Default API route
    this.app.get('/api', (req, res) => {
      res.json({
        name: this.config.name,
        description: this.config.description,
        capabilities: Array.from(this.capabilities.values()).map(c => ({
          name: c.name,
          description: c.description,
          type: c.type,
        })),
      });
    });
    
    // Debug route (development only)
    if (process.env.NODE_ENV !== 'production') {
      this.app.get('/debug/info', (req, res) => {
        res.json({
          name: this.config.name,
          description: this.config.description,
          capabilities: Array.from(this.capabilities.values()).map(c => c.name),
          plugins: Array.from(this.plugins.values()).map(p => p.name),
        });
      });
    }
    
    // Add error and not-found handlers (these should be last)
    this.app.use(notFoundMiddleware);
    this.app.use(errorMiddleware);
  }
  
  /**
   * Start the server
   * 
   * @param port - Port to listen on (overrides config.port)
   */
  async start(port?: number): Promise<void> {
    const serverPort = port || this.config.port || 8000;
    
    if (this.hooks.beforeStart) {
      await this.hooks.beforeStart(this);
    }
    
    return new Promise((resolve) => {
      this.server = this.app.listen(serverPort, () => {
        console.log(`Server is running on http://localhost:${serverPort}`);
        
        if (this.hooks.afterStart) {
          Promise.resolve(this.hooks.afterStart(this)).then(() => resolve());
        } else {
          resolve();
        }
      });
    });
  }
  
  /**
   * Stop the server
   */
  async stop(): Promise<void> {
    if (!this.server) {
      return;
    }
    
    if (this.hooks.beforeStop) {
      await this.hooks.beforeStop(this);
    }
    
    return new Promise((resolve, reject) => {
      if (typeof this.server === 'object' && this.server !== null && 'close' in this.server) {
        const serverWithClose = this.server as { close: (callback: (err?: Error) => void) => void };
        
        serverWithClose.close(async (err?: Error) => {
          if (err) {
            reject(err);
            return;
          }
          
          if (this.hooks.afterStop) {
            await this.hooks.afterStop(this);
          }
          
          this.server = null;
          resolve();
        });
      } else {
        reject(new Error('Server is not running or does not have a close method'));
      }
    });
  }
  
  /**
   * Add a capability to the server
   * 
   * @param capability - Capability to add
   */
  addCapability(capability: IServerCapability): void {
    if (this.capabilities.has(capability.name)) {
      throw new Error(`Capability with name ${capability.name} already exists`);
    }
    
    this.capabilities.set(capability.name, capability);
    
    // If the capability has a handler, register it
    if (capability.handler) {
      const router = this.getRouter('/api/capabilities');
      router.post(`/${capability.name}`, async (req, res, next) => {
        try {
          const result = await capability.handler!(req, res, next);
          
          // If the handler returns a value, send it as JSON
          // Otherwise, assume the handler has already sent a response
          if (result !== undefined && !res.headersSent) {
            res.json(result);
          }
        } catch (error) {
          next(error);
        }
      });
    }
  }
  
  /**
   * Get a router for a path
   * 
   * @param path - Router path
   * @returns Express router
   */
  getRouter(path: string): Router {
    if (!this.routers.has(path)) {
      const router = express.Router();
      this.app.use(path, router);
      this.routers.set(path, router);
    }
    
    return this.routers.get(path)!;
  }
  
  /**
   * Register a plugin
   * 
   * @param plugin - Plugin to register
   */
  registerPlugin(plugin: IServerPlugin): void {
    if (this.plugins.has(plugin.name)) {
      throw new Error(`Plugin with name ${plugin.name} already exists`);
    }
    
    this.plugins.set(plugin.name, plugin);
    plugin.initialize(this);
  }
  
  /**
   * Register server lifecycle hooks
   * 
   * @param hooks - Server hooks
   */
  setHooks(hooks: IServerHooks): void {
    this.hooks = { ...this.hooks, ...hooks };
  }
}

/**
 * Create a new NANDA server
 * 
 * @param config - Server configuration
 * @returns NANDA server instance
 */
export function createServer(config: IServerConfig): INandaServer {
  return new NandaServer(config);
}