import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import './App.css'
import { checkBlankLines, type BlankLineCheckResult } from './blankLineChecker'

const exampleTemplate = String.raw`Dear {$corresponding_authors_title_and_lastname},

Thank you very much for submitting your manuscript to {$journal_name}:

Journal name: {$journal_name_original}
Manuscript ID: {$manuscript_id}
Type of manuscript: {$manuscript_type}
Title: {$manuscript_title}
Authors: {$manuscript_authors}
Received: {$manuscript_submission_date}
E-mails: {$manuscript_authors_email}{if $section_name or $special_issue_name}
{$section_name}{$section_website_link}{$special_issue_name}{$special_issue_website_link}{/if}{if $cepiec_discount_is_available_for_manuscript}

You have selected the CEPIEC payment workflow upon submission of your manuscript.{else}

{if $apc > 0}We confirm that the APC will be {$apc} CHF.{else}Your paper will be published free of charge due to your agreed waiver.{/if}{/if}

Journal APC: {$journal_apc} CHF{if $membership_name}
{if $is_society}Society{else}Institutional Open Access Program (IOAP){/if}: {$membership_name}{/if}{if $voucher_discount_amount > 0}
Voucher Discount: {$voucher_discount_amount} CHF{/if}
Total APC: {$apc} CHF

Please confirm that the APC is correct at the below link:
{$apc_confirm_link}

Kind regards,
{$editor_signature}`

type Value = { name: string; value: string }
type Node = TextNode | VariableNode | IfNode | UnknownNode
type TextNode = { type: 'text'; text: string }
type VariableNode = { type: 'variable'; name: string }
type UnknownNode = { type: 'unknown'; text: string }
type Branch = { type: 'branch'; keyword: 'if' | 'elseif' | 'else'; condition?: string; children: Node[] }
type IfNode = { type: 'if'; branches: Branch[] }

const tokenPattern = /\{(\/if|elseif\s+[^{}]+|else|if\s+[^{}]+|\$[A-Za-z_][\w.]*)\}/g

function parseTemplate(source: string) {
  const tokens = [...source.matchAll(tokenPattern)]
  const values = new Set<string>()
  const warnings: string[] = []
  let cursor = 0
  let tokenIndex = 0
  const isStopCommand = (command: string, stops: string[]) => stops.some((stop) =>
    stop === 'elseif' ? command.startsWith('elseif ') : command === stop)

  const readSequence = (stops: string[]): Node[] => {
    const nodes: Node[] = []
    while (tokenIndex < tokens.length) {
      const match = tokens[tokenIndex]
      const raw = match[0]
      const command = match[1]
      const start = match.index ?? 0
      if (start > cursor) nodes.push({ type: 'text', text: source.slice(cursor, start) })
      if (isStopCommand(command, stops)) break
      cursor = start + raw.length
      tokenIndex += 1

      if (command.startsWith('$')) {
        const name = command.slice(1)
        values.add(name)
        nodes.push({ type: 'variable', name })
      } else if (command.startsWith('if ')) {
        nodes.push(readIf(command.slice(3).trim()))
      } else if (command === 'else' || command.startsWith('elseif ')) {
        const line = source.slice(0, start).split('\n').length
        warnings.push(`第 ${line} 行发现未匹配的 ${command.split(' ')[0]} 分支`)
        nodes.push({ type: 'unknown', text: raw })
      } else if (command === '/if') {
        const line = source.slice(0, start).split('\n').length
        warnings.push(`第 ${line} 行发现未匹配的闭合标签 {/if}`)
        nodes.push({ type: 'unknown', text: raw })
      }
    }
    if (tokenIndex === tokens.length && cursor < source.length) {
      nodes.push({ type: 'text', text: source.slice(cursor) })
      cursor = source.length
    }
    return nodes
  }

  const readIf = (condition: string): IfNode => {
    const branches: Branch[] = [{ type: 'branch', keyword: 'if', condition, children: [] }]
    while (tokenIndex < tokens.length) {
      branches[branches.length - 1].children = readSequence(['else', 'elseif', '/if'])
      if (tokenIndex >= tokens.length) {
        warnings.push(`条件 “${condition}” 缺少 {/if}`)
        break
      }
      const command = tokens[tokenIndex][1]
      cursor = (tokens[tokenIndex].index ?? 0) + tokens[tokenIndex][0].length
      tokenIndex += 1
      if (command === '/if') break
      if (command === 'else') branches.push({ type: 'branch', keyword: 'else', children: [] })
      else branches.push({ type: 'branch', keyword: 'elseif', condition: command.slice(7).trim(), children: [] })
    }
    return { type: 'if', branches }
  }

  const nodes = readSequence([])
  const recognizedEnd = tokens.length === tokenIndex
  if (!recognizedEnd) warnings.push('模板中存在未完成的条件结构')
  return { nodes, values: [...values], warnings }
}

function inputValue(value: string): string | number | boolean {
  if (value === 'true') return true
  if (value === 'false') return false
  if (value !== '' && !Number.isNaN(Number(value))) return Number(value)
  return value
}

function evaluateCondition(condition: string | undefined, valueMap: Record<string, string>): boolean | null {
  if (!condition) return null
  if (/\b(strtotime|count)\s*\(/i.test(condition)) return null
  const evaluateAtom = (atom: string): boolean | null => {
    let expression = atom.trim()
    let negate = false
    if (expression.startsWith('!')) {
      negate = true
      expression = expression.slice(1).trim()
    }
    const variableNames = [...expression.matchAll(/\$([A-Za-z_][\w.]*)/g)].map((match) => match[1])
    if (variableNames.some((name) => valueMap[name] === undefined || valueMap[name] === '')) return null
    const comparison = expression.match(/^(.*?)\s*(>=|<=|==|!=|>|<)\s*(.*?)$/)
    const resolve = (raw: string) => {
      const value = raw.trim()
      if (value.startsWith('$')) return inputValue(valueMap[value.slice(1)])
      return value.replace(/^['"]|['"]$/g, '')
    }
    let result: boolean
    if (comparison) {
      const left = resolve(comparison[1])
      const right = resolve(comparison[3])
      switch (comparison[2]) {
        case '>': result = left > right; break
        case '<': result = left < right; break
        case '>=': result = left >= right; break
        case '<=': result = left <= right; break
        case '!=': result = left !== right; break
        default: result = left === right
      }
    } else {
      result = Boolean(resolve(expression))
    }
    return negate ? !result : result
  }
  const alternatives = condition.split(/\s*(?:\|\||\bor\b)\s*/i)
  const results = alternatives.map((alternative) => {
    const conjunction = alternative.split(/\s*(?:&&|\band\b)\s*/i).map(evaluateAtom)
    if (conjunction.some((result) => result === false)) return false
    if (conjunction.some((result) => result === null)) return null
    return true
  })
  if (results.some((result) => result === true)) return true
  if (results.every((result) => result === false)) return false
  return null
}

type BranchStatus = boolean | null

function buildBranchStatuses(tokens: RegExpMatchArray[], valueMap: Record<string, string>) {
  const statuses = new Map<string, BranchStatus>()
  const groupForBranch = new Map<string, string>()
  const branchesByGroup = new Map<string, string[]>()
  const selectedByGroup = new Map<string, string | null>()
  const groups: { id: string; branches: { id: string; condition?: string; kind: 'if' | 'elseif' | 'else' }[] }[] = []
  let groupNumber = 0
  let branchNumber = 0
  tokens.forEach((match) => {
    const command = match[1]
    if (command.startsWith('if ')) {
      const groupId = `group-${groupNumber}`
      const branchId = `branch-${branchNumber}`
      const group = { id: groupId, branches: [] as { id: string; condition?: string; kind: 'if' | 'elseif' | 'else' }[] }
      group.branches.push({ id: branchId, condition: command.slice(3).trim(), kind: 'if' })
      groupForBranch.set(branchId, groupId)
      groupNumber += 1
      branchNumber += 1
      groups.push(group)
    } else if (command.startsWith('elseif ') || command === 'else') {
      const group = groups.at(-1)
      if (!group) return
      const branchId = `branch-${branchNumber}`
      group.branches.push({
        id: branchId,
        condition: command.startsWith('elseif ') ? command.slice(7).trim() : undefined,
        kind: command === 'else' ? 'else' : 'elseif',
      })
      groupForBranch.set(branchId, group.id)
      branchNumber += 1
    } else if (command === '/if') {
      const group = groups.pop()
      if (!group) return
      let selected: string | null = null
      let unknown = false
      group.branches.forEach((branch) => {
        if (branch.kind === 'else') {
          const isSelected = unknown ? null : selected === null
          statuses.set(branch.id, isSelected)
          if (isSelected) selected = branch.id
          return
        }
        const result = evaluateCondition(branch.condition, valueMap)
        if (result === null) {
          statuses.set(branch.id, null)
          unknown = true
        } else if (result && selected === null && !unknown) {
          statuses.set(branch.id, true)
          selected = branch.id
        } else {
          statuses.set(branch.id, false)
        }
      })
      selectedByGroup.set(group.id, selected)
      branchesByGroup.set(group.id, group.branches.map((branch) => branch.id))
    }
  })
  return { statuses, groupForBranch, selectedByGroup, branchesByGroup }
}

function App() {
  const [template, setTemplate] = useState('')
  const [values, setValues] = useState<Value[]>([])
  const [showVariables, setShowVariables] = useState(true)
  const [finalView, setFinalView] = useState(false)
  const [sourceOpen, setSourceOpen] = useState(true)
  const [hoveredGroup, setHoveredGroup] = useState<string | null>(null)
  const [hoveredBranch, setHoveredBranch] = useState<string | null>(null)
  const [removedBranches, setRemovedBranches] = useState<Set<string>>(new Set())
  const [resolvedGroups, setResolvedGroups] = useState<Set<string>>(new Set())
  const [flattenedGroups, setFlattenedGroups] = useState<Set<string>>(new Set())
  const [contextBranch, setContextBranch] = useState<{ branchId: string; groupId: string; x: number; y: number } | null>(null)
  const [blankCheck, setBlankCheck] = useState<BlankLineCheckResult | null>(null)
  const parsed = useMemo(() => parseTemplate(template), [template])

  const resetRemovedBranches = () => {
    setRemovedBranches(new Set())
    setResolvedGroups(new Set())
    setFlattenedGroups(new Set())
    setContextBranch(null)
  }
  const syncValues = () => {
    setValues(parsed.values.map((name) => values.find((item) => item.name === name) ?? { name, value: '' }))
    resetRemovedBranches()
  }
  const valueMap = Object.fromEntries(values.map((item) => [item.name, item.value]))
  useEffect(() => {
    if (!contextBranch) return
    const dismissMenu = (event: PointerEvent) => {
      if ((event.target as HTMLElement).closest('.context-branch-menu')) return
      setContextBranch(null)
      setHoveredGroup(null)
      setHoveredBranch(null)
    }
    window.addEventListener('pointerdown', dismissMenu, true)
    return () => window.removeEventListener('pointerdown', dismissMenu, true)
  }, [contextBranch])

  const copyTemplate = async () => {
    await navigator.clipboard?.writeText(template)
  }
  const runBlankLineCheck = () => setBlankCheck(checkBlankLines(template))
  const deleteContextBranch = (branchId: string, groupId: string) => {
    setRemovedBranches((current) => new Set(current).add(branchId))
    setFlattenedGroups((current) => new Set(current).add(groupId))
    setContextBranch(null)
    setHoveredGroup(null)
    setHoveredBranch(null)
  }
  const hitContextBranch = (branchId: string, groupId: string) => {
    const tokens = [...template.matchAll(tokenPattern)]
    const branchMeta = buildBranchStatuses(tokens, valueMap)
    const siblingBranches = branchMeta.branchesByGroup.get(groupId) ?? []
    setRemovedBranches((current) => {
      const next = new Set(current)
      siblingBranches.forEach((siblingId) => {
        if (siblingId !== branchId) next.add(siblingId)
      })
      return next
    })
    setFlattenedGroups((current) => new Set(current).add(groupId))
    setContextBranch(null)
    setHoveredGroup(null)
    setHoveredBranch(null)
  }

  const renderInline = () => {
    const tokens = [...template.matchAll(tokenPattern)]
    const output: ReactNode[] = []
    const branchMeta = buildBranchStatuses(tokens, valueMap)
    const groupStack: string[] = []
    const branchStack: string[] = []
    let cursor = 0
    let depth = 0
    let groupNumber = 0
    let branchNumber = 0
    const activeBranchClass = () => {
      const groupIndex = groupStack.lastIndexOf(hoveredGroup ?? '')
      if (groupIndex < 0) return ''
      return groupIndex >= 0 && branchStack[groupIndex] === hoveredBranch
        ? ' inline-group-active inline-branch-current'
        : ' inline-group-active inline-branch-other'
    }
    const isVisible = (groups: string[], branches: string[]) => groups.every((groupId, index) => {
      const branchId = branches[index]
      if (removedBranches.has(branchId)) return false
      if (!resolvedGroups.has(groupId)) return true
      return branchMeta.selectedByGroup.get(groupId) === branchId
    })
    const addText = (text: string, key: string) => {
      if (!isVisible(groupStack, branchStack)) return
      text.split(/\r?\n/).forEach((line, lineIndex, lines) => {
        if (line) output.push(<span key={`${key}-${lineIndex}`} className={`inline-branch-content${activeBranchClass()}`}>{line}</span>)
        if (lineIndex < lines.length - 1) {
          output.push(<span key={`${key}-break-${lineIndex}`} className="line-break-marker" aria-hidden="true">↵</span>)
          output.push(<br key={`${key}-br-${lineIndex}`} />)
        }
      })
    }
    tokens.forEach((match, index) => {
      const raw = match[0]
      const command = match[1]
      const start = match.index ?? 0
      if (start > cursor) addText(template.slice(cursor, start), `text-${index}`)
      const tokenDepth = command === '/if' ? Math.max(depth - 1, 0) : depth
      if (command.startsWith('$')) {
        if (!isVisible(groupStack, branchStack)) {
          cursor = start + raw.length
          return
        }
        const name = command.slice(1)
        const value = valueMap[name]
        output.push(<span key={`variable-${index}`} className={`inline-branch-content${activeBranchClass()}`}><span className="variable-chip">{finalView && value ? value : raw}{finalView && value ? <small>{raw}</small> : null}</span></span>)
      } else {
        const isBranchTag = command === 'else' || command === '/if' || command.startsWith('if ') || command.startsWith('elseif ')
        let branchId = branchStack[branchStack.length - 1]
        let groupId = groupStack[groupStack.length - 1]
        if (command.startsWith('if ') || command.startsWith('elseif ') || command === 'else') {
          if (command.startsWith('if ')) {
            groupId = `group-${groupNumber}`
            groupNumber += 1
          }
          branchId = `branch-${branchNumber}`
          branchNumber += 1
        }
        const groupIndex = groupStack.lastIndexOf(hoveredGroup ?? '')
        const isGroupTagActive = groupId === hoveredGroup || groupIndex >= 0
        const isCurrentBranch = groupId === hoveredGroup
          ? branchId === hoveredBranch
          : groupIndex >= 0 && branchStack[groupIndex] === hoveredBranch
        const isBranchBoundary = command.startsWith('elseif ') || command === 'else'
        const nextGroups = [...groupStack]
        const nextBranches = [...branchStack]
        if (command.startsWith('if ')) {
          nextGroups.push(`group-${groupNumber - 1}`)
          nextBranches.push(`branch-${branchNumber - 1}`)
        } else if (isBranchBoundary) {
          nextBranches[nextBranches.length - 1] = branchId ?? ''
        }
        const branchRemoved = resolvedGroups.has(groupId ?? '') || !isVisible(nextGroups, nextBranches)
        const syntaxHidden = flattenedGroups.has(groupId ?? '') || branchRemoved
        const canRemove = Boolean(Object.values(valueMap).some((value) => value !== '')) && branchMeta.statuses.get(branchId ?? '') === false
        if (syntaxHidden) {
          if (command.startsWith('if ')) {
            groupStack.push(`group-${groupNumber - 1}`)
            branchStack.push(`branch-${branchNumber - 1}`)
            depth += 1
          }
          if (command.startsWith('elseif ') || command === 'else') {
            branchStack.pop()
            branchStack.push(`branch-${branchNumber - 1}`)
          }
          if (command === '/if') {
            groupStack.pop()
            branchStack.pop()
            depth = Math.max(depth - 1, 0)
          }
          cursor = start + raw.length
          return
        }
        const status = command.startsWith('if ') || command.startsWith('elseif ')
          ? evaluateCondition(command.replace(/^if |^elseif /, ''), valueMap)
          : null
        output.push(<span key={`condition-${index}`} className={`inline-condition depth-${Math.min(tokenDepth, 3)} ${command === 'else' ? 'inline-else' : ''} ${isBranchTag ? 'branch-trigger' : ''} ${isGroupTagActive ? 'inline-group-active' : ''} ${isGroupTagActive && isCurrentBranch ? 'inline-branch-current' : ''} ${isGroupTagActive && !isCurrentBranch ? 'inline-branch-other' : ''}`} onMouseEnter={() => isBranchTag && (setHoveredGroup(groupId ?? null), setHoveredBranch(branchId ?? null))} onMouseLeave={() => isBranchTag && !contextBranch && (setHoveredGroup(null), setHoveredBranch(null))} onContextMenu={(event) => { if (!isBranchTag || !branchId || !groupId) return; event.preventDefault(); setHoveredGroup(groupId); setHoveredBranch(branchId); setContextBranch({ branchId, groupId, x: event.clientX, y: event.clientY }) }}>
          <span className="condition-raw">{raw}</span>
          {status !== null && <small className={`inline-status status-${status ? 'true' : 'false'}`}>{status ? '满足' : '不满足'}</small>}
          {canRemove && <button className="remove-branch-button" aria-label="删除不满足的分支" onClick={(event) => { event.stopPropagation(); const group = branchMeta.groupForBranch.get(branchId ?? ''); setRemovedBranches((current) => new Set(current).add(branchId ?? '')); if (group) setResolvedGroups((current) => new Set(current).add(group)) }}>×</button>}
        </span>)
      }
      if (command.startsWith('if ')) {
        groupStack.push(`group-${groupNumber - 1}`)
        branchStack.push(`branch-${branchNumber - 1}`)
        depth += 1
      }
      if (command.startsWith('elseif ') || command === 'else') {
        branchStack.pop()
        branchStack.push(`branch-${branchNumber - 1}`)
      }
      if (command === '/if') {
        groupStack.pop()
        branchStack.pop()
        depth = Math.max(depth - 1, 0)
      }
      cursor = start + raw.length
    })
    if (cursor < template.length) addText(template.slice(cursor), 'text-end')
    return output
  }

  const updateValue = (name: string, value: string) => {
    resetRemovedBranches()
    setValues((current) => current.some((item) => item.name === name)
      ? current.map((item) => item.name === name ? { ...item, value } : item)
      : [...current, { name, value }])
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand"><span className="brand-mark">S</span><div><strong>Template Lens</strong><span>邮件模板可读化工具</span></div></div>
        <div className="toolbar">
          <button onClick={() => { setTemplate(exampleTemplate); resetRemovedBranches() }}>载入示例</button>
          <button onClick={copyTemplate}>复制原始模板</button>
          <button className="check-button" onClick={runBlankLineCheck}>检查连续空行</button>
        </div>
      </header>
      <section className="intro">
        <div><p className="eyebrow">TEMPLATE REVIEW WORKSPACE</p><h1>让复杂条件模板<br /><em>一眼看懂。</em></h1><p className="intro-copy">把 Smarty 风格的邮件模板转换为清晰的阅读结构。变量、条件和嵌套分支都被保留，但不再藏在一整段文本里。</p></div>
        <div className="status-card"><span className="status-dot" />本地解析中<div><strong>{parsed.values.length}</strong><span> 个变量</span><strong>{parsed.warnings.length}</strong><span> 个警告</span></div></div>
      </section>
      {blankCheck && <BlankLineResults result={blankCheck} />}
      <section className={`workspace ${sourceOpen ? '' : 'source-collapsed'}`}>
        {sourceOpen ? <div className="source-panel panel">
          <div className="panel-header"><div><span className="panel-kicker">SOURCE</span><h2>原始模板</h2></div><div className="panel-actions"><span className="panel-meta">Smarty 风格</span><button className="quiet-button" onClick={() => setSourceOpen(false)}>收起原文</button></div></div>
          <textarea value={template} onChange={(event) => { setTemplate(event.target.value); resetRemovedBranches() }} spellCheck={false} aria-label="原始邮件模板" />
          <div className="source-footer"><span>支持变量、条件、嵌套分支</span><span>{template.length.toLocaleString()} 字符</span></div>
        </div> : <button className="collapsed-source panel" onClick={() => setSourceOpen(true)}><span className="panel-kicker">SOURCE</span><strong>展开原始模板</strong><span>{template.length.toLocaleString()} 字符</span></button>}
        <div className="preview-panel panel">
          <div className="panel-header"><div><span className="panel-kicker">READABLE PREVIEW</span><h2>可读预览</h2></div><button className="quiet-button" onClick={() => setSourceOpen(true)}>显示原文</button></div>
          {showVariables ? <div className="variables-panel"><div className="variables-heading"><div className="variables-title"><span>变量模拟</span><small>可选，不填写时仅显示结构</small></div><div><div className="view-switch"><button className={!finalView ? 'active' : ''} onClick={() => setFinalView(false)}>变量名</button><button className={finalView ? 'active' : ''} onClick={() => setFinalView(true)}>变量值</button></div><button onClick={syncValues}>同步变量</button><button onClick={resetRemovedBranches}>恢复分支</button><button onClick={() => setShowVariables(false)}>收起</button></div></div><div className="variable-grid">{values.length === 0 ? <span className="empty-state">点击“同步变量”，填写变量值以模拟不同场景</span> : values.map((item) => <label key={item.name}><span>{item.name}</span><input value={item.value} onChange={(event) => updateValue(item.name, event.target.value)} placeholder="未填写" /></label>)}</div></div> : <button className="show-variables" onClick={() => setShowVariables(true)}>展开变量模拟面板</button>}
          <div className="preview-body">{renderInline()}{contextBranch && <div className="context-branch-menu" style={{ left: contextBranch.x, top: contextBranch.y }}><button className="context-remove-branch" onClick={() => deleteContextBranch(contextBranch.branchId, contextBranch.groupId)}>删除此分支</button><button className="context-hit-branch" onClick={() => hitContextBranch(contextBranch.branchId, contextBranch.groupId)}>命中此分支</button></div>}</div>
          {parsed.warnings.length > 0 && <div className="warnings"><strong>解析提醒</strong>{parsed.warnings.map((warning) => <span key={warning}>{warning}</span>)}</div>}
        </div>
      </section>
      <footer className="app-footer"><span>结构视图不会修改原始模板</span><span>仅在本地浏览器中处理内容</span></footer>
    </main>
  )
}

function BlankLineResults({ result }: { result: BlankLineCheckResult }) {
  const [expanded, setExpanded] = useState(true)
  const hasIssues = result.issues.length > 0
  return <section className={`blank-results ${hasIssues ? 'has-issues' : 'all-clear'}`}>
    <div className="blank-results-header">
      <div><span className="panel-kicker">BLANK LINE CHECK</span><h2>{hasIssues ? `发现 ${result.issues.length} 个潜在连续空行风险` : '未发现连续空行风险'}</h2></div>
      <div className="blank-results-meta"><span>{result.scenarioCount} 个场景</span><span>{result.exhaustive ? '完整组合检查' : '抽样检查'}</span><button onClick={() => setExpanded((current) => !current)}>{expanded ? '收起结果' : '展开结果'}</button></div>
    </div>
    {expanded && <>
      {result.parseWarnings.length > 0 && <div className="blank-warning-list">{result.parseWarnings.map((warning) => <span key={warning}>{warning}</span>)}</div>}
      {hasIssues ? <div className="blank-issue-list">{result.issues.map((issue, index) => <article className="blank-issue" key={`${issue.lines.join('-')}-${index}`}><div className="blank-issue-heading"><strong>风险 {index + 1}</strong><span>渲染后第 {issue.lines[0]}–{issue.lines.at(-1)} 行出现 {issue.count} 个连续空行</span></div><div className="scenario-state">{Object.entries(issue.scenario).map(([condition, value]) => <span key={condition}><b>{value ? '成立' : '不成立'}</b> {condition}</span>)}</div><pre>{issue.renderedLines.map((line, lineIndex) => { const lineNumber = lineIndex + 1; return <span className={issue.lines.includes(lineNumber) ? 'problem-line' : ''} key={lineNumber}>{`${String(lineNumber).padStart(3, ' ')} | ${line || '↵'}`}{'\n'}</span> })}</pre></article>)}</div> : <p className="blank-clear-copy">当前模板在已检查的条件组合下，没有渲染出两个或以上连续空行。</p>}
    </>}
  </section>
}

export default App
