/**
 * Core types for the NANDA server framework
 */

import { Request, Response, NextFunction, Router, Express } from 'express';

/**
 * Server capability interface
 */
export interface IServerCapability {
  name: string;
  description: string;
  type: string;
  parameters?: ICapabilityParameter[];
  examples?: string[];
  handler?: CapabilityHandler;
}

/**
 * Capability parameter interface
 */
export interface ICapabilityParameter {
  name: string;
  description: string;
  type: string;
  required: boolean;
  default?: string;
}

/**
 * Basic server configuration
 */
export interface IServerConfig {
  /**
   * Server name
   */
  name: string;
  
  /**
   * Server description
   */
  description: string;
  
  /**
   * Server URL
   */
  url?: string;
  
  /**
   * Documentation URL
   */
  documentationUrl?: string;
  
  /**
   * Server capabilities
   */
  capabilities?: IServerCapability[];
  
  /**
   * Server types
   */
  types?: string[];
  
  /**
   * Server tags
   */
  tags?: string[];
  
  /**
   * Port to listen on (default: 8000)
   */
  port?: number;
  
  /**
   * Enable API spec validation (default: true)
   */
  validateApi?: boolean;
  
  /**
   * Path to API spec file
   */
  apiSpec?: string;
  
  /**
   * Plugins to use
   */
  plugins?: IServerPlugin[];
}

/**
 * Capability handler function
 */
export type CapabilityHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<unknown> | unknown;

/**
 * Server plugin interface
 */
export interface IServerPlugin {
  /**
   * Plugin name
   */
  name: string;
  
  /**
   * Plugin initialization function
   */
  initialize: (server: INandaServer) => void;
  
  /**
   * Plugin configuration
   */
  config?: Record<string, unknown>;
}

/**
 * NANDA server interface
 */
export interface INandaServer {
  /**
   * Express instance
   */
  app: Express;
  
  /**
   * Server configuration
   */
  config: IServerConfig;
  
  /**
   * Start the server
   * 
   * @param port - Port to listen on (overrides config.port)
   */
  start: (port?: number) => void;
  
  /**
   * Stop the server
   */
  stop: () => void;
  
  /**
   * Add a capability to the server
   * 
   * @param capability - Capability to add
   */
  addCapability: (capability: IServerCapability) => void;
  
  /**
   * Get server router for a path
   * 
   * @param path - Router path
   */
  getRouter: (path: string) => Router;
  
  /**
   * Register a plugin
   * 
   * @param plugin - Plugin to register
   */
  registerPlugin: (plugin: IServerPlugin) => void;
}

/**
 * Server lifecycle hooks
 */
export interface IServerHooks {
  /**
   * Called before the server starts
   */
  beforeStart?: (server: INandaServer) => Promise<void> | void;
  
  /**
   * Called after the server starts
   */
  afterStart?: (server: INandaServer) => Promise<void> | void;
  
  /**
   * Called before the server stops
   */
  beforeStop?: (server: INandaServer) => Promise<void> | void;
  
  /**
   * Called after the server stops
   */
  afterStop?: (server: INandaServer) => Promise<void> | void;
}