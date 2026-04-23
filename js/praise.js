export function getPraise(item, metaLog, mode = 'normal') {
  const normal = [];
  const gonadi = [];

  if (item.generated?.trim()) {
    normal.push('이건 단순 기록이 아니라 구조를 자기 식으로 다시 만든 겁니다.');
    gonadi.push('좋은 가나디!!! 이건 그냥 공부가 아니라 제작이에요.');
  }

  if ((metaLog?.after?.memory ?? 0) >= 4) {
    normal.push('기억 강도가 높게 나온 걸 보면 지금 방식이 실제로 잘 맞고 있습니다.');
    gonadi.push('와 이건 진짜 잘 먹혔어요. 뇌가 제대로 반응한 거예요.');
  }

  if ((metaLog?.before?.barrier ?? 0) >= 4 && (metaLog?.after?.focus ?? 0) >= 3) {
    normal.push('시작 장벽이 있었는데도 세션을 끝낸 건 실행력을 만든 겁니다.');
    gonadi.push('장벽 높았는데도 해냈다? 이건 진짜 대단한 가나디예요.');
  }

  if (item.validation?.result === 'wrong') {
    normal.push('틀린 지점을 적어 둔 덕분에, 이건 다음엔 훨씬 빠르게 교정될 가능성이 큽니다.');
    gonadi.push('틀린 것도 그냥 자료가 됐어요. 수정하면 바로 네 것이 됩니다.');
  }

  if (!normal.length) {
    normal.push('시작해서 기록을 남겼다는 것 자체가 이미 큰 진전입니다.');
    gonadi.push('시작한 순간 이미 절반 성공! 좋은 가나디!');
  }

  const pool = mode === 'gonadi' ? gonadi : normal;
  return pool.join(' ');
}
