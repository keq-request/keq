---
"keq": major
---

**BREAKING CHANGE:** Refactor event emitter. `fetch` event has been removed, please use `fetch:before`/`fetch:after` instead.

- add new function `.on(eventName, callback)` listen keq events
- add new event `fetch:before`
- add new event `fetch:after`
- add new event `middleware:before`
- add new event `middleware:after`
- add new event `timeout`
- add new event `abort`
- add new event `error`
- add new event `retry`
- add event listener support to `KeqRequest` instances
