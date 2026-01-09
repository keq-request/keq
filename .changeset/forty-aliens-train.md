---
"@keq-request/exception": major
"keq": major
---

**BREAKING CHANGE:** RequestException third parameter changed from retry: boolean to options: { fatal: boolean, response: Response }

```javascript
// Before
new RequestException(400, 'Error message', true);

// After
new RequestException(400, 'Error message', { fatal: false, response: someResponseObject });
```
