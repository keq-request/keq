import { describe, expect, test } from '@jest/globals'
import { ImportAliasManager } from './import-alias-manager.js'


describe('ImportAliasManager', () => {
  test('register schema alias with Schema suffix', () => {
    const manager = new ImportAliasManager()
    expect(manager.register('schema', 'User')).toBe('UserSchema')
  })

  test('register response alias with Response suffix', () => {
    const manager = new ImportAliasManager()
    expect(manager.register('response', 'Error')).toBe('ErrorResponse')
  })

  test('register is idempotent', () => {
    const manager = new ImportAliasManager()
    const first = manager.register('schema', 'User')
    const second = manager.register('schema', 'User')
    expect(first).toBe(second)
    expect(first).toBe('UserSchema')
  })

  test('fallback when alias collides with reserved name', () => {
    const manager = new ImportAliasManager(['UserSchema'])
    expect(manager.register('schema', 'User')).toBe('UserSchema$1')
  })

  test('fallback with multiple collisions', () => {
    const manager = new ImportAliasManager(['UserSchema', 'UserSchema$1'])
    expect(manager.register('schema', 'User')).toBe('UserSchema$2')
  })

  test('resolve returns alias for registered dependency', () => {
    const manager = new ImportAliasManager()
    manager.register('schema', 'User')
    expect(manager.resolve('schema', 'User')).toBe('UserSchema')
  })

  test('resolve returns undefined for unregistered dependency', () => {
    const manager = new ImportAliasManager()
    expect(manager.resolve('schema', 'User')).toBeUndefined()
  })

  test('different categories produce independent aliases', () => {
    const manager = new ImportAliasManager()
    expect(manager.register('schema', 'Error')).toBe('ErrorSchema')
    expect(manager.register('response', 'Error')).toBe('ErrorResponse')
  })

  test('alias collision between registered entries', () => {
    const manager = new ImportAliasManager()
    // First registration takes the clean name
    expect(manager.register('schema', 'FooSchema')).toBe('FooSchemaSchema')
    // This won't collide because suffix differs
    expect(manager.register('response', 'FooSchema')).toBe('FooSchemaResponse')
  })
})
