import { loadData, saveData, exportData, importData, resetData } from './storage.js';
import { addSubject, deleteSubject, renderSubjectList, renderSubjectOptions } from './subject.js';
import { addMission, deleteMission, renderMissionList, renderMissionOptions } from './mission.js';
import { addStudyItem, renderRecentSessions, renderArchive } from './study.js';
import { getSummaryStats } from './meta.js';
import { getPraise } from './praise.js';
import { buildAnalysis } from './analytics.js';
import { renderStats } from './dashboard.js';
import { ROLE_MODES } from "./roleMode.js";

let data = loadData();

const subjectForm = document.getElementById('subjectForm');
const subjectName = document.getElementById('subjectName');
const subjectColor = document.getElementById('subjectColor');
const subjectList = document.getElementById('subjectList');

const missionForm = document.getElementById('missionForm');
const missionSubject = document.getElementById('missionSubject');
const missionTitle = document.getElementById('missionTitle');
const missionPrompt = document.getElementById('missionPrompt');
const missionList = document.getElementById('missionList');

const studyForm = document.getElementById('studyForm');
const studySubject = document.getElementById('studySubject');
const studyMission = document.getElementById('studyMission');
const praiseBox = document.getElementById('praiseBox');
const analysisBox = document.getElementById('analysisBox');
const summaryStats = document.getElementById('summaryStats');
const recentSessions = document.getElementById('recentSessions');
const archiveList = document.getElementById('archiveList');
const archiveSearch = document.getElementById('archiveSearch');
const exportBtn = document.getElementById('exportBtn');
const importInput = document.getElementById('importInput');
const resetBtn = document.getElementById('resetBtn');
const clearStudyFormBtn = document.getElementById('clearStudyFormBtn');
const normalModeBtn = document.getElementById('normalModeBtn');
const gonadiModeBtn = document.getElementById('gonadiModeBtn');
const roleModeSelect = document.getElementById("roleModeSelect");
const roleModeBox = document.getElementById("roleModeBox");

function renderAll() {
  renderSubjectList(data, subjectList);
  renderMissionList(data, missionList);
  renderSubjectOptions(data.subjects, missionSubject, studySubject);
  renderMissionOptions(data, studySubject.value || data.subjects[0]?.id, studyMission);
  renderStats(getSummaryStats(data), summaryStats);
  analysisBox.textContent = buildAnalysis(data);
  renderRecentSessions(data, recentSessions);
  renderArchive(data, archiveList, archiveSearch.value);
  updateModeButtons();
}

function persistAndRender() {
  saveData(data);
  renderAll();
}

function renderRoleMode() {
  if (!roleModeSelect || !roleModeBox) return;

  roleModeSelect.innerHTML = Object.values(ROLE_MODES)
    .map(mode => `
      <option value="${mode.id}" ${data.settings?.roleMode === mode.id ? 'selected' : ''}>
        ${mode.name}
      </option>
    `)
    .join('');

  const mode = ROLE_MODES[data.settings?.roleMode] ?? ROLE_MODES.englishTeacher;

  roleModeBox.innerHTML = `
    <strong>${mode.role}</strong>
    <p>${mode.opening}</p>
    <p class="muted">오늘의 업무: ${mode.missionLabel ?? mode.mission}</p>
  `;
}

function updateModeButtons() {
  const isGonadi = data.settings?.praiseMode === 'gonadi';
  normalModeBtn.classList.toggle('active', !isGonadi);
  gonadiModeBtn.classList.toggle('active', isGonadi);
}

subjectForm.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!subjectName.value.trim()) return;
  addSubject(data, { name: subjectName.value.trim(), color: subjectColor.value });
  subjectForm.reset();
  subjectColor.value = '#7c9dff';
  persistAndRender();
});

subjectList.addEventListener('click', (event) => {
  const btn = event.target.closest('.delete-subject');
  if (!btn) return;
  deleteSubject(data, btn.dataset.id);
  persistAndRender();
});

missionForm.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!missionSubject.value || !missionTitle.value.trim() || !missionPrompt.value.trim()) return;
  addMission(data, {
    subjectId: missionSubject.value,
    title: missionTitle.value.trim(),
    prompt: missionPrompt.value.trim()
  });
  missionForm.reset();
  persistAndRender();
});

missionList.addEventListener('click', (event) => {
  const btn = event.target.closest('.delete-mission');
  if (!btn) return;
  deleteMission(data, btn.dataset.id);
  persistAndRender();
});

studySubject.addEventListener('change', () => {
  renderMissionOptions(data, studySubject.value, studyMission);
});

studyForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const formData = Object.fromEntries(new FormData(studyForm).entries());
  const { item, metaLog } = addStudyItem(data, formData);
  const praise = getPraise(item, metaLog, data.settings?.praiseMode || 'normal');
  praiseBox.textContent = praise;
  saveData(data);
  renderAll();
  studyForm.reset();
});

clearStudyFormBtn.addEventListener('click', () => {
  studyForm.reset();
});

archiveSearch.addEventListener('input', () => {
  renderArchive(data, archiveList, archiveSearch.value);
});

exportBtn.addEventListener('click', () => exportData(data));

importInput.addEventListener('change', async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  data = await importData(file);
  renderAll();
  importInput.value = '';
});

resetBtn.addEventListener('click', () => {
  const ok = window.confirm('Dearlog 데이터를 모두 초기화할까요?');
  if (!ok) return;
  data = resetData();
  renderAll();
  praiseBox.textContent = '새로운 흐름을 시작할 준비가 되었어요.';
});

normalModeBtn.addEventListener('click', () => {
  data.settings.praiseMode = 'normal';
  saveData(data);
  updateModeButtons();
});

roleModeSelect?.addEventListener('change', () => {
  data.settings.roleMode = roleModeSelect.value;
  saveData(data);
  renderAll();
});

gonadiModeBtn.addEventListener('click', () => {
  data.settings.praiseMode = 'gonadi';
  saveData(data);
  updateModeButtons();
  renderRoleMode();
});

renderAll();
