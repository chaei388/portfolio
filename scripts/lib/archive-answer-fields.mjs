// 초기 이관 원본의 문단/코드 순서를 유지하여 현재 답변 컬럼으로 변환.
export function archiveAnswerFields(blocks) {
  const last = blocks.at(-1)
  const splitLast = last?.type === 'code' && blocks.some((block) => block.type === 'paragraph')
  const body = splitLast ? blocks.slice(0, -1) : blocks
  return {
    content: body.map((block) => {
      if (block.type === 'paragraph') return block.text
      const fence = '`'.repeat(Math.max(3, ...[...block.codeText.matchAll(/`+/g)].map(([match]) => match.length + 1)))
      return `${fence}${block.language}\n${block.codeText}\n${fence}`
    }).join('\n\n'),
    language: splitLast ? last.language : null,
    codeText: splitLast ? last.codeText : null,
  }
}
