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

  window.gameInstance = game;
  board.render(game);

  // 全局开局处理函数
  window.onGameStart = function (mode, side) {
    gameMode = mode;
    playerSide = side || 'r';
    moveCount = 0;

    game = new Xiangqi();
    window.gameInstance = game;
    board.render(game);

    // 清空侧边栏 AI 评估日志表格
    clearAiStatsTable();
    updateAiCurrentStatus('对局已开始。等待执红方落子...');

    // 若玩家选择执黑，AI 自动先手下第一步
    if (gameMode === 'pve' && playerSide === 'b') {
      triggerAiThink();
    }
  };

  // 处理人类玩家落子
  function handleHumanMove(from, to) {
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
    // 向 Worker 发送搜索请求，限制 5 秒思考
    const currentFen = game.fen();
    console.log('发送 FEN 给象眼引擎:', currentFen);
  }

  // 动态向右侧侧边栏表格追加真实数据行 (绝不填充 Mock 数据)
  function appendMoveToTable(source, moveStr, info) {
    const tbody = document.getElementById('ai-stats-body');
    const emptyRow = document.getElementById('ai-stats-empty');
    if (emptyRow) emptyRow.remove();

    const tr = document.createElement('tr');
    const sideText = (game.turn === 'b') ? '红' : '黑'; // 刚走的这一步的棋子阵营
    const sourceClass = (source === 'AI') ? 'source-ai' : 'source-human';
    
    let depthStr = '-';
    let nodesStr = '-';
    let npsStr = '-';
    let timeStr = '-';
    let scoreStr = '-';
    let scoreClass = 'score-neutral';

    if (info) {
      if (info.depth !== undefined) depthStr = info.depth;
      if (info.nodes !== undefined) nodesStr = info.nodes.toLocaleString();
      if (info.nps !== undefined) npsStr = info.nps.toLocaleString();
      if (info.time !== undefined) timeStr = info.time + 'ms';
      if (info.score !== undefined) {
        scoreStr = info.score;
        if (info.score > 0) scoreClass = 'score-positive';
        else if (info.score < 0) scoreClass = 'score-negative';
      }
    }

    tr.innerHTML = `
      <td>${moveCount}</td>
      <td>${sideText}</td>
      <td class="${sourceClass}">${source}</td>
      <td>${moveStr}</td>
      <td>${depthStr}</td>
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
