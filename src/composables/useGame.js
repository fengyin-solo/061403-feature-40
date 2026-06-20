import { ref, computed, onMounted, onUnmounted } from 'vue'

export function useGame() {
  const temperature = ref(80)
  const heat = ref(50)
  const wood = ref(10)
  const food = ref(5)
  const hide = ref(0)
  const tools = ref(0)
  const isDay = ref(true)
  const dayCount = ref(1)
  const isBlizzard = ref(false)
  const gameOver = ref(false)
  const gameOverReason = ref('')
  const actionLog = ref([])

  const ore = ref(0)
  const herbs = ref(0)
  const parts = ref(0)
  const advancedTools = ref(0)
  const medicine = ref(0)
  const warmGear = ref(0)
  const resourceNodes = ref([])

  const DAY_DURATION = 30000
  const NIGHT_DURATION = 20000
  const HEAT_CONSUMPTION_RATE = 2
  const BLIZZARD_CHANCE = 0.15

  const RARE_RESOURCES = {
    ore: { name: '矿石', icon: '💎', baseChance: 0.25, minAmount: 1, maxAmount: 3, duration: 2 },
    herbs: { name: '草药', icon: '🌿', baseChance: 0.35, minAmount: 2, maxAmount: 4, duration: 1 },
    parts: { name: '零件', icon: '⚙️', baseChance: 0.15, minAmount: 1, maxAmount: 2, duration: 3 }
  }

  let dayNightTimer = null
  let nightConsumptionTimer = null
  let autoSaveTimer = null

  const isNight = computed(() => !isDay.value)
  const isDanger = computed(() => temperature.value < 30)
  const canMakeFire = computed(() => wood.value >= 3)
  const canHunt = computed(() => tools.value > 0)
  const huntSuccessRate = computed(() => {
    let rate = 0.3 + tools.value * 0.15 + advancedTools.value * 0.2
    return Math.min(0.95, rate)
  })
  const canExplore = computed(() => resourceNodes.value.length > 0)
  const canMakeAdvancedTools = computed(() => ore.value >= 2 && tools.value >= 1)
  const canMakeMedicine = computed(() => herbs.value >= 2 && food.value >= 1)
  const canMakeWarmGear = computed(() => parts.value >= 2 && hide.value >= 2)
  const heatConsumptionMultiplier = computed(() => {
    let multiplier = 1
    if (isBlizzard.value) multiplier *= 2
    if (warmGear.value > 0) multiplier *= (1 - warmGear.value * 0.15)
    return Math.max(0.3, multiplier)
  })
  const chopTempCost = computed(() => {
    const baseCost = 5
    return isBlizzard.value ? baseCost * 2 : baseCost
  })
  const huntTempCost = computed(() => {
    const baseCost = 8
    return isBlizzard.value ? baseCost * 2 : baseCost
  })
  const makeToolsTempCost = computed(() => {
    const baseCost = 6
    return isBlizzard.value ? baseCost * 2 : baseCost
  })
  const craftAdvancedToolsTempCost = computed(() => {
    const baseCost = 10
    return isBlizzard.value ? baseCost * 2 : baseCost
  })
  const craftWarmGearTempCost = computed(() => {
    const baseCost = 8
    return isBlizzard.value ? baseCost * 2 : baseCost
  })
  const exploreBaseTempCost = computed(() => {
    const baseCost = 12
    const toolBonus = Math.min(advancedTools.value * 2, 4)
    return baseCost - toolBonus
  })
  const exploreTempCost = computed(() => {
    return isBlizzard.value ? exploreBaseTempCost.value * 2 : exploreBaseTempCost.value
  })

  function addLog(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString()
    actionLog.value.unshift({ message, type, timestamp })
    if (actionLog.value.length > 20) {
      actionLog.value.pop()
    }
  }

  function checkGameOver() {
    if (temperature.value <= 20) {
      gameOver.value = true
      gameOverReason.value = '体温过低，你在严寒中失去了意识...'
      stopTimers()
      addLog('游戏结束：体温过低！', 'danger')
    }
    if (temperature.value >= 100) {
      temperature.value = 100
    }
  }

  function consumeHeat() {
    if (gameOver.value) return
    
    const consumption = HEAT_CONSUMPTION_RATE * heatConsumptionMultiplier.value
    
    if (heat.value >= consumption) {
      heat.value -= consumption
      if (temperature.value < 80) {
        temperature.value = Math.min(80, temperature.value + 1)
      }
    } else {
      heat.value = 0
      temperature.value = Math.max(0, temperature.value - consumption)
      addLog('热量不足！体温正在下降...', 'warning')
    }
    
    checkGameOver()
  }

  function refreshResourceNodes() {
    resourceNodes.value = resourceNodes.value.map(node => ({
      ...node,
      remainingDays: node.remainingDays - 1
    })).filter(node => node.remainingDays > 0)

    const dayBonus = Math.min(dayCount.value * 0.02, 0.2)
    const blizzardBonus = isBlizzard.value ? 0.1 : 0

    Object.entries(RARE_RESOURCES).forEach(([key, config]) => {
      const chance = config.baseChance + dayBonus + blizzardBonus
      if (Math.random() < chance) {
        const existing = resourceNodes.value.find(n => n.type === key)
        if (!existing) {
          const amount = Math.floor(Math.random() * (config.maxAmount - config.minAmount + 1)) + config.minAmount
          resourceNodes.value.push({
            type: key,
            name: config.name,
            icon: config.icon,
            amount,
            remainingDays: config.duration,
            maxAmount: amount
          })
          addLog(`✨ 发现了 ${config.icon} ${config.name} 资源点！可采集 ${amount} 次`, 'success')
        }
      }
    })

    if (isBlizzard.value && Math.random() < 0.3) {
      const bonusTypes = ['ore', 'parts']
      const bonusType = bonusTypes[Math.floor(Math.random() * bonusTypes.length)]
      const config = RARE_RESOURCES[bonusType]
      const existing = resourceNodes.value.find(n => n.type === bonusType)
      if (!existing) {
        resourceNodes.value.push({
          type: bonusType,
          name: config.name,
          icon: config.icon,
          amount: 1,
          remainingDays: 1,
          maxAmount: 1,
          isBlizzardBonus: true
        })
        addLog(`🌪️ 暴风雪带来了稀有 ${config.icon} ${config.name}！`, 'success')
      }
    }
  }

  function startNightCycle() {
    addLog(`夜幕降临，第 ${dayCount.value} 天结束`, 'info')
    nightConsumptionTimer = setInterval(() => {
      consumeHeat()
    }, 1000)
    
    if (Math.random() < BLIZZARD_CHANCE) {
      triggerBlizzard()
    }
  }

  function startDayCycle() {
    dayCount.value++
    addLog(`天亮了，第 ${dayCount.value} 天开始`, 'success')
    if (nightConsumptionTimer) {
      clearInterval(nightConsumptionTimer)
      nightConsumptionTimer = null
    }
    refreshResourceNodes()
    isBlizzard.value = false
  }

  function explore(nodeIndex) {
    if (gameOver.value || isNight.value) return
    if (nodeIndex < 0 || nodeIndex >= resourceNodes.value.length) {
      addLog('没有可探索的资源点', 'warning')
      return
    }

    const node = resourceNodes.value[nodeIndex]
    const tempCost = exploreTempCost.value

    temperature.value = Math.max(0, temperature.value - tempCost)

    const eventRoll = Math.random()
    if (eventRoll < 0.1) {
      addLog(`探索 ${node.icon} ${node.name} 时遭遇危险！体温额外下降 5`, 'danger')
      temperature.value = Math.max(0, temperature.value - 5)
    } else if (eventRoll < 0.25 && advancedTools.value > 0) {
      const bonus = Math.floor(Math.random() * 2) + 1
      addLog(`🔧 高级工具发挥作用！额外获得 ${bonus} ${node.icon}`, 'success')
      ore.value += node.type === 'ore' ? bonus : 0
      herbs.value += node.type === 'herbs' ? bonus : 0
      parts.value += node.type === 'parts' ? bonus : 0
    }

    ore.value += node.type === 'ore' ? 1 : 0
    herbs.value += node.type === 'herbs' ? 1 : 0
    parts.value += node.type === 'parts' ? 1 : 0

    addLog(`探索成功：获得 1 ${node.icon} ${node.name}，消耗 ${tempCost} 体温`, 'success')

    node.amount--
    if (node.amount <= 0) {
      resourceNodes.value.splice(nodeIndex, 1)
      addLog(`${node.icon} ${node.name} 资源点已枯竭`, 'info')
    }

    if (Math.random() < BLIZZARD_CHANCE * 0.3) {
      triggerBlizzard()
    }

    checkGameOver()
  }

  function craftAdvancedTools() {
    if (gameOver.value || isNight.value) return
    if (!canMakeAdvancedTools.value) {
      addLog('材料不足：需要 2 矿石和 1 工具', 'warning')
      return
    }

    const tempCost = craftAdvancedToolsTempCost.value

    ore.value -= 2
    tools.value -= 1
    advancedTools.value += 1
    temperature.value = Math.max(0, temperature.value - tempCost)

    addLog(`制作高级工具：获得 1 🔧 高级工具，消耗 ${tempCost} 体温`, 'success')
    checkGameOver()
  }

  function craftMedicine() {
    if (gameOver.value) return
    if (!canMakeMedicine.value) {
      addLog('材料不足：需要 2 草药和 1 食物', 'warning')
      return
    }

    herbs.value -= 2
    food.value -= 1
    medicine.value += 1

    addLog('制作药剂：获得 1 💊 治疗药剂', 'success')
  }

  function craftWarmGear() {
    if (gameOver.value || isNight.value) return
    if (!canMakeWarmGear.value) {
      addLog('材料不足：需要 2 零件和 2 兽皮', 'warning')
      return
    }

    const tempCost = craftWarmGearTempCost.value

    parts.value -= 2
    hide.value -= 2
    warmGear.value += 1
    temperature.value = Math.max(0, temperature.value - tempCost)

    addLog(`制作保暖装备：获得 1 🧥 保暖装备，消耗 ${tempCost} 体温`, 'success')
    checkGameOver()
  }

  function useMedicine() {
    if (gameOver.value || medicine.value < 1) {
      addLog('没有治疗药剂！', 'warning')
      return
    }

    medicine.value -= 1
    const tempGained = Math.floor(Math.random() * 20) + 25
    const heatGained = Math.floor(Math.random() * 15) + 20
    temperature.value = Math.min(100, temperature.value + tempGained)
    heat.value = Math.min(100, heat.value + heatGained)

    addLog(`使用药剂：体温恢复 ${tempGained}，热量恢复 ${heatGained}`, 'success')
  }

  function toggleDayNight() {
    isDay.value = !isDay.value
    if (isDay.value) {
      startDayCycle()
    } else {
      startNightCycle()
    }
  }

  function triggerBlizzard() {
    isBlizzard.value = true
    addLog('⚠️ 暴风雪来袭！所有消耗加倍！', 'danger')
  }

  function chopWood() {
    if (gameOver.value || isNight.value) return
    
    const tempCost = chopTempCost.value
    
    temperature.value = Math.max(0, temperature.value - tempCost)
    const woodGained = Math.floor(Math.random() * 3) + 2
    wood.value += woodGained
    
    addLog(`砍柴：获得 ${woodGained} 木头，消耗 ${tempCost} 体温`, 'action')
    
    if (Math.random() < BLIZZARD_CHANCE * 0.5) {
      triggerBlizzard()
    }
    
    checkGameOver()
  }

  function hunt() {
    if (gameOver.value || isNight.value) return
    
    const tempCost = huntTempCost.value
    
    temperature.value = Math.max(0, temperature.value - tempCost)
    
    if (Math.random() < huntSuccessRate.value) {
      const foodGained = Math.floor(Math.random() * 3) + 2
      const hideGained = Math.floor(Math.random() * 2) + 1
      food.value += foodGained
      hide.value += hideGained
      addLog(`狩猎成功：获得 ${foodGained} 食物，${hideGained} 兽皮，消耗 ${tempCost} 体温`, 'success')
    } else {
      addLog(`狩猎失败：消耗 ${tempCost} 体温，空手而归`, 'warning')
    }
    
    if (Math.random() < BLIZZARD_CHANCE * 0.5) {
      triggerBlizzard()
    }
    
    checkGameOver()
  }

  function makeTools() {
    if (gameOver.value || isNight.value) return
    if (wood.value < 2 || hide.value < 1) {
      addLog('材料不足：需要 2 木头和 1 兽皮', 'warning')
      return
    }
    
    const tempCost = makeToolsTempCost.value
    
    wood.value -= 2
    hide.value -= 1
    tools.value += 1
    temperature.value = Math.max(0, temperature.value - tempCost)
    
    addLog(`制作工具：获得 1 工具，消耗 ${tempCost} 体温`, 'success')
    checkGameOver()
  }

  function makeFire() {
    if (gameOver.value || !canMakeFire.value) {
      addLog('木头不足：生火需要 3 木头', 'warning')
      return
    }
    
    wood.value -= 3
    const heatGained = Math.floor(Math.random() * 20) + 25
    heat.value = Math.min(100, heat.value + heatGained)
    temperature.value = Math.min(100, temperature.value + 10)
    
    addLog(`生火：获得 ${heatGained} 热量，体温上升 10`, 'success')
  }

  function eatFood() {
    if (gameOver.value || food.value < 1) {
      addLog('没有食物了！', 'warning')
      return
    }
    
    food.value -= 1
    const tempGained = Math.floor(Math.random() * 10) + 5
    temperature.value = Math.min(100, temperature.value + tempGained)
    
    addLog(`进食：体温恢复 ${tempGained}`, 'success')
  }

  function startTimers() {
    dayNightTimer = setInterval(() => {
      toggleDayNight()
    }, isDay.value ? DAY_DURATION : NIGHT_DURATION)
    
    autoSaveTimer = setInterval(() => {
      saveGame('auto')
    }, 10000)
  }

  function stopTimers() {
    if (dayNightTimer) {
      clearInterval(dayNightTimer)
      dayNightTimer = null
    }
    if (nightConsumptionTimer) {
      clearInterval(nightConsumptionTimer)
      nightConsumptionTimer = null
    }
    if (autoSaveTimer) {
      clearInterval(autoSaveTimer)
      autoSaveTimer = null
    }
  }

  function saveGame(slot = 'manual') {
    const gameState = {
      temperature: temperature.value,
      heat: heat.value,
      wood: wood.value,
      food: food.value,
      hide: hide.value,
      tools: tools.value,
      ore: ore.value,
      herbs: herbs.value,
      parts: parts.value,
      advancedTools: advancedTools.value,
      medicine: medicine.value,
      warmGear: warmGear.value,
      resourceNodes: resourceNodes.value,
      isDay: isDay.value,
      dayCount: dayCount.value,
      isBlizzard: isBlizzard.value,
      savedAt: Date.now()
    }
    localStorage.setItem(`snowSurvival_${slot}`, JSON.stringify(gameState))
    addLog(`游戏已保存到存档位：${slot === 'auto' ? '自动存档' : slot}`, 'info')
  }

  function loadGame(slot = 'auto') {
    const saved = localStorage.getItem(`snowSurvival_${slot}`)
    if (!saved) {
      addLog('没有找到存档', 'warning')
      return false
    }
    
    try {
      const gameState = JSON.parse(saved)
      temperature.value = gameState.temperature
      heat.value = gameState.heat
      wood.value = gameState.wood
      food.value = gameState.food
      hide.value = gameState.hide
      tools.value = gameState.tools
      ore.value = gameState.ore || 0
      herbs.value = gameState.herbs || 0
      parts.value = gameState.parts || 0
      advancedTools.value = gameState.advancedTools || 0
      medicine.value = gameState.medicine || 0
      warmGear.value = gameState.warmGear || 0
      resourceNodes.value = gameState.resourceNodes || []
      isDay.value = gameState.isDay
      dayCount.value = gameState.dayCount
      isBlizzard.value = gameState.isBlizzard
      gameOver.value = false
      gameOverReason.value = ''
      actionLog.value = []
      
      stopTimers()
      startTimers()
      
      if (!isDay.value) {
        startNightCycle()
      }
      
      addLog(`成功加载存档：${slot === 'auto' ? '自动存档' : slot}`, 'success')
      return true
    } catch (e) {
      addLog('存档损坏，无法加载', 'danger')
      return false
    }
  }

  function getSaveSlots() {
    const slots = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key.startsWith('snowSurvival_')) {
        const slotName = key.replace('snowSurvival_', '')
        try {
          const data = JSON.parse(localStorage.getItem(key))
          slots.push({
            name: slotName,
            dayCount: data.dayCount,
            savedAt: data.savedAt
          })
        } catch (e) {}
      }
    }
    return slots
  }

  function deleteSave(slot) {
    localStorage.removeItem(`snowSurvival_${slot}`)
    addLog(`已删除存档：${slot}`, 'info')
  }

  function restartGame() {
    temperature.value = 80
    heat.value = 50
    wood.value = 10
    food.value = 5
    hide.value = 0
    tools.value = 0
    ore.value = 0
    herbs.value = 0
    parts.value = 0
    advancedTools.value = 0
    medicine.value = 0
    warmGear.value = 0
    resourceNodes.value = []
    isDay.value = true
    dayCount.value = 1
    isBlizzard.value = false
    gameOver.value = false
    gameOverReason.value = ''
    actionLog.value = []
    
    stopTimers()
    startTimers()
    refreshResourceNodes()
    
    addLog('新游戏开始！祝你好运！', 'success')
  }

  onMounted(() => {
    startTimers()
    refreshResourceNodes()
    addLog('欢迎来到雪地生存！白天收集资源，夜晚保持温暖。', 'info')
    addLog('💡 探索稀缺资源点，制作高级装备延长生存！', 'info')
  })

  onUnmounted(() => {
    stopTimers()
  })

  return {
    temperature,
    heat,
    wood,
    food,
    hide,
    tools,
    ore,
    herbs,
    parts,
    advancedTools,
    medicine,
    warmGear,
    resourceNodes,
    isDay,
    isNight,
    dayCount,
    isBlizzard,
    gameOver,
    gameOverReason,
    actionLog,
    isDanger,
    canMakeFire,
    canHunt,
    canExplore,
    canMakeAdvancedTools,
    canMakeMedicine,
    canMakeWarmGear,
    huntSuccessRate,
    exploreTempCost,
    chopTempCost,
    huntTempCost,
    makeToolsTempCost,
    craftAdvancedToolsTempCost,
    craftWarmGearTempCost,
    chopWood,
    hunt,
    makeTools,
    makeFire,
    eatFood,
    explore,
    craftAdvancedTools,
    craftMedicine,
    craftWarmGear,
    useMedicine,
    saveGame,
    loadGame,
    getSaveSlots,
    deleteSave,
    restartGame
  }
}
