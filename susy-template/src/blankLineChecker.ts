export type ConditionState = Record<string, boolean>

export type BlankLineIssue = {
  lines: number[]
  count: number
  scenario: ConditionState
  renderedLines: string[]
}

export type BlankLineCheckResult = {
  issues: BlankLineIssue[]
  conditions: string[]
  scenarioCount: number
  exhaustive: boolean
  parseWarnings: string[]
}

type TextNode = { type: 'text'; text: string }
type Branch = { kind: 'if' | 'elseif' | 'else'; condition?: string; children: Node[] }
type IfNode = { type: 'if'; branches: Branch[] }
type Node = TextNode | IfNode

type Token = { command: string; index: number; raw: string }

const tokenPattern = /\{(if\s+[^{}]+|elseif\s+[^{}]+|else|\/if)\}/g
const MAX_SCENARIOS = 256

function parseTemplate(source: string) {
  const tokens: Token[] = [...source.matchAll(tokenPattern)].map((match) => ({
    command: match[1],
    index: match.index ?? 0,
    raw: match[0],
  }))
  const warnings: string[] = []
  let tokenIndex = 0
  let cursor = 0

  const lineAt = (index: number) => source.slice(0, index).split(/\r?\n/).length
  const isStop = (command: string, stops: string[]) => stops.some((stop) =>
    stop === 'elseif' ? command.startsWith('elseif ') : command === stop)

  const readSequence = (stops: string[]): Node[] => {
    const nodes: Node[] = []
    while (tokenIndex < tokens.length) {
      const token = tokens[tokenIndex]
      if (isStop(token.command, stops)) break
      if (token.index > cursor) nodes.push({ type: 'text', text: source.slice(cursor, token.index) })
      cursor = token.index + token.raw.length
      tokenIndex += 1

      if (token.command.startsWith('if ')) {
        nodes.push(readIf(token.command.slice(3).trim(), token.index))
      } else {
        warnings.push(`第 ${lineAt(token.index)} 行出现未匹配的 ${token.raw}`)
        nodes.push({ type: 'text', text: token.raw })
      }
    }
    if (tokenIndex === tokens.length && cursor < source.length) {
      nodes.push({ type: 'text', text: source.slice(cursor) })
      cursor = source.length
    }
    return nodes
  }

  const readIf = (condition: string, start: number): IfNode => {
    const branches: Branch[] = [{ kind: 'if', condition, children: [] }]
    let closed = false
    while (tokenIndex < tokens.length) {
      branches[branches.length - 1].children = readSequence(['elseif', 'else', '/if'])
      if (tokenIndex >= tokens.length) break
      const token = tokens[tokenIndex]
      cursor = token.index + token.raw.length
      tokenIndex += 1
      if (token.command === '/if') {
        closed = true
        break
      }
      if (token.command === 'else') {
        branches.push({ kind: 'else', children: [] })
      } else {
        branches.push({ kind: 'elseif', condition: token.command.slice(7).trim(), children: [] })
      }
    }
    if (!closed) warnings.push(`第 ${lineAt(start)} 行的 {if} 缺少 {/if}`)
    return { type: 'if', branches }
  }

  return { nodes: readSequence([]), warnings }
}

function render(nodes: Node[], scenario: ConditionState): string {
  return nodes.map((node) => {
    if (node.type === 'text') return node.text
    const selected = node.branches.find((branch) =>
      branch.kind !== 'else' && branch.condition && scenario[branch.condition])
      ?? node.branches.find((branch) => branch.kind === 'else')
    return selected ? render(selected.children, scenario) : ''
  }).join('')
}

function findIssues(rendered: string) {
  const lines = rendered.split(/\r?\n/)
  const issues: { lines: number[]; count: number }[] = []
  let blankStart = -1
  for (let index = 0; index <= lines.length; index += 1) {
    const isBlank = index < lines.length && lines[index].trim() === ''
    if (isBlank && blankStart < 0) blankStart = index
    if ((!isBlank || index === lines.length) && blankStart >= 0) {
      const count = index - blankStart
      if (count >= 2) issues.push({
        lines: Array.from({ length: count }, (_, offset) => blankStart + offset + 1),
        count,
      })
      blankStart = -1
    }
  }
  return { lines, issues }
}

function generateScenarios(conditions: string[]) {
  const total = 2 ** conditions.length
  if (total <= MAX_SCENARIOS) {
    return Array.from({ length: total }, (_, value) =>
      Object.fromEntries(conditions.map((condition, index) => [condition, Boolean(value & (1 << index))])))
  }
  const scenarios: ConditionState[] = [
    Object.fromEntries(conditions.map((condition) => [condition, true])),
    Object.fromEntries(conditions.map((condition) => [condition, false])),
  ]
  conditions.forEach((target) => {
    scenarios.push(Object.fromEntries(conditions.map((condition) => [condition, condition === target])))
    scenarios.push(Object.fromEntries(conditions.map((condition) => [condition, condition !== target])))
  })
  return scenarios
}

export function checkBlankLines(source: string): BlankLineCheckResult {
  if (!source.trim()) return { issues: [], conditions: [], scenarioCount: 0, exhaustive: true, parseWarnings: [] }
  const parsed = parseTemplate(source)
  const conditions = [...new Set([...source.matchAll(/\{(?:if|elseif)\s+([^{}]+)\}/g)].map((match) => match[1].trim()))]
  const scenarios = generateScenarios(conditions)
  const issueMap = new Map<string, BlankLineIssue>()

  scenarios.forEach((scenario) => {
    const rendered = render(parsed.nodes, scenario)
    const { lines, issues } = findIssues(rendered)
    issues.forEach((issue) => {
      const key = `${issue.lines.join(',')}|${issue.count}`
      if (!issueMap.has(key)) issueMap.set(key, { ...issue, scenario, renderedLines: lines })
    })
  })

  return {
    issues: [...issueMap.values()],
    conditions,
    scenarioCount: scenarios.length,
    exhaustive: 2 ** conditions.length <= MAX_SCENARIOS,
    parseWarnings: parsed.warnings,
  }
}
