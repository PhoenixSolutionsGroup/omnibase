---
title: Overview
description: API and SDK reference documentation
---

# Reference

Complete technical reference for the OmniBase platform. This section provides detailed specifications for integrating with OmniBase in your applications.

> **Note:**
All API endpoints are versioned and documented with OpenAPI specifications. SDKs are generated from these specs to ensure consistency.

## REST API

Programmatic access to all platform features. The API is organized into logical domains covering authentication, multi-tenancy, payments, and more.

- **[Authentication](/docs/reference/api/v1/auth)**
    Session management, user identity, and authentication flows
- **[Configuration](/docs/reference/api/v1/configuration)**
    Database migrations, email templates, permissions, and Stripe config management
- **[Events](/docs/reference/api/v1/events)**
    Real-time WebSocket connections for platform events
- **[Payments](/docs/reference/api/v1/payments)**
    Checkout sessions, invoices, metered usage, and customer portals
- **[Permissions](/docs/reference/api/v1/permissions)**
    Relationship-based access control and authorization checks
- **[Storage](/docs/reference/api/v1/storage)**
    File upload, download, and object management
- **[Stripe](/docs/reference/api/v1/stripe)**
    Product, price, and meter lookups from your Stripe configuration
- **[Tenants](/docs/reference/api/v1/tenants)**
    Multi-tenancy, roles, subscriptions, invitations, and team management
- **[Webhooks](/docs/reference/api/v1/webhooks)**
    Configure endpoints and retrieve signing secrets

## SDKs

Framework-specific libraries that wrap the REST API with idiomatic interfaces and additional functionality.

- **[Next.js SDK](/docs/reference/sdk/nextjs)**
    Server and client components for authentication, session management, and middleware
- **[React SDK](/docs/reference/sdk/react)**
    Hooks and components for building authenticated interfaces
- **[shadcn/ui Components](/docs/reference/sdk/shadcn)**
    Pre-built UI components for authentication and tenant management

## CLI

- **[Command Line Interface](/docs/reference/cli)**
    Project management, deployments, and administrative tasks
