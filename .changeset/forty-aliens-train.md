---
"@keq-request/exception": major
"keq": major
---

**BREAKING CHANGE:** Refactor `RequestException`:

- Third parameter changed from `retry: boolean` to `options: { fatal: boolean, response: Response }`
- `RequestException` moved from `@keq-request/exception` to `keq`
- Add `createExceptionByStatusCode` to create HTTP exceptions from a `Response` object
- Add `validateStatusCode` middleware and plugin to validate HTTP response and throw standard exception
- Add `clarifyFetchFailed` middleware

```javascript
// Before
new RequestException(400, 'Error message', true);

// After
new RequestException(400, 'Error message', { fatal: false, response: someResponseObject });
```
