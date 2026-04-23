import { generateId } from './utils.js';

export function createDefaultData() {
  const englishId = generateId('sub');
  const koreanId = generateId('sub');
  const mathId = generateId('sub');

  return {
    subjects: [
      { id: englishId, name: '영어', color: '#8aa2ff', description: '문장 구조와 창작 연결' },
      { id: koreanId, name: '국어', color: '#77e3c8', description: '구조 해체와 재작성' },
      { id: mathId, name: '수학', color: '#ffd36b', description: '규칙 이해와 조건 변형' }
    ],
    missions: [
      { id: generateId('mis'), subjectId: englishId, title: '문장 구조 분석', prompt: '이 문장의 구조를 분해하고 핵심을 적기' },
      { id: generateId('mis'), subjectId: englishId, title: '문장 변형', prompt: '이 문장을 캐릭터 대사나 소설 문장으로 바꾸기' },
      { id: generateId('mis'), subjectId: koreanId, title: '지문 구조 3줄 요약', prompt: '주장-근거-전개 순서를 3줄로 정리하기' },
      { id: generateId('mis'), subjectId: koreanId, title: '표현 재작성', prompt: '문학 표현을 내 문체로 다시 쓰기' },
      { id: generateId('mis'), subjectId: mathId, title: '조건 바꾸기', prompt: '문제 조건 하나를 바꿔 새 문제 만들기' },
      { id: generateId('mis'), subjectId: mathId, title: '개념 설명', prompt: '이 개념이 어디에 쓰이는지 설명문 쓰기' }
    ],
    studyItems: [],
    metaLogs: [],
    settings: { praiseMode: 'normal' }
  };
}
