# Application Ports (Repository Interfaces)

## Purpose
This folder contains **ports** (interfaces) that define how the Application layer
communicates with external systems such as databases.

In Clean Architecture:
- Use cases depend on **interfaces**, not implementations.
- Databases and frameworks are considered **details**.
- Ports describe **what the application needs**, not how it is done.

## Why this matters
By depending on interfaces:
- Business rules remain independent from Supabase or any database.
- We can replace the persistence layer without changing use cases.
- Use cases become easy to test using mock or fake repositories.

## What lives here
Each file defines an interface used by use cases:

- `ProfileRepository`
  - create a profile
  - find a profile by username
  - find a profile by auth user id

- `WeightRepository`
  - create or update a weight entry
  - fetch weight entries for charts

- `WellnessRepository`
  - create or update wellness entries
  - fetch wellness entries per metric

## What does NOT belong here
❌ Supabase queries  
❌ SQL  
❌ Next.js code  
❌ HTTP logic  

Those belong to the Infrastructure layer.

## Dependency rule
This folder:
- **depends on**: `domain`
- **must NOT depend on**: `infrastructure`, `interfaces`, or frameworks

Implementations of these interfaces live in:
`src/infrastructure/`
