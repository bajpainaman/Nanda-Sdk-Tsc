# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# MCP TypeScript SDK Guide

## Build & Test Commands
```
npm run build        # Build ESM and CJS versions
npm run lint         # Run ESLint
npm test             # Run all tests
npx jest path/to/file.test.ts  # Run specific test file
npx jest -t "test name"        # Run tests matching pattern
```

## Code Style Guidelines
- **TypeScript**: Strict type checking, ES modules, explicit return types
- **Naming**: PascalCase for classes/types, camelCase for functions/variables
- **Files**: Lowercase with hyphens, test files with `.test.ts` suffix
- **Imports**: ES module style, include `.js` extension, group imports logically
- **Error Handling**: Use TypeScript's strict mode, explicit error checking in tests
- **Formatting**: 2-space indentation, semicolons required, single quotes preferred
- **Testing**: Co-locate tests with source files, use descriptive test names
- **Comments**: JSDoc for public APIs, inline comments for complex logic

## Project Structure
- `/src`: Source code with client, server, and shared modules
- Tests alongside source files with `.test.ts` suffix
- Node.js >= 18 required

# NANDA Server Integration Plan

## Overview
This document outlines the plan for integrating the NANDA Server Demo into the TypeScript SDK. The goal is to provide developers with a comprehensive toolkit for creating, managing, and interacting with MCP servers.

## Current Status
- NANDA Server Demo exists as a standalone Express application
- TypeScript SDK provides client-side libraries for interacting with MCP servers
- Reputation system has been implemented in the SDK as a utility toolkit

## Integration Goals
1. Provide a unified toolkit for MCP server development and management
2. Make it easy for developers to create and deploy MCP-compatible servers
3. Integrate reputation and discovery features directly into the SDK
4. Offer a streamlined developer experience with minimal configuration

## Integration Strategy

### Phase 1: Core Server Framework (Immediate)
- Move NANDA server core components into the TypeScript SDK
- Create a modular server framework with pluggable components
- Implement essential server capabilities (routing, middleware, authentication)
- Provide simple server bootstrapping with minimal configuration

### Phase 2: Advanced Features (Medium-term)
- Integrate discovery and verification capabilities
- Add server registration and management features
- Implement analytics collection and reporting
- Add webhook support for server events

### Phase 3: Developer Tools (Long-term)
- Create CLI tools for server management
- Implement development utilities (hot reloading, debugging)
- Add deployment helpers for various platforms
- Create templates for common server types

## Implementation Plan

### Directory Structure
```
src/
├── client/         (existing - client-side SDK)
├── server/         (existing - server-side SDK)
├── reputation/     (existing - reputation system)
├── nanda/          (new - NANDA server framework)
│   ├── core/       (server core functionality)
│   ├── discovery/  (server discovery features)
│   ├── auth/       (authentication & authorization)
│   ├── analytics/  (usage tracking & reporting)
│   ├── verification/ (server verification tools)
│   └── webhooks/   (event notification system)
├── cli/            (new - command-line tools)
└── shared/         (existing - shared utilities)
```

### Implementation Tasks

#### 1. Core Server Framework

1.1. Move Core Server Components
- [ ] Create `/src/nanda/core` directory structure
- [ ] Adapt server initialization code from NANDA demo
- [ ] Implement middleware framework
- [ ] Create modular routing system

1.2. Implement Extensibility Framework
- [ ] Create plugin architecture for server extensions
- [ ] Implement configuration system
- [ ] Create server lifecycle hooks

1.3. Server API Implementation
- [ ] Define core server interfaces
- [ ] Implement server initialization and configuration
- [ ] Add basic server bootstrapping

#### 2. Authentication & Authorization

2.1. JWT Authentication 
- [ ] Move JWT implementation from NANDA demo
- [ ] Create consistent auth middleware
- [ ] Implement token validation and refreshing

2.2. User Management
- [ ] Implement user registration and management
- [ ] Create role-based permissions
- [ ] Add API key generation for server-to-server auth

#### 3. Server Discovery

3.1. Registry Features
- [ ] Implement server registration API
- [ ] Create server metadata management
- [ ] Add server capability documentation

3.2. Discovery API
- [ ] Create search API with filtering
- [ ] Implement sorting and pagination
- [ ] Add recommendation features

#### 4. Additional Features

4.1. Analytics
- [ ] Implement request logging
- [ ] Create usage tracking features
- [ ] Add performance monitoring

4.2. Verification
- [ ] Move verification system from NANDA demo
- [ ] Implement ownership verification
- [ ] Add health check features

4.3. Webhooks
- [ ] Implement webhook subscription API
- [ ] Create webhook delivery system
- [ ] Add webhook testing tools

### Developer Experience Enhancements

1. Documentation 
- [ ] Create comprehensive API documentation
- [ ] Add getting started guides
- [ ] Create tutorials for common use cases

2. Examples
- [ ] Create example servers for different use cases
- [ ] Add example client implementations
- [ ] Create starter templates

3. CLI Tools
- [ ] Create `nanda init` for project initialization
- [ ] Add `nanda dev` for development server
- [ ] Implement `nanda deploy` for deployment

## API Design Principles

1. **Consistency**: Maintain consistent naming and patterns across all APIs
2. **Simplicity**: Make common tasks simple, complex tasks possible
3. **Flexibility**: Allow developers to customize behavior as needed
4. **Progressive Disclosure**: Simple defaults with option for advanced configuration
5. **Type Safety**: Strong TypeScript typings throughout the SDK

## Example Usage

```typescript
// Simple MCP server
import { createServer } from '@modelcontextprotocol/sdk/nanda';

const server = createServer({
  name: 'My MCP Server',
  description: 'A simple MCP server',
  capabilities: ['text-generation', 'image-generation']
});

server.start(8000);
```

```typescript
// Advanced MCP server with plugins
import { createServer } from '@modelcontextprotocol/sdk/nanda';
import { analyticsPlugin } from '@modelcontextprotocol/sdk/nanda/analytics';
import { discoveryPlugin } from '@modelcontextprotocol/sdk/nanda/discovery';

const server = createServer({
  name: 'Advanced MCP Server',
  description: 'An MCP server with analytics and discovery',
  plugins: [
    analyticsPlugin({ trackUsage: true }),
    discoveryPlugin({ autoRegister: true })
  ]
});

// Add custom capability
server.addCapability({
  name: 'custom-capability',
  description: 'A custom capability',
  handler: async (request) => {
    // Handle the capability request
    return { result: 'Custom capability response' };
  }
});

server.start(8000);
```

## Next Steps

1. Begin with the core server framework implementation
2. Create a minimal viable product for testing
3. Gather feedback from developers
4. Iterate on the implementation based on feedback