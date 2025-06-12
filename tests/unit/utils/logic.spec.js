// ユーティリティロジックテスト

describe('Utility Logic Tests', () => {
  test('座標変換のロジック', () => {
    const convertToPixels = (value) => `${value}px`;

    expect(convertToPixels(100)).toBe('100px');
    expect(convertToPixels(0)).toBe('0px');
    expect(convertToPixels(-50)).toBe('-50px');
  });

  test('距離計算のロジック', () => {
    const calculateDistance = (point1, point2) => {
      return Math.sqrt(
        Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2)
      );
    };

    const point1 = { x: 0, y: 0 };
    const point2 = { x: 3, y: 4 };

    expect(calculateDistance(point1, point2)).toBe(5); // 3-4-5 三角形
  });

  test('プレイヤー初期化のロジック', () => {
    const createDefaultPlayers = () => {
      return [
        // チーム1
        Array.from({ length: 15 }, (_, i) => ({
          x: 100 + (i * 30),
          y: 200,
          playerNumber: i + 1,
          team: 'team1'
        })),
        // チーム2
        Array.from({ length: 15 }, (_, i) => ({
          x: 100 + (i * 30),
          y: 400,
          playerNumber: i + 1,
          team: 'team2'
        }))
      ];
    };

    const players = createDefaultPlayers();

    expect(players).toHaveLength(2);
    expect(players[0]).toHaveLength(15);
    expect(players[1]).toHaveLength(15);
    expect(players[0][0]).toHaveProperty('team', 'team1');
    expect(players[1][0]).toHaveProperty('team', 'team2');
  });

  test('オブジェクト変換のロジック', () => {
    const transformPlayersToObject = (players) => {
      const result = {};
      players.forEach((team, teamIndex) => {
        result[teamIndex] = team.map(player => ({
          x: player.x,
          y: player.y,
          team: player.team
        }));
      });
      return result;
    };

    const mockPlayers = [
      [{ x: 100, y: 200, team: 'team1' }],
      [{ x: 100, y: 400, team: 'team2' }]
    ];

    const result = transformPlayersToObject(mockPlayers);

    expect(result).toHaveProperty('0');
    expect(result).toHaveProperty('1');
    expect(result['0'][0]).toHaveProperty('x', 100);
    expect(result['1'][0]).toHaveProperty('team', 'team2');
  });

  test('配列からオブジェクト変換', () => {
    const arrayToObject = (arr) => {
      return arr.reduce((obj, item, index) => {
        obj[index] = item;
        return obj;
      }, {});
    };

    const testArray = ['a', 'b', 'c'];
    const result = arrayToObject(testArray);

    expect(result).toEqual({
      '0': 'a',
      '1': 'b',
      '2': 'c'
    });
  });
});
