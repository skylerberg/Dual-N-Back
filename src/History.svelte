<script lang="ts">
  import { onMount } from 'svelte';
  import { Chart, LineController, LineElement, PointElement, LinearScale, CategoryScale, Tooltip } from 'chart.js';
  import type { GameLogEntry } from './types';
  import { calculateScore } from './scoring';

  Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Tooltip);

  let { gameLog, goBack }: {
    gameLog: Array<GameLogEntry>,
    goBack: () => void,
  } = $props();

  let canvasEl: HTMLCanvasElement | undefined = $state(undefined);

  const scores = gameLog.map(entry => calculateScore(entry.result));
  const nLevels = gameLog.map(entry => entry.nBack);
  const totalGames = gameLog.length;
  const averageNLevel = totalGames > 0
    ? (nLevels.reduce((a, b) => a + b, 0) / totalGames).toFixed(1)
    : 0;

  // Group games by date (most recent first)
  type DayGroup = {
    date: string;
    entries: Array<{ nBack: number; score: number }>;
    avgNLevel: string;
  };

  const dayGroups: DayGroup[] = (() => {
    const map = new Map<string, Array<{ nBack: number; score: number }>>();
    for (let i = 0; i < gameLog.length; i++) {
      const entry = gameLog[i];
      const score = scores[i];
      if (!map.has(entry.date)) {
        map.set(entry.date, []);
      }
      map.get(entry.date)!.push({ nBack: entry.nBack, score });
    }
    const groups: DayGroup[] = [];
    for (const [date, entries] of map) {
      const avgN = (entries.reduce((a, b) => a + b.nBack, 0) / entries.length).toFixed(1);
      entries.reverse();
      groups.push({ date, entries, avgNLevel: avgN });
    }
    groups.reverse();
    return groups;
  })();

  onMount(() => {
    if (!canvasEl || totalGames === 0) return;
    new Chart(canvasEl, {
      type: 'line',
      data: {
        labels: nLevels.map((_, i) => String(i + 1)),
        datasets: [{
          data: nLevels,
          borderColor: '#fc9',
          backgroundColor: '#c63',
          pointRadius: totalGames > 50 ? 0 : 3,
          tension: 0.3,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            callbacks: {
              title: (items) => `Game ${items[0].label}`,
              label: (item) => `N = ${item.raw}`,
            },
          },
        },
        scales: {
          y: {
            min: 1,
            suggestedMax: Math.max(...nLevels) + 1,
            ticks: { color: '#eee', stepSize: 1 },
            grid: { color: '#333' },
          },
          x: {
            ticks: { color: '#eee', maxTicksLimit: 10 },
            grid: { color: '#333' },
          },
        },
      },
    });
  });
</script>

<div id="history-screen">
  <button class="back-button" onclick={goBack} aria-label="Go back">
    <svg viewBox="0 0 50 50" width="30" height="30">
      <polygon points='17,25 33,35 33,15' style='fill:white;' />
    </svg>
  </button>

  <h2>History</h2>

  {#if totalGames === 0}
    <p>No games played yet.</p>
  {:else}
    <div class="chart-container">
      <canvas bind:this={canvasEl}></canvas>
    </div>

    <div class="summary">
      <span>Games: {totalGames}</span>
      <span>Avg N: {averageNLevel}</span>
    </div>

    <div class="day-list">
      {#each dayGroups as group}
        <div class="day-group">
          <div class="day-header">
            <span class="day-date">{group.date}</span>
            <span class="day-stats">{group.entries.length} games &middot; avg N={group.avgNLevel}</span>
          </div>
          {#each group.entries as game}
            <div class="game-entry">
              N={game.nBack} &mdash; {game.score}%
            </div>
          {/each}
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  #history-screen {
    display: flex;
    flex-flow: column;
    align-items: center;
    height: 100%;
    overflow-y: auto;
    padding: 10px;
  }

  h2 {
    margin: 0 0 10px 0;
    font-size: 20pt;
  }

  .back-button {
    position: absolute;
    left: 0;
    top: 0;
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
  }

  .chart-container {
    width: min(90vw, 500px);
    height: 200px;
    margin-bottom: 15px;
  }

  .summary {
    display: flex;
    gap: 20px;
    font-size: 14pt;
    margin-bottom: 15px;
  }

  .day-list {
    width: min(90vw, 500px);
  }

  .day-group {
    margin-bottom: 12px;
  }

  .day-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    border-bottom: 1px solid #555;
    padding-bottom: 4px;
    margin-bottom: 4px;
  }

  .day-date {
    font-weight: bold;
    font-size: 12pt;
  }

  .day-stats {
    font-size: 10pt;
    color: #aaa;
  }

  .game-entry {
    font-size: 11pt;
    padding: 2px 0 2px 10px;
    color: #ccc;
  }
</style>
