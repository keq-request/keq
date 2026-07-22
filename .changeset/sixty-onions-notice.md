---
"keq": major
---

**BREAKING CHANGE:** Refactoring keq middlewares

- `retryMiddleware`, `proxyResponseMiddleware`, `fetchArgumentMiddleware` be removed.
- `abortFlowControlMiddleware` and `serialFlowControlMiddleware` merged into `flowControlMiddleware`.
- `ctx.metadata` has been removed, please use `ctx.orchestrator` instead.
- `.retry()` will rerun all middlewares now, assert `ctx.data.retry.attempt` if middleware is not expect to be run.
- `ctx.options.retryOn`, `ctx.options.retryTimes` and `ctx.options.retryDelay` are replaced by `ctx.options.retry.on`, `ctx.options.retry.times` and `ctx.options.retry.delay`.
- `.option("resolveWithResponse")` had be removed, please use `.resolveWith('response')` instead.
- `next` cannot be run multi-times now.
- Some typescript type names have changed.
- `ctx.request.routeParams` is renamed to `ctx.request.pathParameters`
- `appendMiddlewares` and `prependMiddlewares` removed from Keq.
- Immutable properties of the context are now protected from modification.
