# Local JSON Persistence and Demo Reset Architecture for Client Pitch

For the client pitch mockup, data will be served and mutated through an in-memory client state store initialized from `mockup.json` and backed by browser `localStorage`, with an explicit one-click "Reset Demo Data" action. This provides instant, reliable zero-latency interaction with realistic data during executive presentations while preventing real backend provisioning costs or data corruption during live rehearsals.

