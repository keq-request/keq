import { describe, expect, it } from '@jest/globals'
import os from 'os'
import path from 'path'
import fs from 'fs-extra'
import { IgnoreMatcher, IgnoreMatcherRule } from './ignore-matcher.js'
import type { ModuleDefinition, OperationDefinition } from '../models/index.js'


function makeRule(moduleName: string, operationMethod: string, operationPathname: string, ignore = true): IgnoreMatcherRule {
  return { persist: false, ignore, moduleName, operationMethod, operationPathname }
}

function makeOperation(moduleName: string, method: string, pathname: string): OperationDefinition {
  return { module: { name: moduleName }, method, pathname } as unknown as OperationDefinition
}

function makeModule(name: string): ModuleDefinition {
  return { name } as unknown as ModuleDefinition
}

// ─── isOperationIgnored ──────────────────────────────────────────────────────

describe('IgnoreMatcher.isOperationIgnored', () => {
  describe('exact match (backward-compatible)', () => {
    it('matches exact module / method / pathname', () => {
      const matcher = new IgnoreMatcher([makeRule('petStore', 'get', '/pets')])
      expect(matcher.isOperationIgnored(makeOperation('petStore', 'get', '/pets'))).toBe(true)
    })

    it('does not match wrong method', () => {
      const matcher = new IgnoreMatcher([makeRule('petStore', 'get', '/pets')])
      expect(matcher.isOperationIgnored(makeOperation('petStore', 'post', '/pets'))).toBe(false)
    })

    it('does not match wrong pathname', () => {
      const matcher = new IgnoreMatcher([makeRule('petStore', 'get', '/pets')])
      expect(matcher.isOperationIgnored(makeOperation('petStore', 'get', '/owners'))).toBe(false)
    })
  })

  describe('** wildcard (new "match all" syntax)', () => {
    it('** on all fields matches any operation', () => {
      const matcher = new IgnoreMatcher([makeRule('**', '**', '**')])
      expect(matcher.isOperationIgnored(makeOperation('anyModule', 'delete', '/a/b/c'))).toBe(true)
    })

    it('** on pathname matches deeply-nested path', () => {
      const matcher = new IgnoreMatcher([makeRule('petStore', '**', '**')])
      expect(matcher.isOperationIgnored(makeOperation('petStore', 'post', '/v1/users/123/orders'))).toBe(true)
    })
  })

  describe('pathname glob', () => {
    it('/api/v1/* matches single-segment path', () => {
      const matcher = new IgnoreMatcher([makeRule('**', '**', '/api/v1/*')])
      expect(matcher.isOperationIgnored(makeOperation('svc', 'get', '/api/v1/users'))).toBe(true)
    })

    it('/api/v1/* does NOT match multi-segment path', () => {
      const matcher = new IgnoreMatcher([makeRule('**', '**', '/api/v1/*')])
      expect(matcher.isOperationIgnored(makeOperation('svc', 'get', '/api/v1/users/123'))).toBe(false)
    })

    it('/api/v1/** matches multi-segment path', () => {
      const matcher = new IgnoreMatcher([makeRule('**', '**', '/api/v1/**')])
      expect(matcher.isOperationIgnored(makeOperation('svc', 'get', '/api/v1/users/123'))).toBe(true)
    })

    it('/api/v1/** also matches single-segment path', () => {
      const matcher = new IgnoreMatcher([makeRule('**', '**', '/api/v1/**')])
      expect(matcher.isOperationIgnored(makeOperation('svc', 'post', '/api/v1/orders'))).toBe(true)
    })

    it('/api/v1/** does NOT match /api/v2/something', () => {
      const matcher = new IgnoreMatcher([makeRule('**', '**', '/api/v1/**')])
      expect(matcher.isOperationIgnored(makeOperation('svc', 'get', '/api/v2/orders'))).toBe(false)
    })
  })

  describe('moduleName glob', () => {
    it('pet* matches modules starting with "pet"', () => {
      const matcher = new IgnoreMatcher([makeRule('pet*', '**', '**')])
      expect(matcher.isOperationIgnored(makeOperation('petStore', 'get', '/pets'))).toBe(true)
    })

    it('pet* does NOT match unrelated module', () => {
      const matcher = new IgnoreMatcher([makeRule('pet*', '**', '**')])
      expect(matcher.isOperationIgnored(makeOperation('userService', 'get', '/users'))).toBe(false)
    })
  })

  describe('operationMethod glob', () => {
    it('{get,post} matches GET and POST', () => {
      const matcher = new IgnoreMatcher([makeRule('**', '{get,post}', '**')])
      expect(matcher.isOperationIgnored(makeOperation('svc', 'get', '/users'))).toBe(true)
      expect(matcher.isOperationIgnored(makeOperation('svc', 'post', '/users'))).toBe(true)
    })

    it('{get,post} does NOT match DELETE', () => {
      const matcher = new IgnoreMatcher([makeRule('**', '{get,post}', '**')])
      expect(matcher.isOperationIgnored(makeOperation('svc', 'delete', '/users'))).toBe(false)
    })
  })

  describe('exception rule (!ignore)', () => {
    it('exception rule overrides prior ignore rule (first match wins, rules inserted via unshift)', () => {
      // exception rule has higher priority (added last via unshift in append())
      const matcher = new IgnoreMatcher([
        makeRule('petStore', 'get', '/pets', false), // exception: do NOT ignore
        makeRule('petStore', '**', '**', true), // ignore all
      ])
      // First rule matches, ignore=false → not ignored
      expect(matcher.isOperationIgnored(makeOperation('petStore', 'get', '/pets'))).toBe(false)
    })
  })
})

// ─── isModuleIgnored ─────────────────────────────────────────────────────────

describe('IgnoreMatcher.isModuleIgnored', () => {
  it('returns true when module has a ** ** ** rule', () => {
    const matcher = new IgnoreMatcher([makeRule('**', '**', '**')])
    expect(matcher.isModuleIgnored(makeModule('petStore'))).toBe(true)
  })

  it('returns true when module matches by name with ** ** rule', () => {
    const matcher = new IgnoreMatcher([makeRule('petStore', '**', '**')])
    expect(matcher.isModuleIgnored(makeModule('petStore'))).toBe(true)
  })

  it('returns false for a different module name', () => {
    const matcher = new IgnoreMatcher([makeRule('petStore', '**', '**')])
    expect(matcher.isModuleIgnored(makeModule('userService'))).toBe(false)
  })

  it('returns false when method does not cover all (e.g., rule is "get" only)', () => {
    const matcher = new IgnoreMatcher([makeRule('**', 'get', '**')])
    expect(matcher.isModuleIgnored(makeModule('petStore'))).toBe(false)
  })

  it('returns false when pathname does not cover all (e.g., /api/v1/**)', () => {
    const matcher = new IgnoreMatcher([makeRule('**', '**', '/api/v1/**')])
    expect(matcher.isModuleIgnored(makeModule('petStore'))).toBe(false)
  })

  it('returns false when an exception rule matches the module', () => {
    const matcher = new IgnoreMatcher([
      makeRule('petStore', 'get', '/pets', false), // exception
      makeRule('**', '**', '**', true),
    ])
    expect(matcher.isModuleIgnored(makeModule('petStore'))).toBe(false)
  })
})

// ─── IgnoreMatcher.parse ─────────────────────────────────────────────────────

describe('IgnoreMatcher.parse', () => {
  it('parses [deny] section correctly', () => {
    const content = `
[deny]
GET   petStore:/pets
*     userService:/**
`
    const matcher = IgnoreMatcher.parse(content)
    expect(matcher.isOperationIgnored(makeOperation('petStore', 'get', '/pets'))).toBe(true)
    expect(matcher.isOperationIgnored(makeOperation('userService', 'post', '/users'))).toBe(true)
  })

  it('parses [allow] section correctly', () => {
    const content = `
[deny]
*     petStore:/**

[allow]
GET   petStore:/pets/details
`
    const matcher = IgnoreMatcher.parse(content)
    expect(matcher.isOperationIgnored(makeOperation('petStore', 'get', '/pets/details'))).toBe(false)
    expect(matcher.isOperationIgnored(makeOperation('petStore', 'post', '/pets'))).toBe(true)
  })

  it('[allow] rule wins over [deny] for same triple (dedup keeps allow)', () => {
    const content = `
[deny]
GET   petStore:/pets

[allow]
GET   petStore:/pets
`
    const matcher = IgnoreMatcher.parse(content)
    expect(matcher.isOperationIgnored(makeOperation('petStore', 'get', '/pets'))).toBe(false)
  })

  it('ignores comment lines', () => {
    const content = `
# this is a comment
[deny]
# another comment
GET   petStore:/pets
`
    const matcher = IgnoreMatcher.parse(content)
    expect(matcher.isOperationIgnored(makeOperation('petStore', 'get', '/pets'))).toBe(true)
  })

  it('ignores lines before any section header', () => {
    const content = `
GET   petStore:/pets
[deny]
POST  orderService:/orders
`
    const matcher = IgnoreMatcher.parse(content)
    expect(matcher.isOperationIgnored(makeOperation('petStore', 'get', '/pets'))).toBe(false)
    expect(matcher.isOperationIgnored(makeOperation('orderService', 'post', '/orders'))).toBe(true)
  })

  it('handles CRLF line endings', () => {
    const content = '[deny]\r\nGET   petStore:/pets\r\n'
    const matcher = IgnoreMatcher.parse(content)
    expect(matcher.isOperationIgnored(makeOperation('petStore', 'get', '/pets'))).toBe(true)
  })

  it('method matching is case-insensitive', () => {
    const content = '[deny]\nGET   petStore:/pets\n'
    const matcher = IgnoreMatcher.parse(content)
    expect(matcher.isOperationIgnored(makeOperation('petStore', 'GET', '/pets'))).toBe(true)
  })

  it('throws on invalid rule line', () => {
    const content = '[deny]\nbadline\n'
    expect(() => IgnoreMatcher.parse(content)).toThrow('Invalid filter rule')
  })

  it('parses only [allow] section with no [deny]', () => {
    const content = '[allow]\nGET   petStore:/pets\n'
    const matcher = IgnoreMatcher.parse(content)
    expect(matcher.isOperationIgnored(makeOperation('petStore', 'get', '/pets'))).toBe(false)
    expect(matcher.isOperationIgnored(makeOperation('petStore', 'post', '/others'))).toBe(false)
  })
})

// ─── IgnoreMatcher.write ─────────────────────────────────────────────────────

describe('IgnoreMatcher.write', () => {
  it('writes [deny] and [allow] sections with aligned columns', async () => {
    const rules: IgnoreMatcherRule[] = [
      { persist: true, ignore: true, moduleName: 'petStore', operationMethod: 'get', operationPathname: '/pets' },
      { persist: true, ignore: true, moduleName: 'userService', operationMethod: 'delete', operationPathname: '/**' },
      { persist: true, ignore: false, moduleName: 'petStore', operationMethod: 'get', operationPathname: '/pets/details' },
    ]
    const matcher = new IgnoreMatcher(rules)
    const tmpFile = path.join(os.tmpdir(), `keqfilter-test-${Date.now()}.keqfilter`)

    try {
      await matcher.write(tmpFile)
      const content = await fs.readFile(tmpFile, 'utf-8')

      expect(content).toContain('[deny]')
      expect(content).toContain('[allow]')
      // DELETE is longest method (6 chars) → padEnd(8) → "DELETE  "
      expect(content).toMatch(/DELETE {2}userService:\/\*\*/)
      // GET is 3 chars → padEnd(8) → "GET     " (5 spaces)
      expect(content).toMatch(/GET {5}petStore:\/pets$/m)
    } finally {
      await fs.remove(tmpFile)
    }
  })

  it('omits [allow] section when there are no allow rules', async () => {
    const rules: IgnoreMatcherRule[] = [
      { persist: true, ignore: true, moduleName: '*', operationMethod: '*', operationPathname: '**' },
    ]
    const matcher = new IgnoreMatcher(rules)
    const tmpFile = path.join(os.tmpdir(), `keqfilter-test-${Date.now()}.keqfilter`)

    try {
      await matcher.write(tmpFile)
      const content = await fs.readFile(tmpFile, 'utf-8')
      expect(content).toContain('[deny]')
      expect(content).not.toContain('[allow]')
    } finally {
      await fs.remove(tmpFile)
    }
  })

  it('omits [deny] section when there are no deny rules', async () => {
    const rules: IgnoreMatcherRule[] = [
      { persist: true, ignore: false, moduleName: 'petStore', operationMethod: 'get', operationPathname: '/pets' },
    ]
    const matcher = new IgnoreMatcher(rules)
    const tmpFile = path.join(os.tmpdir(), `keqfilter-test-${Date.now()}.keqfilter`)

    try {
      await matcher.write(tmpFile)
      const content = await fs.readFile(tmpFile, 'utf-8')
      expect(content).not.toContain('[deny]')
      expect(content).toContain('[allow]')
    } finally {
      await fs.remove(tmpFile)
    }
  })

  it('does not persist rules with persist=false, and does not create the file', async () => {
    const rules: IgnoreMatcherRule[] = [
      { persist: false, ignore: true, moduleName: 'petStore', operationMethod: 'get', operationPathname: '/pets' },
    ]
    const matcher = new IgnoreMatcher(rules)
    const tmpFile = path.join(os.tmpdir(), `keqfilter-test-${Date.now()}.keqfilter`)

    try {
      await matcher.write(tmpFile)
      expect(await fs.exists(tmpFile)).toBe(false)
    } finally {
      await fs.remove(tmpFile)
    }
  })

  it('round-trips: parse then write produces parseable output with same semantics', async () => {
    const original = `[deny]
*       userService:/**
GET     petStore:/pets

[allow]
GET     petStore:/pets/details
`
    const matcher = IgnoreMatcher.parse(original)
    const tmpFile = path.join(os.tmpdir(), `keqfilter-test-${Date.now()}.keqfilter`)

    try {
      await matcher.write(tmpFile)
      const written = await fs.readFile(tmpFile, 'utf-8')
      const reparsed = IgnoreMatcher.parse(written)

      expect(reparsed.isOperationIgnored(makeOperation('userService', 'post', '/users'))).toBe(true)
      expect(reparsed.isOperationIgnored(makeOperation('petStore', 'get', '/pets'))).toBe(true)
      expect(reparsed.isOperationIgnored(makeOperation('petStore', 'get', '/pets/details'))).toBe(false)
    } finally {
      await fs.remove(tmpFile)
    }
  })
})
