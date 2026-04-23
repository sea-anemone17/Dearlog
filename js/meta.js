import { average } from './utils.js';

export function buildMetaLog(item, formData) {
  return {
    id: item.id,
    subjectId: item.subjectId,
    before: {
      mood: Number(formData.beforeMood),
      focus: Number(formData.beforeFocus),
      barrier: Number(formData.beforeBarrier)
    },
    after: {
      focus: Number(formData.afterFocus),
      understanding: Number(formData.afterUnderstanding),
      memory: Number(formData.afterMemory)
    },
    reflection: {
      worked: formData.reflectionWorked,
      improve: formData.reflectionImprove
    },
    createdAt: item.createdAt
  };
}

export function getSummaryStats(data) {
  const count = data.studyItems.length;
  const logs = data.metaLogs;
  const avgFocus = average(logs.map(log => log.after.focus || 0));
  const avgMemory = average(logs.map(log => log.after.memory || 0));
  const generatedCount = data.studyItems.filter(item => item.generated?.trim()).length;

  return {
    count,
    avgFocus: avgFocus ? avgFocus.toFixed(1) : '0.0',
    avgMemory: avgMemory ? avgMemory.toFixed(1) : '0.0',
    generatedCount
  };
}
