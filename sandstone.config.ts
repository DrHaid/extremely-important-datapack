import type { SandstoneConfig } from 'sandstone'

export default {
  name: 'extremely-important-datapack',
  description: [ 'A ', { text: 'Sandstone', color: 'gold' }, ' data pack.' ],
  formatVersion: 7,
  namespace: 'extremely-important-datapack',
  packUid: 'ZKBfOwKq',
  saveOptions: { path: './.sandstone/output/datapack' },
  onConflict: {
    default: 'warn',
  },
} as SandstoneConfig
