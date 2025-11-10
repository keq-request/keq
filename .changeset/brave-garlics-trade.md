---
"keq": major
---

**BREAKING CHANGE:** Add an options to control query serialization.

- `.query({ a: [1, 2]})` => `?a[0]=1&a[1]=2`
- `.query({ a: [1, 2]}, { arrayFormat: 'brackets' })` => `?a[]=1&a[]=2`(default in keq@2)
- `.query({ a: [1, 2]}, { arrayFormat: 'repeat' })` => `?a=1&a=2`
- `.query({ a: [1, 2]}, { arrayFormat: 'comma' })` => `?a=1,2`
