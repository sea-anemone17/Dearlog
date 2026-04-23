import { generateId, escapeHtml, formatDate, splitTags } from './utils.js';
import { buildMetaLog } from './meta.js';

export function addStudyItem(data, formData) {
  const item = {
    id: generateId('study'),
    subjectId: formData.studySubject,
    missionId: formData.studyMission || '',
    title: formData.studyTitle,
    input: formData.studyInput,
    core: formData.studyCore,
    usage: splitTags(formData.studyUsage),
    generated: formData.studyGenerated,
    validation: {
      result: formData.validationResult,
      mistake: formData.validationMistake
    },
    createdAt: Date.now()
  };

  const metaLog = buildMetaLog(item, formData);

  data.studyItems.unshift(item);
  data.metaLogs.unshift(metaLog);

  return { item, metaLog };
}

export function renderRecentSessions(data, container) {
  const items = data.studyItems.slice(0, 5);
  if (!items.length) {
    container.innerHTML = '<div class="empty">아직 저장된 세션이 없습니다.</div>';
    return;
  }
  container.innerHTML = items.map(item => {
    const subject = data.subjects.find(subject => subject.id === item.subjectId);
    return `
      <article class="session-item">
        <div class="item-row">
          <strong>${escapeHtml(item.title)}</strong>
          <span class="tag">${escapeHtml(subject?.name ?? '미분류')}</span>
          <span class="tag">${formatDate(item.createdAt)}</span>
        </div>
        <p class="small muted">${escapeHtml(item.generated || item.core || item.input.slice(0, 80))}</p>
      </article>
    `;
  }).join('');
}

export function renderArchive(data, container, keyword = '') {
  const normalized = keyword.trim().toLowerCase();
  const filtered = data.studyItems.filter(item => {
    const subjectName = data.subjects.find(subject => subject.id === item.subjectId)?.name ?? '';
    const haystack = [item.title, item.input, item.core, item.generated, subjectName, ...(item.usage || [])]
      .join(' ')
      .toLowerCase();
    return haystack.includes(normalized);
  });

  if (!filtered.length) {
    container.innerHTML = '<div class="empty">검색 결과가 없습니다.</div>';
    return;
  }

  container.innerHTML = filtered.map(item => {
    const subject = data.subjects.find(subject => subject.id === item.subjectId);
    return `
      <article class="archive-item">
        <div class="item-row">
          <strong>${escapeHtml(item.title)}</strong>
          <span class="tag">${escapeHtml(subject?.name ?? '미분류')}</span>
          <span class="tag">${item.validation?.result ?? 'unchecked'}</span>
        </div>
        <p class="small muted">입력: ${escapeHtml(item.input.slice(0, 80))}</p>
        <p class="small">생성: ${escapeHtml((item.generated || '없음').slice(0, 100))}</p>
        <div class="item-row">
          ${(item.usage || []).map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}
        </div>
      </article>
    `;
  }).join('');
}
