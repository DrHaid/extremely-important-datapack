import type { SandstoneConfig } from 'sandstone'

export default {
  name: 'extremely-important-datapack',
  description: [ 'An ', { text: 'extemely important', color: 'gold' }, ' data pack.' ],
  formatVersion: 48,
  namespace: 'extremely-important-datapack',
  packUid: 'ZKBfOwKq',
  saveOptions: { path: './.sandstone/output/datapack' },
  onConflict: {
    default: 'warn',
  },
} as SandstoneConfig
