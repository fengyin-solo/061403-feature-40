<template>
  <div class="action-panel">
    <h3 class="panel-title">基础行动</h3>
    <div v-if="isNight" class="night-warning">
      <span>🌙 夜晚无法外出活动，请保持温暖！</span>
    </div>
    <div class="actions-grid">
      <button 
        class="action-btn" 
        :class="{ disabled: isNight || gameOver }"
        @click="$emit('chop')"
      >
        <span class="btn-icon">🪓</span>
        <span class="btn-text">砍柴</span>
        <span class="btn-cost">-{{ chopCost }} 体温</span>
        <span v-if="isBlizzard" class="btn-hint blizzard-hint">暴风雪×2</span>
      </button>
      <button 
        class="action-btn" 
        :class="{ disabled: isNight || gameOver }"
        @click="$emit('hunt')"
      >
        <span class="btn-icon">🏹</span>
        <span class="btn-text">狩猎</span>
        <span class="btn-cost">-{{ huntCost }} 体温</span>
        <span class="btn-hint">成功率: {{ Math.round(huntRate * 100) }}%</span>
      </button>
      <button 
        class="action-btn" 
        :class="{ disabled: isNight || gameOver || !canCraft }"
        @click="$emit('craft')"
      >
        <span class="btn-icon">🔨</span>
        <span class="btn-text">制作工具</span>
        <span class="btn-cost">-{{ makeToolsCost }} 体温</span>
        <span class="btn-hint">需要: 2🪵 + 1🦊</span>
      </button>
      <button 
        class="action-btn fire-btn" 
        :class="{ disabled: !canFire || gameOver }"
        @click="$emit('fire')"
      >
        <span class="btn-icon">🔥</span>
        <span class="btn-text">生火</span>
        <span class="btn-cost">-3 木头</span>
        <span class="btn-hint">+25~45 热量</span>
      </button>
      <button 
        class="action-btn food-btn" 
        :class="{ disabled: food <= 0 || gameOver }"
        @click="$emit('eat')"
      >
        <span class="btn-icon">🍖</span>
        <span class="btn-text">进食</span>
        <span class="btn-cost">-1 食物</span>
        <span class="btn-hint">+5~15 体温</span>
      </button>
      <button 
        class="action-btn medicine-btn" 
        :class="{ disabled: medicine <= 0 || gameOver }"
        @click="$emit('useMedicine')"
      >
        <span class="btn-icon">💊</span>
        <span class="btn-text">使用药剂</span>
        <span class="btn-cost">-1 药剂</span>
        <span class="btn-hint">+25~45 体温+热量</span>
      </button>
    </div>

    <h3 class="panel-title rare-title">稀缺资源点</h3>
    <div v-if="resourceNodes.length === 0" class="no-resources">
      <span>暂无资源点，等待刷新...</span>
    </div>
    <div v-else class="resource-nodes">
      <div 
        v-for="(node, index) in resourceNodes" 
        :key="index"
        class="resource-node"
        :class="{ 'blizzard-bonus': node.isBlizzardBonus }"
      >
        <div class="node-info">
          <span class="node-icon">{{ node.icon }}</span>
          <div class="node-details">
            <span class="node-name">{{ node.name }}</span>
            <span class="node-amount">剩余: {{ node.amount }}/{{ node.maxAmount }}</span>
            <span class="node-duration">⏳ {{ node.remainingDays }} 天后消失</span>
          </div>
        </div>
        <button 
          class="explore-btn"
          :class="{ disabled: isNight || gameOver }"
          @click="$emit('explore', index)"
        >
          🔍 探索
          <span class="explore-cost">-{{ exploreCost }} 体温</span>
        </button>
      </div>
    </div>

    <h3 class="panel-title advanced-title">高级制作</h3>
    <div class="actions-grid">
      <button 
        class="action-btn advanced-btn" 
        :class="{ disabled: isNight || gameOver || !canMakeAdvancedTools }"
        @click="$emit('craftAdvancedTools')"
      >
        <span class="btn-icon">🔧</span>
        <span class="btn-text">高级工具</span>
        <span class="btn-cost">-{{ craftAdvancedToolsCost }} 体温</span>
        <span class="btn-hint">需要: 2💎 + 1🔪</span>
      </button>
      <button 
        class="action-btn advanced-btn" 
        :class="{ disabled: gameOver || !canMakeMedicine }"
        @click="$emit('craftMedicine')"
      >
        <span class="btn-icon">💊</span>
        <span class="btn-text">治疗药剂</span>
        <span class="btn-cost">无体温消耗</span>
        <span class="btn-hint">需要: 2🌿 + 1🍖</span>
      </button>
      <button 
        class="action-btn advanced-btn" 
        :class="{ disabled: isNight || gameOver || !canMakeWarmGear }"
        @click="$emit('craftWarmGear')"
      >
        <span class="btn-icon">🧥</span>
        <span class="btn-text">保暖装备</span>
        <span class="btn-cost">-{{ craftWarmGearCost }} 体温</span>
        <span class="btn-hint">需要: 2⚙️ + 2🦊</span>
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  isNight: { type: Boolean, default: false },
  gameOver: { type: Boolean, default: false },
  isBlizzard: { type: Boolean, default: false },
  canFire: { type: Boolean, default: false },
  canCraft: { type: Boolean, default: false },
  canMakeAdvancedTools: { type: Boolean, default: false },
  canMakeMedicine: { type: Boolean, default: false },
  canMakeWarmGear: { type: Boolean, default: false },
  huntRate: { type: Number, default: 0.3 },
  food: { type: Number, default: 0 },
  medicine: { type: Number, default: 0 },
  resourceNodes: { type: Array, default: () => [] },
  chopCost: { type: Number, default: 5 },
  huntCost: { type: Number, default: 8 },
  makeToolsCost: { type: Number, default: 6 },
  exploreCost: { type: Number, default: 12 },
  craftAdvancedToolsCost: { type: Number, default: 10 },
  craftWarmGearCost: { type: Number, default: 8 }
})

defineEmits(['chop', 'hunt', 'craft', 'fire', 'eat', 'explore', 'craftAdvancedTools', 'craftMedicine', 'craftWarmGear', 'useMedicine'])
</script>

<style scoped>
.action-panel {
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

.night-warning {
  background: rgba(50, 50, 100, 0.8);
  border: 1px solid rgba(100, 100, 200, 0.5);
  border-radius: 10px;
  padding: 10px;
  margin-bottom: 15px;
  text-align: center;
  color: #a0c4ff;
  font-size: 14px;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 15px 10px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.05));
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}

.action-btn:hover:not(.disabled) {
  transform: translateY(-3px);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.1));
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
}

.action-btn:active:not(.disabled) {
  transform: translateY(-1px);
}

.action-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  filter: grayscale(0.5);
}

.fire-btn:not(.disabled) {
  border-color: rgba(255, 100, 50, 0.6);
  background: linear-gradient(135deg, rgba(255, 100, 50, 0.3), rgba(255, 50, 0, 0.1));
}

.fire-btn:hover:not(.disabled) {
  box-shadow: 0 5px 20px rgba(255, 100, 50, 0.4);
}

.food-btn:not(.disabled) {
  border-color: rgba(50, 200, 100, 0.6);
  background: linear-gradient(135deg, rgba(50, 200, 100, 0.3), rgba(0, 150, 50, 0.1));
}

.food-btn:hover:not(.disabled) {
  box-shadow: 0 5px 20px rgba(50, 200, 100, 0.4);
}

.btn-icon {
  font-size: 28px;
}

.btn-text {
  font-size: 14px;
  font-weight: bold;
}

.btn-cost {
  font-size: 11px;
  color: rgba(255, 150, 150, 0.9);
}

.btn-hint {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.6);
}

.blizzard-hint {
  color: #e74c3c;
  font-weight: bold;
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.medicine-btn:not(.disabled) {
  border-color: rgba(155, 89, 182, 0.6);
  background: linear-gradient(135deg, rgba(155, 89, 182, 0.3), rgba(142, 68, 173, 0.1));
}

.medicine-btn:hover:not(.disabled) {
  box-shadow: 0 5px 20px rgba(155, 89, 182, 0.4);
}

.no-resources {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
  padding: 20px;
  text-align: center;
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
}

.resource-nodes {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 10px;
}

.resource-node {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: rgba(155, 89, 182, 0.1);
  border: 1px solid rgba(155, 89, 182, 0.3);
  border-radius: 10px;
  transition: all 0.2s;
}

.resource-node:hover {
  background: rgba(155, 89, 182, 0.2);
}

.resource-node.blizzard-bonus {
  background: rgba(230, 126, 34, 0.15);
  border-color: rgba(230, 126, 34, 0.5);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { box-shadow: 0 0 5px rgba(230, 126, 34, 0.3); }
  50% { box-shadow: 0 0 15px rgba(230, 126, 34, 0.6); }
}

.node-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.node-icon {
  font-size: 32px;
}

.node-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.node-name {
  color: white;
  font-weight: bold;
  font-size: 14px;
}

.node-amount {
  color: rgba(255, 255, 255, 0.8);
  font-size: 12px;
}

.node-duration {
  color: rgba(255, 200, 100, 0.9);
  font-size: 11px;
}

.explore-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 8px 16px;
  background: linear-gradient(135deg, rgba(155, 89, 182, 0.4), rgba(142, 68, 173, 0.2));
  border: 2px solid rgba(155, 89, 182, 0.5);
  border-radius: 8px;
  color: white;
  cursor: pointer;
  font-size: 13px;
  font-weight: bold;
  transition: all 0.2s;
  font-family: inherit;
}

.explore-btn:hover:not(.disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(155, 89, 182, 0.4);
}

.explore-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  filter: grayscale(0.5);
}

.explore-cost {
  font-size: 10px;
  color: rgba(255, 150, 150, 0.9);
  font-weight: normal;
}

.advanced-btn:not(.disabled) {
  border-color: rgba(243, 156, 18, 0.6);
  background: linear-gradient(135deg, rgba(243, 156, 18, 0.3), rgba(211, 84, 0, 0.1));
}

.advanced-btn:hover:not(.disabled) {
  box-shadow: 0 5px 20px rgba(243, 156, 18, 0.4);
}
</style>
