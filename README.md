# Extemely important datapack

It's not doing much yet.

```mcfunction
/give @p item_frame{display:{Name:'{"text":"Oh oh!"}'},CustomModelData:344457,EntityTag:{Tags:["crumbs"],Item:{id:"minecraft:iron_nugget",Count:1b,tag:{CustomModelData:344457}},Fixed:1b,Invisible:1b,Silent:1b,Invulnerable:1b}} 1
/summon item_frame ~ ~ ~ {Silent:1b,Facing:1b,Invulnerable:1b,Invisible:1b,Fixed:1b,Tags:["crumbs"],Item:{id:"minecraft:iron_nugget",Count:1b,tag:{CustomModelData:344457}}}
```

---

To build the datapack, run:
```ts
npm run build
// or
yarn build
// or
sand build
```

To automatically rebuild the datapack on each change, run:
```ts
npm run watch
// or
yarn watch
// or
sand watch
```
