import { generateId, escapeHtml } from './utils.js';

export function addMission(data, { subjectId, title, prompt }) {
  const mission = { id: generateId('mis'), subjectId, title, prompt };
  data.missions.unshift(mission);
  return mission;
}

export function deleteMission(data, missionId) {
  data.missions = data.missions.filter(mission => mission.id !== missionId);
}

export function renderMissionList(data, container) {
  if (!data.missions.length) {
    container.innerHTML = '<div class="empty">아직 미션이 없습니다.</div>';
    return;
  }
  container.innerHTML = data.missions.map(mission => {
    const subject = data.subjects.find(subject => subject.id === mission.subjectId);
    return `
      <article class="mission-item">
        <div class="mission-row">
          <strong>${escapeHtml(mission.title)}</strong>
          <span class="tag">${escapeHtml(subject?.name ?? '미분류')}</span>
          <button type="button" class="secondary small delete-mission" data-id="${mission.id}">삭제</button>
        </div>
        <p class="small muted">${escapeHtml(mission.prompt)}</p>
      </article>
    `;
  }).join('');
}

export function renderMissionOptions(data, subjectId, select) {
  const missions = data.missions.filter(mission => mission.subjectId === subjectId);
  select.innerHTML = '<option value="">미션 선택 안 함</option>' + missions.map(mission => `
    <option value="${mission.id}">${escapeHtml(mission.title)}</option>
  `).join('');
}
