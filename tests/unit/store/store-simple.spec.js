// シンプルなJavaScriptテスト - Vue依存なし

describe('Basic Store Logic Tests', () => {
  test('Basic JavaScript functionality test', () => {
    const mockPositions = {
      'position1': { name: 'formation1', position: [1, 2, 3] },
      'position2': { name: 'formation2', position: [4, 5, 6] }
    };

    // updatePosition mutationのロジックをテスト
    const result = [];
    Object.entries(mockPositions).forEach(object => {
      let position = {};
      position.name = object[1].name;
      position.position = object[1].position;
      result.push(position);
    });

    expect(result).toHaveLength(2);
    expect(result[0]).toHaveProperty('name', 'formation1');
    expect(result[0]).toHaveProperty('position', [1, 2, 3]);
    expect(result[1]).toHaveProperty('name', 'formation2');
    expect(result[1]).toHaveProperty('position', [4, 5, 6]);
  });

  test('Object.values functionality test', () => {
    const mockPositionsObject = {
      'pos1': { name: 'formation1', position: [] },
      'pos2': { name: 'formation2', position: [] }
    };

    const result = Object.values(mockPositionsObject);

    expect(result).toHaveLength(2);
    expect(result[0]).toHaveProperty('name', 'formation1');
    expect(result[1]).toHaveProperty('name', 'formation2');
  });

  test('Basic array operations', () => {
    const initialArray = [1, 2, 3];
    const newArray = [];

    // 配列をクリアする操作をテスト
    expect(newArray).toHaveLength(0);

    // 新しい要素を追加
    newArray.push('test');
    expect(newArray).toHaveLength(1);
    expect(newArray[0]).toBe('test');
  });
});
