/**
 * app.js - 主应用装配与 UI 交互控制器
 * 严格使用真实数据填充 AI 评分表，拒绝任何 Mock
 */

document.addEventListener('DOMContentLoaded', function () {
  let game = new Xiangqi();
  let board = null;
  let moveCount = 0;
  let playerSide = 'r'; // 'r' 执红先走，'b' 执黑后走
  let gameMode = 'pve';  // 'pve', 'pvp', 'eve'

  // 初始化 DOM 9x10 棋盘
  board = new XiangqiBoard('board-container', {
    onMove: function (from, to) {
      handleHumanMove(from, to);
    }
  });

  let worker = null;
  let latestInfo = null;

  // 初始化 ElephantEye Worker 算力桥接
  try {
    worker = new Worker('./js/worker/eleeye.worker.js');
    worker.postMessage({ type: 'INIT' });

    worker.onmessage = function (e) {
      const data = e.data || {};
      if (data.type === 'INFO') {
        latestInfo = data.info;
        if (latestInfo) {
          updateAiCurrentStatus(`象眼 AI 深度搜索中... 深度:${latestInfo.depth || '-'}, 节点:${latestInfo.nodes || '-'}, 耗时:${latestInfo.time || '-'}ms`);
        }
      } else if (data.type === 'BEST_MOVE') {
        handleAiBestMove(data.move, latestInfo);
        latestInfo = null;
      }
    };
  } catch (err) {
    console.warn('Worker 初始化提示:', err);
  }

  // 处理 AI 最佳落子
  function handleAiBestMove(ucciMove, info) {
    const sq = game.ucciToSq(ucciMove);
    if (!sq) return;

    const moveResult = game.move(sq.from, sq.to);
    if (moveResult) {
      moveCount++;
      board.render(game);
      appendMoveToTable('AI', moveResult, info);

      if (gameMode === 'eve') {
        updateAiCurrentStatus('AI 落子完成。准备进行下一步对决...');
        setTimeout(() => {
          triggerAiThink();
        }, 500);
      } else if (gameMode === 'pve') {
        updateAiCurrentStatus('AI 落子完成。轮到玩家思考落子...');
      }
    }
  }

  window.gameInstance = game;
  board.render(game);

  // 动态更新顶栏左右两侧球形徽章内的字符 (AI / 玩家)
  function updateRoleTags(mode, side) {
    const blackScore = document.getElementById('black-score');
    const redScore = document.getElementById('red-score');
    if (!blackScore || !redScore) return;

    if (mode === 'eve') {
      blackScore.textContent = 'AI';
      redScore.textContent = 'AI';
    } else if (mode === 'pvp') {
      blackScore.textContent = '玩家';
      redScore.textContent = '玩家';
    } else { // pve
      if (side === 'r') {
        blackScore.textContent = 'AI';
        redScore.textContent = '玩家';
      } else {
        blackScore.textContent = '玩家';
        redScore.textContent = 'AI';
      }
    }
  }

  // 全局开局处理函数
  window.onGameStart = function (mode, side) {
    gameMode = mode;
    playerSide = side || 'r';
    moveCount = 0;

    game = new Xiangqi();
    window.gameInstance = game;
    board.render(game);

    // 更新顶栏角色身份
    updateRoleTags(gameMode, playerSide);

    // 清空侧边栏 AI 评估日志表格
    clearAiStatsTable();
    if (gameMode === 'eve') {
      updateAiCurrentStatus('机机对战启动。象眼 AI 正在思考红方第一步...');
      triggerAiThink();
    } else if (gameMode === 'pve' && playerSide === 'b') {
      updateAiCurrentStatus('电脑执红先走。象眼 AI 正在思考红方第一步...');
      triggerAiThink();
    } else {
      updateAiCurrentStatus('对局已开始。等待执红玩家落子...');
    }
  };

  // 处理人类玩家落子
  function handleHumanMove(from, to) {
    if (gameMode === 'eve') {
      // 机机对战模式下禁止人类手动操控
      return;
    }

    const piece = game.board[from];
    if (gameMode === 'pve' && piece && piece.color !== playerSide) {
      // 人机对战时只有轮到玩家阵营才能点击操控
      return;
    }

    const moveResult = game.move(from, to);
    if (moveResult) {
      moveCount++;
      board.render(game);
      appendMoveToTable('玩家', moveResult, null);

      if (gameMode === 'pve') {
        updateAiCurrentStatus('玩家落子完成。象眼 AI 正在思考中...');
        triggerAiThink();
      }
    }
  }

  // 触发象眼 AI 思考
  function triggerAiThink() {
    const currentFen = game.fen();
    if (worker) {
      worker.postMessage({
        type: 'SEARCH',
        fen: currentFen,
        movetime: 5000
      });
    }
  }

  // 动态向右侧侧边栏表格追加真实数据行 (绝不填充 Mock 数据)
  function appendMoveToTable(source, moveStr, info) {
    const tbody = document.getElementById('ai-stats-body');
    const emptyRow = document.getElementById('ai-stats-empty');
    if (emptyRow) emptyRow.remove();

    const tr = document.createElement('tr');
    const sideText = (game.turn === 'b') ? '红' : '黑'; // 刚走的这一步的棋子阵营
    const sourceClass = (source === 'AI') ? 'source-ai' : 'source-human';
    
    let nodesStr = '-';
    let npsStr = '-';
    let timeStr = '-';
    let scoreStr = '-';
    let scoreClass = 'score-neutral';

    if (info) {
      if (info.nodes !== undefined && info.nodes !== '-') nodesStr = (typeof info.nodes === 'number') ? info.nodes.toLocaleString() : info.nodes;
      if (info.nps !== undefined && info.nps !== '-') npsStr = (typeof info.nps === 'number') ? info.nps.toLocaleString() : info.nps;
      if (info.time !== undefined && info.time !== '-') timeStr = (typeof info.time === 'number') ? info.time + 'ms' : info.time;
      if (info.score !== undefined && info.score !== null) {
        scoreStr = (info.score > 0 ? '+' : '') + info.score;
        if (info.score > 0) scoreClass = 'score-positive';
        else if (info.score < 0) scoreClass = 'score-negative';
      }
    }

    tr.innerHTML = `
      <td>${moveCount}</td>
      <td>${sideText}</td>
      <td class="${sourceClass}">${source}</td>
      <td>${moveStr}</td>
      <td>${nodesStr}</td>
      <td>${npsStr}</td>
      <td>${timeStr}</td>
      <td class="${scoreClass}">${scoreStr}</td>
    `;

    tbody.appendChild(tr);
    const wrap = document.getElementById('ai-table-wrap');
    if (wrap) wrap.scrollTop = wrap.scrollHeight;
  }

  // 清空 AI 统计表
  function clearAiStatsTable() {
    const tbody = document.getElementById('ai-stats-body');
    if (tbody) {
      tbody.innerHTML = `
        <tr id="ai-stats-empty">
          <td colspan="9">等待对局开始。开局后显示实时搜索统计</td>
        </tr>
      `;
    }
  }

  // 更新侧边栏底端提示文本
  function updateAiCurrentStatus(msg) {
    const currentEl = document.getElementById('ai-current');
    if (currentEl) {
      currentEl.innerText = msg;
    }
  }
});
