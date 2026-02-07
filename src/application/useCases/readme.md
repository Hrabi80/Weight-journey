# Application Use Cases

## Purpose
This folder contains **use cases**, which represent the actions
your application can perform.

Examples:
- Create a profile
- Log today's weight
- Load dashboard data
- Update profile information

A use case expresses **business intent**, not technical details.

## Responsibilities of a Use Case
A use case is responsible for:
- validating input data
- enforcing business rules
- orchestrating calls to repository ports
- returning data in a form useful for the UI

A use case must NOT:
- know about Supabase
- know about HTTP or Next.js
- contain UI logic
- return database-specific objects

## Typical flow inside a use case
1. Depend on Validate input (Zod) in folder validation
2. Normalize data if needed
3. Check business rules (uniqueness, limits, ownership)
4. Call repository interfaces
5. Return a clean result or throw a meaningful error

## Examples in this project
- `CreateProfileUseCase`
- `UpdateProfileUseCase`
- `LogWeightEntryUseCase`

## Dependency rule
This folder:
- **depends on**: `domain`, `application/ports`
- **validation**:  `application`, `application/validation`
- **must NOT depend on**: `infrastructure`, `interfaces`, or frameworks