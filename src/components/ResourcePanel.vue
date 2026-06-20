<template>
  <div class="resource-panel">
    <h3 class="panel-title">基础资源</h3>
    <div class="resources-grid">
      <div class="resource-item">
        <span class="resource-icon">🔥</span>
        <div class="resource-info">
          <span class="resource-name">热量</span>
          <div class="resource-bar-container">
            <div class="resource-bar" :style="{ width: heat + '%', background: getHeatColor() }"></div>
          </div>
          <span class="resource-value">{{ Math.round(heat) }}/100</span>
        </div>
      </div>
      <div class="resource-item">
        <span class="resource-icon">🪵</span>
        <div class="resource-info">
          <span class="resource-name">木头</span>
          <span class="resource-value-large">{{ wood }}</span>
        </div>
      </div>
      <div class="resource-item">
        <span class="resource-icon">🍖</span>
        <div class="resource-info">
          <span class="resource-name">食物</span>
          <span class="resource-value-large">{{ food }}</span>
        </div>
      </div>
      <div class="resource-item">
        <span class="resource-icon">🦊</span>
        <div class="resource-info">
          <span class="resource-name">兽皮</span>
          <span class="resource-value-large">{{ hide }}</span>
        </div>
      </div>
      <div class="resource-item">
        <span class="resource-icon">🔪</span>
        <div class="resource-info">
          <span class="resource-name">工具</span>
          <span class="resource-value-large">{{ tools }}</span>
        </div>
      </div>
    </div>

    <h3 class="panel-title rare-title">稀缺资源</h3>
    <div class="resources-grid">
      <div class="resource-item rare-item">
        <span class="resource-icon">💎</span>
        <div class="resource-info">
          <span class="resource-name">矿石</span>
          <span class="resource-value-large">{{ ore }}</span>
        </div>
      </div>
      <div class="resource-item rare-item">
        <span class="resource-icon">🌿</span>
        <div class="resource-info">
          <span class="resource-name">草药</span>
          <span class="resource-value-large">{{ herbs }}</span>
        </div>
      </div>
      <div class="resource-item rare-item">
        <span class="resource-icon">⚙️</span>
        <div class="resource-info">
          <span class="resource-name">零件</span>
          <span class="resource-value-large">{{ parts }}</span>
        </div>
      </div>
    </div>

    <h3 class="panel-title advanced-title">高级装备</h3>
    <div class="resources-grid">
      <div class="resource-item advanced-item">
        <span class="resource-icon">🔧</span>
        <div class="resource-info">
          <span class="resource-name">高级工具</span>
          <span class="resource-value-large">{{ advancedTools }}</span>
        </div>
      </div>
      <div class="resource-item advanced-item">
        <span class="resource-icon">💊</span>
        <div class="resource-info">
          <span class="resource-name">治疗药剂</span>
          <span class="resource-value-large">{{ medicine }}</span>
        </div>
      </div>
      <div class="resource-item advanced-item">
        <span class="resource-icon">🧥</span>
        <div class="resource-info">
          <span class="resource-name">保暖装备</span>
          <span class="resource-value-large">{{ warmGear }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  heat: { type: Number, default: 0 },
  wood: { type: Number, default: 0 },
  food: { type: Number, default: 0 },
  hide: { type: Number, default: 0 },
  tools: { type: Number, default: 0 },
  ore: { type: Number, default: 0 },
  herbs: { type: Number, default: 0 },
  parts: { type: Number, default: 0 },
  advancedTools: { type: Number, default: 0 },
  medicine: { type: Number, default: 0 },
  warmGear: { type: Number, default: 0 }
})

function getHeatColor() {
  if (props.heat > 60) return 'linear-gradient(to right, #ff6600, #ffcc00)'
  if (props.heat > 30) return 'linear-gradient(to right, #ff9933, #ffcc00)'
  return 'linear-gradient(to right, #cc3300, #ff6600)'
}
</script>

<style scoped>
.resource-panel {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  padding: 20px;
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.panel-title {
  color: white;
  font-size: 18px;
  margin-bottom: 15px;
  margin-top: 20px;
  text-align: center;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.panel-title:first-child {
  margin-top: 0;
}

.rare-title {
  color: #9b59b6;
  text-shadow: 2px 2px 4px rgba(155, 89, 182, 0.5);
}

.advanced-title {
  color: #f39c12;
  text-shadow: 2px 2px 4px rgba(243, 156, 18, 0.5);
}

.resources-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.rare-item {
  border: 1px solid rgba(155, 89, 182, 0.3);
  background: rgba(155, 89, 182, 0.1);
}

.advanced-item {
  border: 1px solid rgba(243, 156, 18, 0.3);
  background: rgba(243, 156, 18, 0.1);
}

.resource-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
  transition: transform 0.2s;
}

.resource-item:hover {
  transform: translateX(5px);
  background: rgba(0, 0, 0, 0.3);
}

.resource-icon {
  font-size: 28px;
  width: 40px;
  text-align: center;
}

.resource-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.resource-name {
  color: rgba(255, 255, 255, 0.8);
  font-size: 12px;
}

.resource-bar-container {
  height: 8px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 4px;
  overflow: hidden;
}

.resource-bar {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.resource-value {
  color: white;
  font-size: 12px;
  font-weight: bold;
}

.resource-value-large {
  color: white;
  font-size: 24px;
  font-weight: bold;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}
</style>
