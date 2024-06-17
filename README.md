# Wallet Lite ☕️

A super-fast, lightweight library for interacting with Cardano CIP-30 wallets. Supports native browser and React contexts.

```tsx
import { FC } from "react";
import { WalletObserverProvider, RenderWallet } from "@sundaeswap/wallet-lite";

const App: FC = () => {
    return (
        <RenderWallet render={(state) => (
            return <p>{state.adaBalance.value.toString()}</p>
        )} />
    )
}

const Root: FC<PropsWithChildren> = ({ children }) => {
    return (
        <WalletObserverProvider>
            {children}
        </WalletObserverProvider>
    )
}

const target = document.querySelector("#app");
if (target) {
  const root = createRoot(target);
  root.render(<Root><App/></Root>);
}
```

## Contributing

1. Clone the repository locally.
2. Run `bun install`
3. In a terminal, run `cd lib && bun watch` to enter development mode for the library.
4. In a separate terminal, run `cd dev && bun start` to load a React UI for testing.

## Testing

1. Run `bun test`, `bun test --watch`, or `bun test --coverage`.
