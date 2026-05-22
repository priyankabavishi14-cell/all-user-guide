function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function processInline(raw: string): string {
  // Stash inline code first to protect its content from other replacements
  const codeStash: string[] = []
  let text = raw.replace(/`([^`\n]+)`/g, (_, code) => {
    codeStash.push(escapeHtml(code))
    return `\x00C${codeStash.length - 1}\x00`
  })

  text = escapeHtml(text)

  // Bold before italic to avoid partial matches
  text = text.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-[#111827]">$1</strong>')
  text = text.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
  text = text.replace(/~~(.*?)~~/g, '<del class="line-through text-[#9ca3af]">$1</del>')
  // Images before links so ![alt](url) isn't caught by the link pattern
  text = text.replace(
    /!\[([^\]]*)\]\(([^)]+)\)/g,
    '<img src="$2" alt="$1" class="max-w-full h-auto my-3 rounded-md" />'
  )
  text = text.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" class="text-[#5b5ce2] hover:underline" target="_blank" rel="noopener noreferrer">$1</a>'
  )
  // <small> arrives as escaped entities after escapeHtml
  text = text.replace(
    /&lt;small&gt;(.*?)&lt;\/small&gt;/g,
    '<small class="text-xs text-[#6b7280]">$1</small>'
  )

  // Restore stashed inline code
  text = text.replace(
    /\x00C(\d+)\x00/g,
    (_, i) =>
      `<code class="bg-[#f3f4f6] text-[#5b5ce2] px-1.5 py-0.5 rounded text-sm font-mono">${codeStash[parseInt(i)]}</code>`
  )

  return text
}

export function renderMarkdown(raw: string): string {
  const lines = raw.split('\n')
  const output: string[] = []
  let inCodeBlock = false
  const codeLines: string[] = []

  for (const line of lines) {
    if (line.startsWith('```')) {
      if (!inCodeBlock) {
        inCodeBlock = true
        codeLines.length = 0
      } else {
        inCodeBlock = false
        output.push(
          `<pre class="bg-[#1e1e2e] text-[#cdd6f4] rounded-lg p-4 overflow-x-auto my-4 text-sm font-mono leading-relaxed"><code>${codeLines.join('\n')}</code></pre>`
        )
      }
      continue
    }

    if (inCodeBlock) {
      codeLines.push(escapeHtml(line))
      continue
    }

    if (line.startsWith('##### ')) {
      output.push(`<h5 class="text-base font-semibold text-[#111827] mt-4 mb-1">${processInline(line.slice(6))}</h5>`)
    } else if (line.startsWith('#### ')) {
      output.push(`<h4 class="text-lg font-semibold text-[#111827] mt-5 mb-1">${processInline(line.slice(5))}</h4>`)
    } else if (line.startsWith('### ')) {
      output.push(`<h3 class="text-xl font-semibold text-[#111827] mt-6 mb-2">${processInline(line.slice(4))}</h3>`)
    } else if (line.startsWith('## ')) {
      output.push(`<h2 class="text-2xl font-bold text-[#111827] mt-8 mb-3">${processInline(line.slice(3))}</h2>`)
    } else if (line.startsWith('# ')) {
      output.push(`<h1 class="text-3xl font-bold text-[#111827] mt-8 mb-4 leading-tight">${processInline(line.slice(2))}</h1>`)
    } else if (line.startsWith('> ')) {
      output.push(
        `<blockquote class="border-l-4 border-[#5b5ce2] bg-[#f5f3ff] pl-4 pr-3 py-2 my-3 text-[#6b7280] italic rounded-r-lg">${processInline(line.slice(2))}</blockquote>`
      )
    } else if (line.startsWith('- [x] ')) {
      output.push(
        `<div class="flex items-start gap-2 my-1 ml-4"><span class="text-[#5b5ce2] shrink-0 mt-0.5">☑</span><span class="line-through text-[#9ca3af]">${processInline(line.slice(6))}</span></div>`
      )
    } else if (line.startsWith('- [ ] ')) {
      output.push(
        `<div class="flex items-start gap-2 my-1 ml-4"><span class="text-[#9ca3af] shrink-0 mt-0.5">☐</span><span class="text-[#374151]">${processInline(line.slice(6))}</span></div>`
      )
    } else if (/^(\* |- )/.test(line)) {
      output.push(
        `<li class="ml-6 list-disc text-[#374151] my-0.5 leading-relaxed">${processInline(line.replace(/^(\* |- )/, ''))}</li>`
      )
    } else if (/^\d+\. /.test(line)) {
      output.push(
        `<li class="ml-6 list-decimal text-[#374151] my-0.5 leading-relaxed">${processInline(line.replace(/^\d+\. /, ''))}</li>`
      )
    } else if (line.trim() === '') {
      output.push('<div class="my-2"></div>')
    } else {
      output.push(`<p class="text-[#374151] leading-relaxed my-1">${processInline(line)}</p>`)
    }
  }

  return output.join('\n')
}
