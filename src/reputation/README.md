# NANDA Reputation System

This module provides a toolkit for building reputation systems for MCP servers in the NANDA protocol. It's designed to be flexible, allowing developers to implement their own reputation algorithms while providing common building blocks and utilities.

## Note on Implementation Status

**IMPORTANT**: This is currently a prototype implementation and is not fully functional. The client methods don't have proper schema implementations yet, and the API endpoints don't exist in the server. This code serves as a design reference for how the reputation system could be implemented.

## Directory Structure

```
/reputation/
├── README.md               # This file
├── types/                  # Type definitions
│   └── types.ts            # Core reputation data types
├── client/                 # API clients
│   ├── index.ts            # Main reputation client
│   ├── data.ts             # Data collection client
│   ├── reviews.ts          # Review management client
│   └── verification.ts     # Verification client
└── utils/                  # Utilities
    ├── algorithm.ts        # Algorithm interfaces and helpers
    ├── storage.ts          # Storage adapters
    └── badge-generator.ts  # Badge generation utilities
```

## Key Components

### Clients

The module provides several clients for working with reputation data:

- `ReputationClient`: Main client that brings everything together
- `ReputationDataClient`: Client for collecting reputation-related data
- `ReviewClient`: Client for managing user reviews
- `VerificationClient`: Client for working with verification information

### Data Types

The module defines several TypeScript interfaces for reputation data:

- `IReputationDataComponents`: Components that can inform reputation calculations
- `IReputationScore`: Common interface for reputation scores
- `IUserReview`: Structure for user-submitted reviews
- `IVerificationStatus`: Structure for verification-related data

### Utilities

The module includes several utilities:

- Algorithm interfaces and helpers (time decay, normalization, etc.)
- Storage adapters for reputation data
- Badge generation utilities for displaying reputation

## Usage

Import the components you need from the module:

```typescript
import { 
  ReputationClient,
  createWeightedAlgorithm,
  generateReputationBadgeHtml
} from '@modelcontextprotocol/sdk/reputation';
```

See the [documentation](../../docs/reputation-system.md) for examples and best practices.

## Development

When making changes to this module:

1. Update the appropriate TypeScript interfaces
2. Add tests for new functionality
3. Update the documentation
4. Consider backward compatibility

## Testing

Run tests for the reputation module:

```bash
npm test -- src/reputation
```