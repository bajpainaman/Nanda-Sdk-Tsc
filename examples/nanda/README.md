# NANDA Server Examples

This directory contains examples of using the NANDA server framework, a fork of MCP that maintains backward compatibility, to build MCP-compatible servers.

## Examples

### Basic Examples
- `simple-server.ts`: A basic MCP server with text and image generation capabilities
- `plugin-server.ts`: A more advanced server using plugins for analytics and authentication

## Running the Examples

To run an example:

```bash
# Build the SDK
npm run build

# Run an example using ts-node
npx ts-node examples/nanda/simple-server.ts
```

## Example Details

### simple-server.ts

This example demonstrates:
- Creating a basic NANDA server
- Defining multiple capabilities (text-generation and image-generation)
- Setting up capability parameters
- Implementing capability handlers
- Starting and stopping the server gracefully

### plugin-server.ts

This example demonstrates:
- Creating and using plugins to extend server functionality
- Adding analytics capabilities
- Implementing authentication
- Using server lifecycle hooks
- Custom routing

## Testing the Server

Once the server is running, you can test it using curl:

### Simple Server Example

```bash
# Get server info
curl http://localhost:8000/api

# Generate text
curl -X POST http://localhost:8000/api/capabilities/text-generation \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Tell me a joke","max_length":200}'

# Generate an image
curl -X POST http://localhost:8000/api/capabilities/image-generation \
  -H "Content-Type: application/json" \
  -d '{"prompt":"A beautiful sunset"}'
```

### Plugin Server Example

```bash
# Get server info
curl http://localhost:8000/api

# Generate text
curl -X POST http://localhost:8000/api/capabilities/text-generation \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Hello world"}'

# Get analytics
curl http://localhost:8000/api/analytics/stats

# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"user1","password":"password1"}'
```

## Next Steps

After exploring these examples, you can:

1. Check the [NANDA documentation](../../docs/nanda/) for detailed API information about this MCP fork
2. Create your own custom plugins to extend server functionality
3. Implement advanced features like rate limiting and database integration
4. Build a production-ready MCP server using the NANDA framework