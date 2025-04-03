/**
 * Simple MCP server example using the NANDA framework
 */
import { createServer } from '../../src/nanda/index.js';

/**
 * Create a simple MCP server
 */
const server = createServer({
  name: 'Simple MCP Server',
  description: 'A simple MCP server example',
  types: ['agent', 'tool'],
  tags: ['example', 'simple'],
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
          name: 'max_length',
          description: 'Maximum length of generated text',
          type: 'integer',
          required: false,
          default: '100',
        },
      ],
      handler: async (req, res) => {
        const { prompt, max_length = 100 } = req.body;
        
        // In a real server, this would call an AI model
        const response = `This is a response to: ${prompt}\n` +
          `Generated with max_length: ${max_length}\n` +
          `This is just a demonstration of the NANDA server framework.`;
          
        return {
          text: response,
          usage: {
            prompt_tokens: prompt.length,
            completion_tokens: response.length,
            total_tokens: prompt.length + response.length,
          },
        };
      },
    },
    {
      name: 'image-generation',
      description: 'Generate an image based on a prompt',
      type: 'tool',
      parameters: [
        {
          name: 'prompt',
          description: 'The input prompt',
          type: 'string',
          required: true,
        },
      ],
      handler: async (req, res) => {
        const { prompt } = req.body;
        
        // In a real server, this would generate an image
        return {
          image_url: 'https://example.com/generated-image.png',
          prompt,
        };
      },
    },
  ],
});

// Start the server
server.start(8000).then(() => {
  console.log('Server started successfully');
  console.log('Try the following endpoints:');
  console.log('- GET /api - Get server info');
  console.log('- POST /api/capabilities/text-generation - Generate text');
  console.log('- POST /api/capabilities/image-generation - Generate an image');
});

// Handle shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down server...');
  await server.stop();
  console.log('Server stopped');
  process.exit(0);
});