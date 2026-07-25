/**
 * xiangqiboard.js - 中国象棋 DOM 棋盘渲染与菜单交互器
 *
 * @author Chris Oakman & lengyanyu258
 * @license MIT License
 * @see https://github.com/lengyanyu258/xiangqiboardjs
 *
 * Copyright (c) 2017-2023 Chris Oakman & lengyanyu258
 * Released under the MIT license
 */

(function (global) {
  'use strict';

  // 棋子汉字映射表
  const PIECE_NAMES = {
    'k': { 'r': '帅', 'b': '将' },
    'a': { 'r': '仕', 'b': '士' },
    'b': { 'r': '相', 'b': '象' },
    'n': { 'r': '马', 'b': '馬' },
    'r': { 'r': '车', 'b': '車' },
    'c': { 'r': '炮', 'b': '砲' },
    'p': { 'r': '兵', 'b': '卒' }
  };

  function XiangqiBoard(containerId, options) {
    this.container = document.getElementById(containerId);
    this.options = options || {};
    this.selectedSq = null;
    this.onMoveCallback = this.options.onMove || null;
    
    this.initDOM();
    this.bindMenuEvents();
  }

  // 初始化 DOM 结构
  XiangqiBoard.prototype.initDOM = function () {
    if (!this.container) return;
    this.container.innerHTML = '';
    
    const boardGrid = document.createElement('div');
    boardGrid.className = 'xiangqi-board-grid';
    boardGrid.style.cssText = 'position:relative; width:100%; height:100%; display:grid; grid-template-columns: repeat(9, 1fr); grid-template-rows: repeat(10, 1fr);';

    for (let r = 0; r < 10; r++) {
      for (let c = 0; c < 9; c++) {
        const sqIndex = r * 9 + c;
        const cell = document.createElement('div');
        cell.className = 'xiangqi-cell';
        cell.dataset.sq = sqIndex;
        cell.style.cssText = 'position:relative; display:flex; align-items:center; justify-content:center; cursor:pointer; user-select:none; border:1px solid rgba(141,91,40,0.2);';
        
        cell.addEventListener('click', this.onCellClick.bind(this, sqIndex));
        boardGrid.appendChild(cell);
      }
    }
    
    this.container.appendChild(boardGrid);

    // 渲染经典中国象棋“楚 河 漢 界”河界水墨大字
    const riverLayer = document.createElement('div');
    riverLayer.className = 'xiangqi-river-layer';
    riverLayer.style.cssText = `
      position: absolute;
      top: 40%;
      left: 0;
      width: 100%;
      height: 20%;
      display: flex;
      align-items: center;
      justify-content: space-around;
      pointer-events: none;
      z-index: 2;
      font-family: "Kaiti SC", "STKaiti", "KaiTi", serif;
      font-size: 26px;
      font-weight: 900;
      color: rgba(100, 60, 20, 0.45);
      letter-spacing: 12px;
      user-select: none;
    `;

    const riverLeft = document.createElement('div');
    riverLeft.innerText = '楚 河';
    const riverRight = document.createElement('div');
    riverRight.innerText = '漢 界';

    riverLayer.appendChild(riverLeft);
    riverLayer.appendChild(riverRight);
    this.container.appendChild(riverLayer);
  };

  // 根据 Xiangqi 实例数据更新渲染棋盘
  XiangqiBoard.prototype.render = function (game) {
    if (!game || !this.container) return;

    const cells = this.container.querySelectorAll('.xiangqi-cell');
    cells.forEach((cell, idx) => {
      cell.innerHTML = '';
      cell.classList.remove('selected', 'highlight');

      if (this.selectedSq === idx) {
        cell.classList.add('selected');
        cell.style.backgroundColor = 'rgba(39, 174, 96, 0.35)';
        cell.style.boxShadow = 'inset 0 0 8px #27ae60';
      } else {
        cell.style.backgroundColor = 'transparent';
        cell.style.boxShadow = 'none';
      }

      // 如果当前有选中的起子，高亮合法落子目标格
      if (this.selectedSq !== null && window.gameInstance && window.gameInstance.isLegalMove) {
        if (window.gameInstance.isLegalMove(this.selectedSq, idx)) {
          const hintDot = document.createElement('div');
          hintDot.className = 'move-hint-dot';
          hintDot.style.cssText = 'width: 14px; height: 14px; border-radius: 50%; background: rgba(39, 174, 96, 0.7); position: absolute; z-index: 5;';
          cell.appendChild(hintDot);
        }
      }

      const piece = game.board[idx];
      if (piece) {
        const pieceEl = document.createElement('div');
        pieceEl.className = 'xiangqi-piece ' + (piece.color === 'r' ? 'piece-red' : 'piece-black');
        const name = PIECE_NAMES[piece.type] ? PIECE_NAMES[piece.type][piece.color] : piece.type;
        pieceEl.innerText = name;
        pieceEl.style.cssText = `
          width: 44px;
          height: 44px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          font-weight: 700;
          box-shadow: 0 3px 6px rgba(0,0,0,0.3);
          background: ${piece.color === 'r' ? '#fff0f0' : '#2b2b2b'};
          color: ${piece.color === 'r' ? '#c0392b' : '#ffffff'};
          border: 2px solid ${piece.color === 'r' ? '#c0392b' : '#111111'};
        `;
        cell.appendChild(pieceEl);
      }
    });
  };

  // 点击落子交互处理
  XiangqiBoard.prototype.onCellClick = function (sqIndex) {
    if (this.selectedSq === null) {
      if (window.gameInstance && window.gameInstance.board[sqIndex]) {
        this.selectedSq = sqIndex;
        this.render(window.gameInstance);
      }
    } else {
      if (this.selectedSq === sqIndex) {
        this.selectedSq = null;
        this.render(window.gameInstance);
      } else {
        const from = this.selectedSq;
        const to = sqIndex;
        this.selectedSq = null;
        
        if (this.onMoveCallback) {
          this.onMoveCallback(from, to);
        }
      }
    }
  };

  // 绑定多级开局遮罩菜单事件 (完全对应 ui_example 交互)
  XiangqiBoard.prototype.bindMenuEvents = function () {
    const menuMain = document.getElementById('menu');
    const menuMode = document.getElementById('menu-mode');
    const menuModePve = document.getElementById('menu-mode-pve');
    const boardOptions = document.getElementById('board-options');

    const startBtn = document.getElementById('startbtn');
    const returnToMain = document.getElementById('return-to-main');
    const returnToMode = document.getElementById('return-to-mode');
    const pveBtn = document.getElementById('pvebtn');
    const pvpBtn = document.getElementById('pvpbtn');
    const eveBtn = document.getElementById('evebtn');
    const pfBtn = document.getElementById('pfbtn');
    const efBtn = document.getElementById('efbtn');

    if (startBtn) {
      startBtn.addEventListener('click', function () {
        menuMain.classList.add('hide');
        menuMode.classList.remove('hide');
      });
    }

    if (returnToMain) {
      returnToMain.addEventListener('click', function () {
        menuMode.classList.add('hide');
        menuMain.classList.remove('hide');
      });
    }

    if (pveBtn) {
      pveBtn.addEventListener('click', function () {
        menuMode.classList.add('hide');
        menuModePve.classList.remove('hide');
      });
    }

    if (returnToMode) {
      returnToMode.addEventListener('click', function () {
        menuModePve.classList.add('hide');
        menuMode.classList.remove('hide');
      });
    }

    // 开始对局：隐藏遮罩层
    function startGameMode(mode, side) {
      if (boardOptions) boardOptions.classList.add('hide');
      if (window.onGameStart) {
        window.onGameStart(mode, side);
      }
    }

    if (pvpBtn) pvpBtn.addEventListener('click', function() { startGameMode('pvp', 'r'); });
    if (eveBtn) eveBtn.addEventListener('click', function() { startGameMode('eve', 'r'); });
    if (pfBtn) pfBtn.addEventListener('click', function() { startGameMode('pve', 'r'); });
    if (efBtn) efBtn.addEventListener('click', function() { startGameMode('pve', 'b'); });
  };

  global.XiangqiBoard = XiangqiBoard;
})(typeof window !== 'undefined' ? window : this);
