const STORAGE_KEY = 'dearlog_v1';

const defaultState = {
  subjects: [
    { id: crypto.randomUUID(), name: '영어', color: '#8ea2ff', icon: '📘', description: '문장 구조를 분석하고 창작 문장으로 변형합니다.' },
    { id: crypto.randomUUID(), name: '국어', color: '#f3d8ff', icon: '✍️', description: '지문 구조를 뜯고 표현 기술을 추출합니다.' },
    { id: crypto.randomUUID(), name: '수학', color: '#8df0c2', icon: '📐', description: '개념을 규칙으로 이해하고 조건을 바꿔 봅니다.' }
  ],
  missions: [],
  studyItems: [],
  metaLogs: [],
  quickStatus: null
};

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedDefaultMissions(structuredClone(defaultState));
    const parsed = JSON.parse(raw);
    return ensureState(seedDefaultMissions(parsed));
  } catch {
    return seedDefaultMissions(structuredClone(defaultState));
  }
}

function seedDefaultMissions(state) {
  if (state.missions?.length) return state;
  const english = state.subjects.find(s => s.name === '영어');
  const korean = state.subjects.find(s => s.name === '국어');
  const math = state.subjects.find(s => s.name === '수학');
  state.missions = [
    { id: crypto.randomUUID(), subjectId: english?.id, title: '문장 구조 분석', prompt: '이 문장의 구조를 뜯고 핵심 역할을 적어 보세요.' },
    { id: crypto.randomUUID(), subjectId: english?.id, title: '문장 변형', prompt: '이 문장을 캐릭터 대사나 소설 문장으로 바꿔 보세요.' },
    { id: crypto.randomUUID(), subjectId: korean?.id, title: '지문 구조 추출', prompt: '주장-근거-예시 흐름을 뽑아 보세요.' },
    { id: crypto.randomUUID(), subjectId: korean?.id, title: '표현 재작성', prompt: '표현 기법을 내 문체로 바꿔 보세요.' },
    { id: crypto.randomUUID(), subjectId: math?.id, title: '조건 변형', prompt: '문제의 조건 하나를 바꿔 새 문제를 만들어 보세요.' }
  ].filter(m => m.subjectId);
  return state;
}

function ensureState(state) {
  return {
    subjects: state.subjects || [],
    missions: state.missions || [],
    studyItems: state.studyItems || [],
    metaLogs: state.metaLogs || [],
    quickStatus: state.quickStatus || null
  };
}

let state = loadState();

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function $(id) { return document.getElementById(id); }
function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
function formatDate(timestamp) {
  const d = new Date(timestamp);
  return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}
function subjectById(id) {
  return state.subjects.find(s => s.id === id);
}
function missionById(id) {
  return state.missions.find(m => m.id === id);
}
function missionsForSubject(subjectId) {
  return state.missions.filter(m => m.subjectId === subjectId);
}

function getPraisePayload(studyItem, meta) {
  if (studyItem.generated?.trim()) {
    return '🔥 이건 단순 기록이 아니라 네 방식대로 구조를 다시 만든 거예요. 지금 공부가 아니라 구축을 하고 있어요.';
  }
  if (studyItem.validation?.result === 'wrong') {
    return '🌱 막힌 지점을 찾은 것도 큰 진전이에요. 이건 실패가 아니라 다음 구조 수정을 위한 데이터예요.';
  }
  if ((meta?.after?.focus || 0) >= 4) {
    return '✨ 집중이 올라간 이유를 찾았네요. 이 패턴을 다시 쓰면 Dearlog가 점점 더 Hazel 맞춤형이 됩니다.';
  }
  return '💫 시작해서 기록을 남긴 것만으로도 충분히 의미 있어요. 구조는 한 번 쌓이면 계속 남습니다.';
}

function computeInsights() {
  const items = state.studyItems;
  const meta = state.metaLogs;
  if (!items.length) {
    return ['아직 기록이 적어요. 첫 세션 몇 개만 쌓이면 Dearlog가 패턴을 읽기 시작합니다.'];
  }

  const generatedCount = items.filter(i => i.generated?.trim()).length;
  const usageCount = items.filter(i => i.usage?.length).length;
  const avgMemory = meta.length
    ? (meta.reduce((sum, m) => sum + (Number(m.after?.memory) || 0), 0) / meta.length).toFixed(1)
    : null;
  const avgFocusGap = meta.length
    ? (meta.reduce((sum, m) => sum + ((Number(m.after?.focus)||0) - (Number(m.before?.focus)||0)), 0) / meta.length).toFixed(1)
    : null;

  const insights = [];
  insights.push(`생성 결과가 있는 세션이 ${generatedCount}개예요. Dearlog는 만들수록 더 강해지는 구조입니다.`);
  insights.push(`사용처를 적은 세션이 ${usageCount}개예요. “어디에 쓸까”를 적을수록 기억 고리가 강해집니다.`);
  if (avgMemory !== null) insights.push(`현재 평균 기억 잔존감은 ${avgMemory}/5입니다.`);
  if (avgFocusGap !== null) {
    const descriptor = Number(avgFocusGap) >= 0 ? '상승' : '하락';
    insights.push(`예상 집중도 대비 실제 집중도는 평균 ${avgFocusGap}만큼 ${descriptor}했습니다.`);
  }
  return insights;
}

function subjectStats() {
  return state.subjects.map(subject => {
    const items = state.studyItems.filter(item => item.subjectId === subject.id);
    const metaIds = new Set(items.map(item => item.id));
    const metas = state.metaLogs.filter(log => metaIds.has(log.sessionId));
    const generated = items.filter(i => i.generated?.trim()).length;
    const avgMemory = metas.length ? (metas.reduce((sum, m) => sum + (Number(m.after?.memory)||0), 0) / metas.length).toFixed(1) : '-';
    return {
      subject,
      count: items.length,
      generated,
      avgMemory
    };
  });
}

function renderSubjectOptions() {
  const subjectSelects = [$('missionSubject'), $('studySubject')];
  const archiveFilter = $('archiveSubjectFilter');
  const subjectOptions = state.subjects.map(s => `<option value="${s.id}">${escapeHtml(s.name)}</option>`).join('');
  subjectSelects.forEach(sel => {
    if (!sel) return;
    sel.innerHTML = state.subjects.length ? subjectOptions : '<option value="">과목이 없습니다</option>';
  });
  archiveFilter.innerHTML = `<option value="">전체</option>${subjectOptions}`;
  renderMissionOptions();
}

function renderMissionOptions() {
  const subjectId = $('studySubject').value || state.subjects[0]?.id;
  const missions = missionsForSubject(subjectId);
  const options = [`<option value="">미션 선택 안 함</option>`].concat(
    missions.map(m => `<option value="${m.id}">${escapeHtml(m.title)}</option>`)
  ).join('');
  $('studyMission').innerHTML = options;
}

function renderSubjects() {
  const el = $('subjectList');
  if (!state.subjects.length) {
    el.innerHTML = '<div class="empty">과목이 없습니다.</div>';
    return;
  }
  el.innerHTML = state.subjects.map(subject => `
    <div class="subject-item">
      <div class="subject-item-head">
        <div>
          <div class="subject-badge"><span class="dot" style="background:${escapeHtml(subject.color)}"></span> ${escapeHtml(subject.icon || '📘')} ${escapeHtml(subject.name)}</div>
          <p class="meta-row">${escapeHtml(subject.description || '설명 없음')}</p>
        </div>
        <button class="delete-btn" data-delete-subject="${subject.id}">삭제</button>
      </div>
    </div>
  `).join('');
}

function renderMissions() {
  const el = $('missionList');
  if (!state.missions.length) {
    el.innerHTML = '<div class="empty">미션이 없습니다.</div>';
    return;
  }
  el.innerHTML = state.missions.map(mission => {
    const subject = subjectById(mission.subjectId);
    return `
      <div class="mission-item">
        <div class="mission-item-head">
          <div>
            <strong>${escapeHtml(mission.title)}</strong>
            <div class="meta-row">과목: ${escapeHtml(subject?.name || '알 수 없음')}</div>
            <div class="meta-row">${escapeHtml(mission.prompt || '프롬프트 없음')}</div>
          </div>
          <button class="delete-btn" data-delete-mission="${mission.id}">삭제</button>
        </div>
      </div>
    `;
  }).join('');
}

function renderArchive() {
  const filterSubject = $('archiveSubjectFilter').value;
  const search = $('archiveSearch').value.trim().toLowerCase();
  const el = $('archiveList');
  let items = [...state.studyItems].reverse();
  if (filterSubject) items = items.filter(item => item.subjectId === filterSubject);
  if (search) {
    items = items.filter(item => [item.title, item.core, item.generated, item.input].some(v => (v || '').toLowerCase().includes(search)));
  }
  if (!items.length) {
    el.innerHTML = '<div class="empty">조건에 맞는 기록이 없습니다.</div>';
    return;
  }
  el.innerHTML = items.map(item => {
    const subject = subjectById(item.subjectId);
    const mission = missionById(item.missionId);
    return `
      <div class="archive-item">
        <div class="archive-item-head">
          <div>
            <strong>${escapeHtml(item.title)}</strong>
            <div class="archive-meta">${escapeHtml(subject?.name || '과목 없음')} · ${escapeHtml(mission?.title || '미션 없음')} · ${formatDate(item.createdAt)}</div>
          </div>
        </div>
        <div class="meta-row"><strong>왜:</strong> ${escapeHtml(item.why || '-')}</div>
        <div class="meta-row"><strong>핵심:</strong> ${escapeHtml(item.core || '-')}</div>
        <div class="meta-row"><strong>생성:</strong> ${escapeHtml(item.generated || '-')}</div>
        <div>${(item.usage || []).map(tag => `<span class="small-tag">${escapeHtml(tag)}</span>`).join('')}</div>
      </div>
    `;
  }).join('');
}

function renderDashboard() {
  const recentGenerated = $('recentGenerated');
  const recentMeta = $('recentMeta');
  const recentItems = [...state.studyItems].reverse().slice(0, 3);
  recentGenerated.innerHTML = recentItems.length ? recentItems.map(item => {
    const subject = subjectById(item.subjectId);
    return `<div class="archive-item"><strong>${escapeHtml(item.title)}</strong><div class="archive-meta">${escapeHtml(subject?.name || '과목 없음')}</div><div class="meta-row">${escapeHtml(item.generated || item.core || item.input || '-')}</div></div>`;
  }).join('') : '아직 생성 기록이 없습니다.';

  const recentLogs = [...state.metaLogs].reverse().slice(0, 3);
  recentMeta.innerHTML = recentLogs.length ? recentLogs.map(log => {
    const item = state.studyItems.find(i => i.id === log.sessionId);
    return `<div class="meta-item"><strong>${escapeHtml(item?.title || '세션')}</strong><div class="meta-row">집중 ${log.before.focus} → ${log.after.focus} / 이해 ${log.after.understanding} / 기억 ${log.after.memory}</div><div class="meta-row">${escapeHtml(log.reflection.worked || '')}</div></div>`;
  }).join('') : '아직 메타인지 기록이 없습니다.';

  const insights = computeInsights();
  $('todayAnalysis').textContent = insights[0];
  $('dashboardPraise').textContent = recentItems[0] ? getPraisePayload(recentItems[0], state.metaLogs.find(l => l.sessionId === recentItems[0].id)) : '오늘도 구조를 하나 만들어 봅시다 ✨';

  if (state.quickStatus) {
    $('quickMood').value = state.quickStatus.mood;
    $('quickFocus').value = state.quickStatus.focus;
    $('quickBarrier').value = state.quickStatus.barrier;
    $('quickWhy').value = state.quickStatus.why;
  }
}

function renderInsightsSection() {
  $('insightsBox').innerHTML = computeInsights().map(text => `<div class="insight-item">${escapeHtml(text)}</div>`).join('');
  const stats = subjectStats();
  $('subjectStats').innerHTML = stats.length ? stats.map(s => `
    <div class="insight-item">
      <strong>${escapeHtml(s.subject.name)}</strong>
      <div class="meta-row">세션 수: ${s.count}</div>
      <div class="meta-row">생성 기록: ${s.generated}</div>
      <div class="meta-row">평균 기억 잔존감: ${s.avgMemory}</div>
    </div>
  `).join('') : '<div class="empty">과목이 없습니다.</div>';
}

function renderLivePraise() {
  const studyItem = {
    generated: $('studyGenerated').value,
    validation: { result: $('studyValidationResult').value }
  };
  const meta = { after: { focus: $('metaAfterFocus').value } };
  $('livePraise').textContent = getPraisePayload(studyItem, meta);
}

function rerender() {
  renderSubjectOptions();
  renderSubjects();
  renderMissions();
  renderArchive();
  renderDashboard();
  renderInsightsSection();
  renderLivePraise();
}

function resetStudyForm() {
  $('studyForm').reset();
  if (state.subjects[0]) $('studySubject').value = state.subjects[0].id;
  renderMissionOptions();
  $('metaBeforeMood').value = 3;
  $('metaBeforeFocus').value = 3;
  $('metaBeforeUnderstanding').value = 3;
  $('metaBeforeBarrier').value = 2;
  $('metaAfterFocus').value = 3;
  $('metaAfterUnderstanding').value = 3;
  $('metaAfterMemory').value = 3;
  renderLivePraise();
}

function switchTab(tabName) {
  document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
  $(`tab-${tabName}`).classList.add('active');
  document.querySelector(`.nav-btn[data-tab="${tabName}"]`)?.classList.add('active');
}

document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => switchTab(btn.dataset.tab));
});

$('jumpToSessionBtn').addEventListener('click', () => switchTab('session'));
$('studySubject').addEventListener('change', renderMissionOptions);
$('archiveSubjectFilter').addEventListener('change', renderArchive);
$('archiveSearch').addEventListener('input', renderArchive);
['studyGenerated','studyValidationResult','metaAfterFocus'].forEach(id => $(id).addEventListener('input', renderLivePraise));
$('resetStudyBtn').addEventListener('click', resetStudyForm);

$('saveQuickStatusBtn').addEventListener('click', () => {
  state.quickStatus = {
    mood: $('quickMood').value,
    focus: $('quickFocus').value,
    barrier: $('quickBarrier').value,
    why: $('quickWhy').value.trim()
  };
  saveState();
  renderDashboard();
});

$('subjectForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const name = $('subjectName').value.trim();
  if (!name) return;
  state.subjects.push({
    id: crypto.randomUUID(),
    name,
    color: $('subjectColor').value,
    icon: $('subjectIcon').value.trim() || '📘',
    description: $('subjectDescription').value.trim()
  });
  saveState();
  e.target.reset();
  $('subjectColor').value = '#7c9dff';
  rerender();
});

$('missionForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const subjectId = $('missionSubject').value;
  const title = $('missionTitle').value.trim();
  if (!subjectId || !title) return;
  state.missions.push({
    id: crypto.randomUUID(),
    subjectId,
    title,
    prompt: $('missionPrompt').value.trim()
  });
  saveState();
  e.target.reset();
  rerender();
});

$('studyForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const id = crypto.randomUUID();
  const usage = $('studyUsage').value.split(',').map(v => v.trim()).filter(Boolean);
  const studyItem = {
    id,
    subjectId: $('studySubject').value,
    missionId: $('studyMission').value || null,
    title: $('studyTitle').value.trim(),
    why: $('studyWhy').value.trim(),
    input: $('studyInput').value.trim(),
    core: $('studyCore').value.trim(),
    usage,
    confusion: $('studyConfusion').value.trim(),
    generated: $('studyGenerated').value.trim(),
    validation: {
      type: $('studyValidationType').value,
      result: $('studyValidationResult').value,
      mistake: $('studyMistake').value.trim()
    },
    createdAt: Date.now()
  };
  const metaLog = {
    sessionId: id,
    before: {
      mood: Number($('metaBeforeMood').value),
      focus: Number($('metaBeforeFocus').value),
      understanding: Number($('metaBeforeUnderstanding').value),
      barrier: Number($('metaBeforeBarrier').value)
    },
    after: {
      focus: Number($('metaAfterFocus').value),
      understanding: Number($('metaAfterUnderstanding').value),
      memory: Number($('metaAfterMemory').value)
    },
    reflection: {
      worked: $('metaWorked').value.trim(),
      blocked: $('metaBlocked').value.trim(),
      improve: $('metaImprove').value.trim()
    },
    createdAt: Date.now()
  };
  state.studyItems.push(studyItem);
  state.metaLogs.push(metaLog);
  saveState();
  rerender();
  switchTab('dashboard');
  alert('세션이 저장되었습니다. ✨');
  resetStudyForm();
});

document.addEventListener('click', (e) => {
  const subjectId = e.target.getAttribute('data-delete-subject');
  const missionId = e.target.getAttribute('data-delete-mission');
  if (subjectId) {
    state.subjects = state.subjects.filter(s => s.id !== subjectId);
    state.missions = state.missions.filter(m => m.subjectId !== subjectId);
    state.studyItems = state.studyItems.filter(i => i.subjectId !== subjectId);
    state.metaLogs = state.metaLogs.filter(log => state.studyItems.some(i => i.id === log.sessionId));
    saveState();
    rerender();
  }
  if (missionId) {
    state.missions = state.missions.filter(m => m.id !== missionId);
    saveState();
    rerender();
  }
});

rerender();
resetStudyForm();
