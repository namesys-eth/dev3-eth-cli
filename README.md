# `dev3.eth`

# `GLOBAL` Installation

## Install Package

```bash
npm i -g dev3-eth
```

## Initialise `*.dev3.eth` 

```bash
npx dev3-eth init
```

> 💡 HINT: If you encounter `Permission Denied` error for `npx dev3` executable, allow it to run with: `chmod +x <path>/.bin/dev3`

## Set Records for `*.dev3.eth`

```bash
npx dev3-eth sign
```

## Check Records for `*.dev3.eth`

```bash
npx dev3-eth status
```

---

### OR

# `LOCAL` Installation

## Install Package
### `CURL`

```bash
VERSION=0.0.4-alpha && FILE=dev3-eth-$VERSION.tgz && curl -LJO https://github.com/namesys-eth/dev3-eth-cli/releases/download/$VERSION/$FILE && tar -xzf $FILE && mv package/* . && rm -r package $FILE && npm i
```

### `WGET`

```bash
VERSION=0.0.4-alpha && FILE=dev3-eth-$VERSION.tgz && wget https://github.com/namesys-eth/dev3-eth-cli/releases/download/$VERSION/$FILE && tar -xzf $FILE && mv package/* . && rm -r package $FILE && npm i
```

## Initialise `*.dev3.eth` 

```bash
npm run init
```

## Set Records for `*.dev3.eth`

```bash
npm run sign
```

## Check Records for `*.dev3.eth`

```bash
npm run status
```
