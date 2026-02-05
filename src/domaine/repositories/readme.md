Ports (Repository interfaces)
Use cases must depend on abstractions, not details.

If we skip ports, your use cases will call Supabase directly, and then:

testing becomes hard

replacing DB later becomes painful

domain gets polluted by infrastructure concerns

So we create interfaces that describe what the app needs from data storage.