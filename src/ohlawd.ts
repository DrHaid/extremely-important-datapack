import { _, Advancement, execute, kill, MCFunction, NBT, Objective, playsound, rel, Selector, SelectorClass, setblock, summon, tag } from 'sandstone'

const DEFAULT_THRESHOLD = 15
const DEFAULT_THRESHOLD_MAX = 25
const CRUMBS_HELPER_BLOCK = 'minecraft:melon_stem'
const CRUMBS_HELPER_BLOCK_0 = 'minecraft:melon_stem[age=0]'
const CRUMBS_FRAME_NBT = {Silent: NBT`1b`, Facing: NBT`1b`, Invulnerable: NBT`1b`, Invisible:NBT`1b`, Fixed:NBT`1b`, Tags:["crumbs"],
  Item:{
    id:"minecraft:iron_nugget", 
    count: NBT`1b`,
    components: {
      custom_model_data: {
        strings:["crumbs"]
      }
    }
  }
}

const isTracked = Objective.create('isTracked', 'dummy', {text: 'Is Tracked'})
const isIntolerant = Objective.create('isIntolerant', 'dummy', {text: 'Is Intolerant'})
const hunger = Objective.create('hunger', 'food', {text: 'Hunger'})
const prevHunger = Objective.create('prevHunger', 'dummy', {text: 'Previous Hunger'})
const totalHungerLost = Objective.create('totalHungerLost', 'dummy', {text: 'Total Hunger Lost'})
const hungerThreshold = Objective.create('hungerThreshold', 'dummy', {text: 'Hunger Threshold'})
const hungerThresholdMax = Objective.create('hungerThreshMax', 'dummy', {text: 'Hunger Threshold Max'})
const sneakTime = Objective.create('sneakTime', 'minecraft.custom:minecraft.sneak_time', {text: 'Sneak Time'})
const prevSneakTime = Objective.create('prevSneakTime', 'dummy', {text: 'Previous Sneak Time'})


MCFunction('check_scores', () => {
  execute.as('@a')
  .at('@s')
  .run(() => {
    const player = Selector('@s')
    const pIsTracked = isTracked(player)
    const pHunger = hunger(player)
    const pPrevHunger = prevHunger(player)
    const pTotalHungerLost = totalHungerLost(player)
    
    // check if scoreboard was initialized for player
    _.if(pIsTracked.notEqualTo(1), () => {
      init_player_score()
    })
    
    // score should never be negative, but might happen?
    _.if(pTotalHungerLost.lessThan(0), () => {
      pTotalHungerLost.set(0)
    })

    // check if hunger has changed
    _.if(pHunger.notEqualTo(pPrevHunger), () => {
      _.if(pHunger.lessThan(pPrevHunger), () => {
        pTotalHungerLost.add(pPrevHunger.minus(pHunger))
      })
      pPrevHunger.set(pHunger)
    })
  })
}, {
  runEach: '5'
})

const init_player_score = MCFunction('init_scoreboard', () => {
  const player = Selector('@s')
  // player tracking
  isTracked(player).set(1)
  // intolerance
  isIntolerant(player).set(1)
  // hunger
  hungerThreshold(player).set(DEFAULT_THRESHOLD)
  hungerThresholdMax(player).set(DEFAULT_THRESHOLD_MAX)
  totalHungerLost(player).set(0)
  prevHunger(player).set(hunger(player))
  // sneaking
  prevSneakTime(player).set(sneakTime(player))
})

MCFunction('check_hunger_condition', () => {
  execute.as('@a')
  .at('@s')
  .run(() => {
    const player = Selector('@s')
    const pTotalHungerLost = totalHungerLost(player)
    const pHungerThresholdMax = hungerThresholdMax(player)

    // do something if thresholds reached
    _.if(pTotalHungerLost.greaterOrEqualThan(pHungerThresholdMax), () => {
      placeCrumbs()
    })
  })
}, {
  runEach: '2s'
})

MCFunction('check_sneak_condition', () => {
  execute.as('@a')
  .at('@s')
  .run(() => {
    const player = Selector('@s')
    const pTotalHungerLost = totalHungerLost(player)
    const pHungerThreshold = hungerThreshold(player)
    const pSneakTime = sneakTime(player)
    const pPrevSneakTime = prevSneakTime(player)

    const didPlayerSneak = pSneakTime.greaterThan(pPrevSneakTime)
    
    // do something if thresholds reached
    const cond = _.and(pTotalHungerLost.greaterOrEqualThan(pHungerThreshold), didPlayerSneak)
    _.if(cond, () => {
      placeCrumbs()
    })
    
    // reset sneak condition after evaluating
    pPrevSneakTime.set(pSneakTime)
  })
}, {
  runEach: '5'
})

const placeCrumbs = MCFunction('place_crumbs', () => {
  const player = Selector('@s')
  placeBase(player, 'extremelyimportant:exhaust')
})

const placeBase = (target: SelectorClass<true, true>, sound: string) => {
  const pTotalHungerLost = totalHungerLost(target)
  pTotalHungerLost.set(0)
  execute.as(target)
  .positioned(rel(0, 0.3, 0))
  .align('y')
  .run(() => {
    summon('minecraft:item_frame', rel(0, 0, 0), CRUMBS_FRAME_NBT)
    playsound(sound, 'player', '@a', rel(0, 0, 0))
  })
}

MCFunction('check_crumbs_placement', () => {
  const itemFrameNotPlaced = Selector('@e', {type: 'minecraft:item_frame', tag: ['crumbs', '!placed']})
  execute.as(itemFrameNotPlaced)
  .at('@s')
  .run(() => {
    placeCrumbsHelperBlock()
  })

  const itemFramePlaced = Selector('@e', {type: 'minecraft:item_frame', tag: ['crumbs', 'placed']})
  execute
  .as(itemFramePlaced)
  .at('@s')
  .unless(_.block(rel(0, 0, 0), CRUMBS_HELPER_BLOCK_0))
  .run(() => {
    removeCrumbs()
  })
}, {
  runEachTick: true
})

const placeCrumbsHelperBlock = MCFunction('place_crumbs_helper_block', () => {
  setblock(rel(0, 0, 0), CRUMBS_HELPER_BLOCK_0, "keep")
  tag('@s').add('placed')
})

const removeCrumbs = MCFunction('remove_crumbs', () => {
  // kill item frame
  kill('@s')
  // kill any melon seeds that might drop
  const seeds = Selector('@e', {type: 'item', distance: [0, 2], nbt: {Item: {id: "minecraft:melon_seeds"}}})
  kill(seeds)
  // remove melon stem if still there
  _.if(_.block(rel(0, 0, 0), CRUMBS_HELPER_BLOCK), () => {
    setblock(rel(0, 0, 0), 'minecraft:air')
  })
})

const doAccident = MCFunction('do_accident', () => {
  const player = Selector('@s')
  placeBase(player, 'extremelyimportant:broken_exhaust')
  upsetAdvancement.revoke(player)
})

const upsetAdvancement = Advancement('upset', {
  criteria: {
    'ate_something_special': {
      trigger: 'minecraft:consume_item',
      conditions: {
        item: {items: ['minecraft:bread', 'minecraft:cookie', 'minecraft:cake', 'minecraft:pumpkin_pie', 'minecraft:milk_bucket'] },
        player: [{condition: 'minecraft:entity_scores', entity: 'this', scores: { [isIntolerant.name]: 1}}]
      }
    }
  },
  rewards: {
    function: doAccident
  }
})