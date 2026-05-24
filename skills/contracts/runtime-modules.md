# Runtime Module Contracts

`AGENTS.md` is the source of truth. This file explains module boundaries so agents can apply the rules without over-generalizing them.

## ThemeEvents

**Solves:** typed cross-section and cross-component communication.

**Does not solve:** local button clicks, local form changes, or Alpine-only state inside one component.

**Callers:** sections, snippets, Alpine components, and component registrations that need to publish or subscribe to shared theme events.

**Do not call when:** the behavior is fully local to one component and can use Alpine bindings or lifecycle-scoped native listeners.

**Extension boundary:** add new cross-component events to `ThemeEvents.events` in `assets/events.js`. Do not create ad-hoc `CustomEvent` objects in application code for shared behavior.

## ShopifyHttp

**Solves:** application-level HTTP requests with shared timeout, abort, headers, interceptors, and structured errors.

**Does not solve:** business state, cart state, section rendering, or UI feedback.

**Callers:** application code that needs non-cart HTTP requests, Alpine components, and stores.

**Do not call when:** the request is a cart mutation or cart state read; use `$store.cart` for `/cart/*`.

**Extension boundary:** raw `fetch()` belongs inside `assets/https.js` and vendor files. Do not add one-off request wrappers in sections.

## ShopifySectionRefresher

**Solves:** replacing Shopify section HTML returned by Section Rendering API or cart `sections` responses, while handling Alpine teardown/init and component re-initialization.

**Does not solve:** normal UI state, loading indicators, selected classes, aria toggles, navigation semantics, or cross-pathname navigation.

**Callers:** pagination/filter/search flows that refresh the same section context, cart store section responses, and dedicated section refresh components.

**Do not call when:** a browser navigation is the real behavior, a tab changes to a different collection pathname, or the update is only text/class/open state.

**Extension boundary:** keep low-level `innerHTML` and `replaceWith()` inside `SectionRefresher`. If a new flow does not share the same section identity and page context, do not add a mode flag to `SectionRefresher`; create a dedicated component or use native navigation.

## Alpine `$store.cart`

**Solves:** storefront cart state, cart endpoint calls, cart section rendering, and cart error handling.

**Does not solve:** non-cart HTTP requests, product variant state, or local component loading state.

**Callers:** buy buttons, cart page controls, cart overlay controls, and product components that mutate cart state.

**Do not call when:** the operation is not cart-related, or when reading static Liquid data is enough.

**Extension boundary:** add cart API behavior inside `assets/alpine.store.js`. Business sections should not request `/cart.js`, `/cart/add.js`, `/cart/change.js`, `/cart/clear.js`, or `/cart/update.js` directly.

## Components.register()

**Solves:** lifecycle-managed section/block behavior, third-party library setup, observers, timers, global listeners, and Shopify Theme Editor lifecycle hooks.

**Does not solve:** purely static markup or simple Alpine state.

**Callers:** Liquid sections that need JS lifecycle management.

**Do not call when:** the section has no runtime behavior, or local reactive state can be handled by an existing Alpine component.

**Extension boundary:** every registration must return cleanup state when resources are created and must implement `destroy()`.

## AlpineComponentsFactory

**Solves:** reusable Alpine behavior registration and cleanup helpers.

**Does not solve:** one-off third-party library lifecycle that belongs to a section component, or cross-section communication that belongs to `ThemeEvents`.

**Callers:** `assets/alpine.components.js` component definitions and Liquid templates that reference registered component names through `x-data`.

**Do not call when:** logic depends on a specific section's third-party instance lifecycle; use `Components.register()` instead.

**Extension boundary:** Liquid passes configuration through `data-*`. Do not embed complex Liquid objects, JSON, or functions directly in `x-data`.
