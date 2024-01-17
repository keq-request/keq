
export function compilePathnameTemplate(template: string, params: Record<string, string | number>): string {
  return template
    .replace(/(^|\/)(?::([^/]+)|{([^/]+)}|%7B([^/]+)%7D)(?=$|\/)/g, (_, prefix, group1, group2, group3) => {
      if (group1 && params[group1]) {
        return `${prefix}${encodeURIComponent(params[group1])}`
      } else if (group2 && params[group2]) {
        return `${prefix}${encodeURIComponent(params[group2])}`
      } else if (group3 && params[group3]) {
        return `${prefix}${encodeURIComponent(params[group3])}`
      }

      return _
    })
}
