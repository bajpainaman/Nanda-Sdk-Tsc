# MCP SDK Overview

The Model Context Protocol (MCP) SDK provides a standardized way for applications to interact with large language models (LLMs), separating the concerns of providing context from the actual LLM interaction.

## Introduction

The MCP SDK implements the full MCP specification, making it easy to:

- Build MCP clients that can connect to any MCP server
- Create MCP servers that expose resources, prompts, and tools
- Use standard transports like stdio and SSE
- Handle all MCP protocol messages and lifecycle events

## Core Components

The SDK consists of several key components:

### Client

The client module provides functionality for connecting to and interacting with MCP servers. It handles:

- Server initialization and connection
- Resource management
- Tool execution
- Prompt management
- Completion requests

### Server

The server module allows you to create MCP-compatible servers that can:

- Expose resources for context
- Provide tools for client use
- Define prompts for specific use cases
- Handle completion requests

### Shared

The shared module contains common utilities and types used by both client and server components:

- Protocol implementation
- Transport mechanisms
- Authentication
- Type definitions

## Getting Started

To get started with the MCP SDK, see the main [README.md](../../README.md) file, which includes installation instructions and quick start guides.

## Documentation

For more detailed documentation on specific areas of the SDK:

- [Client API](./client.md): Details on using the MCP client
- [Server API](./server.md): Information on creating MCP servers

## Extensions

The SDK includes additional extensions beyond the core MCP specification:

- [NANDA Server Framework](../nanda/index.md): A framework for building MCP servers with enhanced features
- [Reputation System](../reputation-system.md): Tools for building trust in the MCP ecosystem