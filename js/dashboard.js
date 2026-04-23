export function renderStats(stats, container) {
  container.innerHTML = `
    <div class="stat">
      <div class="label">총 세션</div>
      <div class="value">${stats.count}</div>
    </div>
    <div class="stat">
      <div class="label">평균 집중도</div>
      <div class="value">${stats.avgFocus}</div>
    </div>
    <div class="stat">
      <div class="label">평균 기억 강도</div>
      <div class="value">${stats.avgMemory}</div>
    </div>
    <div class="stat">
      <div class="label">생성 완료</div>
      <div class="value">${stats.generatedCount}</div>
    </div>
  `;
}
