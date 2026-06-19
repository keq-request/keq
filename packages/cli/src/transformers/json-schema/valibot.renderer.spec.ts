import { describe, expect, it } from '@jest/globals'
import type { OpenAPIV3_1 } from '@scalar/openapi-types'
import { ValibotRenderer } from './valibot.renderer.js'

/**
 * 构造 pattern 经过转义后的预期输出
 *
 * 等价于 valibot.renderer.ts 中的转义逻辑：
 * `schema.pattern.replace(/[\\/]/g, '\\$&')`
 */
function expectedRegex(pattern: string): string {
  return 'v.regex(/' + pattern.replace(/[\\/]/g, '\\$&') + '/)'
}

function render(pattern: string): string {
  const schema: OpenAPIV3_1.NonArraySchemaObject = {
    type: 'string',
    pattern,
  }
  return new ValibotRenderer(schema).render()
}

function renderWithConstraints(
  schema: Partial<OpenAPIV3_1.NonArraySchemaObject> & { type: 'string' },
): string {
  return new ValibotRenderer(schema as OpenAPIV3_1.NonArraySchemaObject).render()
}

describe('ValibotRenderer pattern escaping', () => {
  describe('patterns without slashes (baseline)', () => {
    it('renders a simple pattern without slashes correctly', () => {
      const result = render('^[a-z][a-z0-9-]+$')
      expect(result).toContain(expectedRegex('^[a-z][a-z0-9-]+$'))
    })

    it('preserves backslash escapes for regex metacharacters (e.g. \\d)', () => {
      // JS 字符串 '^\\d{3}-\\d{4}$' = pattern ^\d{3}-\d{4}$
      const pattern = '^\\d{3}-\\d{4}$'
      const result = render(pattern)
      expect(result).toContain(expectedRegex(pattern))
    })

    it('handles empty pattern gracefully (should not render regex)', () => {
      const schema: OpenAPIV3_1.NonArraySchemaObject = {
        type: 'string',
        pattern: '',
      }
      const result = new ValibotRenderer(schema).render()
      // 空字符串为 falsy，不应包含 v.regex
      expect(result).not.toContain('v.regex')
      expect(result).toBe('v.string()')
    })
  })

  describe('patterns with forward slashes', () => {
    it('escapes a single forward slash', () => {
      const pattern = '^/([a-z]+)$'
      const result = render(pattern)
      expect(result).toContain(expectedRegex(pattern))
    })

    it('escapes multiple forward slashes (URL-like pattern)', () => {
      // JS 字符串 '^https?:\\/\\/[^/?@#]+$' = pattern ^https?:\/\/[^/?@#]+$
      const pattern = '^https?:\\/\\/[^/?@#]+$'
      const result = render(pattern)
      expect(result).toContain(expectedRegex(pattern))
    })

    it('escapes forward slashes at start and end of pattern', () => {
      const pattern = '^/api/v[0-9]+/users$'
      const result = render(pattern)
      expect(result).toContain(expectedRegex(pattern))
    })

    it('handles a pattern that is only a single slash', () => {
      const pattern = '/'
      const result = render(pattern)
      expect(result).toContain(expectedRegex(pattern))
    })

    it('escapes slash inside character class (safe, no harm)', () => {
      // JS 字符串 '^[a-z\\/]+$' = pattern ^[a-z\/]+$
      const pattern = '^[a-z\\/]+$'
      const result = render(pattern)
      expect(result).toContain(expectedRegex(pattern))
    })

    it('escapes forward slashes in a complex URL validation pattern', () => {
      // 模拟 @Matches(/^https?:\/\/[^/?@#]+(:\d+)?(\/[^?#]*)?$/) 的 pattern
      const pattern = '^https?:\\/\\/[^/?@#]+(:\\d+)?(\\/[^?#]*)?$'
      const result = render(pattern)
      expect(result).toContain(expectedRegex(pattern))
      // v.regex 中的正则字面量不应包含未转义的 /
      // 提取 v.regex 的内容，确认 / 在正则体内被转义
      const regexMatch = result.match(/v\.regex\(\/(.+)\/\)/)
      expect(regexMatch).not.toBeNull()
      if (regexMatch) {
        const body = regexMatch[1]
        // 正则体内不应有奇数个反斜杠后紧跟正斜杠（即不应有未转义的 /）
        // 检测模式：字符不是 \ 但后面是 /，或者字符串以 / 开头
        expect(body).not.toMatch(/(?<!\\)\//)
      }
    })
  })

  describe('patterns with both backslashes and forward slashes', () => {
    it('correctly escapes both backslash and forward slash characters', () => {
      // JS 字符串 '^/path/\\d+/end$' = pattern ^/path/\d+/end$
      const pattern = '^/path/\\d+/end$'
      const result = render(pattern)
      expect(result).toContain(expectedRegex(pattern))
    })
  })

  describe('combined constraints (pipe)', () => {
    it('combines minLength and pattern in a pipe', () => {
      // JS 字符串 '^/[a-z]+/\\d+$' = pattern ^/[a-z]+/\d+$
      const pattern = '^/[a-z]+/\\d+$'
      const result = renderWithConstraints({
        type: 'string',
        minLength: 3,
        pattern,
      })
      expect(result).toContain('v.minLength(3)')
      expect(result).toContain(expectedRegex(pattern))
      expect(result).toContain('v.pipe(')
    })

    it('combines maxLength and pattern with forward slash', () => {
      // JS 字符串 '^https?:\\/\\/.+$' = pattern ^https?:\/\/.+$
      const pattern = '^https?:\\/\\/.+$'
      const result = renderWithConstraints({
        type: 'string',
        maxLength: 100,
        pattern,
      })
      expect(result).toContain('v.maxLength(100)')
      expect(result).toContain(expectedRegex(pattern))
    })
  })
})
