import { average } from './utils.js';

export function buildAnalysis(data) {
  if (!data.studyItems.length) {
    return '아직 기록이 많지 않아서 패턴 분석 전입니다. 첫 세션을 저장하면 여기서 방향을 요약해 드립니다.';
  }

  const itemsBySubject = data.subjects.map(subject => {
    const items = data.studyItems.filter(item => item.subjectId === subject.id);
    const logs = data.metaLogs.filter(log => log.subjectId === subject.id);
    const avgMemory = average(logs.map(log => log.after.memory || 0));
    const generatedRatio = items.length ? items.filter(item => item.generated?.trim()).length / items.length : 0;
    return { subject, items, avgMemory, generatedRatio };
  }).filter(entry => entry.items.length);

  itemsBySubject.sort((a, b) => b.avgMemory - a.avgMemory);
  const best = itemsBySubject[0];
  const generatedHeavy = itemsBySubject.find(entry => entry.generatedRatio >= 0.6);

  const lines = [];
  if (best) {
    lines.push(`${best.subject.name} 과목은 최근 기록 기준으로 기억 강도가 가장 높습니다 (${best.avgMemory.toFixed(1)}/5).`);
  }
  if (generatedHeavy) {
    lines.push(`${generatedHeavy.subject.name} 과목은 생성 단계가 자주 들어가며, 이 방식이 유지되는 편입니다.`);
  }

  const recent = data.metaLogs.slice(0, 5);
  const recentFocus = average(recent.map(log => log.after.focus || 0));
  if (recentFocus >= 4) {
    lines.push('최근 세션들의 실제 집중도가 높게 유지되고 있습니다. 지금 루틴을 반복하는 것이 유리합니다.');
  } else {
    lines.push('최근 세션은 집중 편차가 있는 편입니다. 시작 장벽을 낮추는 작은 미션부터 진입하는 전략이 유효합니다.');
  }

  return lines.join(' ');
}
