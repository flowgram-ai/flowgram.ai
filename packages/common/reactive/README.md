# Reactive

## Usage

### 创建响应式数据并做依赖追踪

```typescript

import { ReactiveState, Tracker } from '@flowgram.ai/reactive'

// 创建 数据
const reactiveState = new ReactiveState<{ a: number, b: number }>({ a: 0, b: 0 })

// 监听函数
const result = Tracker.autorun(() => {
  console.log('run: ', reactiveState.value, reactiveState.value.a)
})

// 更新字典数据 a 会自动执行上边的 autorun
reactiveState.value.a = 1

// 更新数据 b 则不会执行，因为 autorun 函数里没有依赖
reactiveState.value.b = 1
```


### react 中使用

```typescript jsx

import { useReactiveState, observe } from '@flowgram.ai/reactive'

const SomeComp = ({ state }) => {
  return <div>{state.a}</div>
}

function App() {
  const state = useReactiveState<{ a: number, b: number }>({ a: 0, b: 0 });
  useEffect(() => {
    // 触发 SompeComp 更新
    state.value.a = 1
    // 不触发 SompeComp 更新
    state.value.b = 1
  })
  return <SomeComp state={{state}} />
}

```
