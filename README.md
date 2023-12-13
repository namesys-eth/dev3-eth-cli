# `dev3.eth`

## Download Package

### `NPM`

```bash
npm install -g @namesys-eth/dev3-eth-cli
```

### `CURL`

```bash
VERSION=0.0.2-alpha && FILE=dev3-eth-$VERSION.tgz && curl -LJO https://github.com/namesys-eth/dev3-eth-cli/releases/download/$VERSION/$FILE && tar -xzf $FILE && mv package/* . && rm -r package $FILE
```

### `WGET`

```bash
VERSION=0.0.2-alpha && FILE=dev3-eth-$VERSION.tgz && wget https://github.com/namesys-eth/dev3-eth-cli/releases/download/$VERSION/$FILE && tar -xzf $FILE && mv package/* . && rm -r package $FILE
```

## Install Package

```bash
npm install
```

## Initialise `dev3.eth`

```bash
npx dev3 init
```

> 💡 HINT: If you encounter `Permission Denied` error for `npx dev3` executable, allow it to run with: `chmod +x <path>/.bin/dev3`

## Set Records for `*.dev3.eth`

```bash
npx dev3 sign
```

> 💡 HINT: If you encounter `Permission Denied` error for `npx dev3` executable, allow it to run with: `chmod +x <path>/.bin/dev3`

## Check Records for `*.dev3.eth`

```bash
npx dev3 status
```

> 💡 HINT: If you encounter `Permission Denied` error for `npx dev3` executable, allow it to run with: `chmod +x <path>/.bin/dev3`