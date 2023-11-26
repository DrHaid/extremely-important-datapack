import { _, execute, MCFunction, Objective, Selector, tellraw } from 'sandstone'

const HUNGER_THRESHOLD = 2

const hunger = Objective.create('hunger', 'food', {text: 'Hunger'})
const prevHunger = Objective.create('prevHunger', 'dummy', {text: 'Previous Hunger'})
const totalHungerLost = Objective.create('totalHungerLost', 'dummy', {text: 'Total Hunger Lost'})

MCFunction('init_scoreboard', () => {
  const allPlayers = Selector('@a')
  totalHungerLost(allPlayers).set(0)
  prevHunger(allPlayers).set(hunger(allPlayers))
}, {
  runOnLoad: true
})

MCFunction('check_hunger', () => {
  execute.as('@a').at('@s').run(() => {
    const player = Selector('@s')
    const pHunger = hunger(player)
    const pPrevHunger = prevHunger(player)
    const pTotalHungerLost = totalHungerLost(player)

    // check if hunger has changed
    _.if(pHunger.lessThan(pPrevHunger), () => {
      pTotalHungerLost.add(pPrevHunger.minus(pHunger))
      pPrevHunger.set(pHunger)
    })
    
    // do something if threshold reached
    _.if(pTotalHungerLost.greaterOrEqualThan(HUNGER_THRESHOLD), () => {
      tellraw(player, {text: 'doing something!'})
      pTotalHungerLost.set(0)
    })
    
    // score should never be negative, but might happen?
    _.if(pTotalHungerLost.lessThan(0), () => {
      pTotalHungerLost.set(0)
    })
  })
}, {
  runEach: '1s'
})