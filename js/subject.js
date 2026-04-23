import { generateId, escapeHtml } from './utils.js';

export function addSubject(data, { name, color }) {
  const subject = {
    id: generateId('sub'),
    name,
    color,
    description: ''
  };
  data.subjects.unshift(subject);
  return subject;
}

export function deleteSubject(data, subjectId) {
  data.subjects = data.subjects.filter(subject => subject.id !== subjectId);
  data.missions = data.missions.filter(mission => mission.subjectId !== subjectId);
  data.studyItems = data.studyItems.filter(item => item.subjectId !== subjectId);
  data.metaLogs = data.metaLogs.filter(log => log.subjectId !== subjectId);
}

export function renderSubjectList(data, container) {
  if (!data.subjects.length) {
    container.innerHTML = '<div class="empty">아직 과목이 없습니다.</div>';
    return;
  }
  container.innerHTML = data.subjects.map(subject => `
    <article class="subject-item">
      <div class="subject-row">
        <span class="subject-dot" style="background:${subject.color}"></span>
        <strong>${escapeHtml(subject.name)}</strong>
        <button type="button" class="secondary small delete-subject" data-id="${subject.id}">삭제</button>
      </div>
    </article>
  `).join('');
}

export function renderSubjectOptions(subjects, ...selects) {
  const options = subjects.map(subject => `<option value="${subject.id}">${escapeHtml(subject.name)}</option>`).join('');
  selects.forEach(select => {
    select.innerHTML = options || '<option value="">과목 없음</option>';
  });
}
