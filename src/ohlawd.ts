import { _, execute, kill, MCFunction, NBT, Objective, playsound, rel, Selector, setblock, summon, tag, Variable } from 'sandstone'

const DEFAULT_THRESHOLD = 20
const CRUMBS_HELPER_BLOCK = 'minecraft:melon_stem[age=0]'
const CRUMBS_FRAME_NBT = {Silent: NBT`1b`, Facing: NBT`1b`, Invulnerable: NBT`1b`, Invisible:NBT`1b`, Fixed:NBT`1b`, Tags:["crumbs"], Item:{id:"minecraft:iron_nugget", Count: NBT`1b`, tag:{CustomModelData:344457}}}

const hunger = Objective.create('hunger', 'food', {text: 'Hunger'})
const prevHunger = Objective.create('prevHunger', 'dummy', {text: 'Previous Hunger'})
const totalHungerLost = Objective.create('totalHungerLost', 'dummy', {text: 'Total Hunger Lost'})
const hungerThreshold = Objective.create('hungerThreshold', 'dummy', {text: 'Hunger Threshold'})

MCFunction('init_scoreboard', () => {
  const allPlayers = Selector('@a')
  hungerThreshold(allPlayers).set(DEFAULT_THRESHOLD)
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
    const pHungerThreshold = totalHungerLost(player)

    // check if hunger has changed
    _.if(pHunger.lessThan(pPrevHunger), () => {
      pTotalHungerLost.add(pPrevHunger.minus(pHunger))
      pPrevHunger.set(pHunger)
    })
    
    // do something if threshold reached
    _.if(pTotalHungerLost.greaterOrEqualThan(pHungerThreshold), () => {
      pTotalHungerLost.set(0)
      placeItemFrame()
    })
    
    // score should never be negative, but might happen?
    _.if(pTotalHungerLost.lessThan(0), () => {
      pTotalHungerLost.set(0)
    })
  })
}, {
  runEach: '1s'
})

MCFunction('check_crumbs_placement', () => {
  const itemFrameNotPlaced = Selector('@e', {type: 'minecraft:item_frame', tag: ['crumbs', '!placed']})
  execute.as(itemFrameNotPlaced).at('@s').run(() => {
    placeCrumbs()
  })

  const itemFramePlaced = Selector('@e', {type: 'minecraft:item_frame', tag: ['crumbs', 'placed']})
  execute.as(itemFramePlaced).at('@s').unless(_.block(rel(0, 0, 0), CRUMBS_HELPER_BLOCK)).run(() => {
    removeCrumbs()
  })
}, {
  runEachTick: true
})

const placeItemFrame = MCFunction('place_item_frame', () => {
  summon('minecraft:item_frame', rel(0, 0, 0), CRUMBS_FRAME_NBT)
  playsound('extremelyimportant:exhaust', 'player', '@a', rel(0, 0, 0))
})

const placeCrumbs = MCFunction('place_crumbs', () => {
  setblock(rel(0, 0, 0), CRUMBS_HELPER_BLOCK)
  tag('@s').add('placed')
})

const removeCrumbs = MCFunction('remove_crumbs', () => {
  // kill item frame
  kill('@s')
  // kill any melon seeds that might drop
  const seeds = Selector('@e', {type: 'item', nbt: {Item: {id: "minecraft:melon_seeds"}}})
  kill(seeds)
})