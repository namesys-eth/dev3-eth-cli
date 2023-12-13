# `dev3.eth`

## Download Package

### `CURL`

```bash
VERSION=0.0.2-alpha && FILE=dev3-eth-$VERSION.tgz && curl -LJO https://github.com/namesys-eth/dev3-eth-client/releases/download/0.0.2-alpha/$FILE && tar -xzf $FILE && mv package/* . && rm -r package $FILE
```

### `WGET`

```bash
VERSION=0.0.2-alpha && FILE=dev3-eth-$VERSION.tgz && wget https://github.com/namesys-eth/dev3-eth-client/releases/download/0.0.2-alpha/$FILE && tar -xzf $FILE && mv package/* . && rm -r package $FILE
```

## Install Package

```bash
npm install
```

## Initialise `dev3.eth`

```bash
npm run init
```

## Set Records for `*.dev3.eth`

```bash
npm run publish
```

## Check Records for `*.dev3.eth`

```bash
npm run status
```