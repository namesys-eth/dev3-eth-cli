# `dev3.eth`

| Context  | Install | Initialise | Publish | Status  |
|:--------:|:-------:|:----------:|:-------:|:-------:|
| `GLOBAL` | `npm i -g dev3-eth`  | `npx dev3-eth init` | `npx dev3-eth sign` | `npx dev3-eth status` |
| `LOCAL`  | `[1]` or `[2]`       | `npm run init`      | `npm run sign`      | `npm run status`      |

> 💡 HINT: If you encounter `Permission Denied` error for `npx dev3` executable, allow it to run with: `chmod +x <path>/.bin/dev3`

### `[1]`

```bash
VERSION=0.0.4-alpha && FILE=dev3-eth-$VERSION.tgz && curl -LJO https://github.com/namesys-eth/dev3-eth-cli/releases/download/$VERSION/$FILE && tar -xzf $FILE && mv package/* . && rm -r package $FILE && npm i
```

### `[2]`

```bash
VERSION=0.0.4-alpha && FILE=dev3-eth-$VERSION.tgz && wget https://github.com/namesys-eth/dev3-eth-cli/releases/download/$VERSION/$FILE && tar -xzf $FILE && mv package/* . && rm -r package $FILE && npm i
```

---
&nbsp;

# `GLOBAL` Installation

### Install Package

```bash
npm i -g dev3-eth
```

### Initialise `sub.dev3.eth` 

```bash
npx dev3-eth init
```

### Set Records for `sub.dev3.eth`

```bash
npx dev3-eth sign
```

### Check Records for `sub.dev3.eth`

```bash
npx dev3-eth status
```

# OR

# `LOCAL` Installation

### Install Package
#### `CURL`

```bash
VERSION=0.0.4-alpha && FILE=dev3-eth-$VERSION.tgz && curl -LJO https://github.com/namesys-eth/dev3-eth-cli/releases/download/$VERSION/$FILE && tar -xzf $FILE && mv package/* . && rm -r package $FILE && npm i
```

#### `WGET`

```bash
VERSION=0.0.4-alpha && FILE=dev3-eth-$VERSION.tgz && wget https://github.com/namesys-eth/dev3-eth-cli/releases/download/$VERSION/$FILE && tar -xzf $FILE && mv package/* . && rm -r package $FILE && npm i
```

### Initialise `sub.dev3.eth` 

```bash
npm run init
```

### Set Records for `sub.dev3.eth`

```bash
npm run sign
```

### Check Records for `sub.dev3.eth`

```bash
npm run status
```
