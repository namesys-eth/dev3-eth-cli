![](https://raw.githubusercontent.com/namesys-eth/dev3-eth-resources/main/graphics/png/logo.png)

# About

`dev3.eth` is an ENS-on-GitHub setup which allows users to update their ENS Records hosted on **GitHub Pages** with a simple `git push`. Users of `dev3.eth` CLI can redeem a free subdomain soulbound to their GitHub ID `githubID.dev3.eth`. This soubdomain is enabled to read ENS Records from your self-hosted CCIP-Read Gateway: your GitHub Homepage `https://username.github.io`. Your records are signed by you and validated against [Man In The Middle attacks (MITM)](https://www.imperva.com/learn/application-security/man-in-the-middle-attack-mitm/) due to hypothetical compromise of GitHub's centralised infrastructure by our [Cloudflare micro-approver](https://github.com/namesys-eth/dev3-eth-approver).  

![](https://raw.githubusercontent.com/namesys-eth/dev3-eth-resources/main/graphics/png/fullStack.png)

# Prerequisites

- `dev3.eth` feeds on your **GitHub Pages** for ENS Records. You must have your **GitHub Homepage** `https://githubID.github.io` configured to publish from `githubID.github.io` repository by default. Simple guide to doing this is [here](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site).

  > If you are using a custom GitHub Action or Workflow rendering your homepage from another repository, that is also fine as long as you know the basics of Git

- It is advisable to have your GitHub Homepage auto-deploy upon push. This is default for `githubID.github.io` repository and **you don't need to do anything** in this case

  > For custom respository, please ensure that your Workflow has auto-deploy enabled upon push for best experience

- Have access to your `githubID.github.io` or custom repository linked to GitHub Pages. Duh!

# `dev3.eth`

### STEP 1

`cd` into your `githubID.github.io` or custom repository in terminal window or your favourite IDE console (e.g. VS Code) with:

```bash
cd githubID.github.io
```

### STEP 2

Install `dev3-eth` CLI **locally** in your `githubID.github.io` or custom repository, or **globally** for better accessibility. That's it! You are now ready to redeem your free `dev3.eth` subdomain!

| Context  | Install | Initialise | Publish | Status  |
|:--------:|:-------:|:----------:|:-------:|:-------:|
| `GLOBAL` | `npm i -g dev3-eth`  | `npx dev3-eth init` | `npx dev3-eth sign` | `npx dev3-eth status` |
| `LOCAL`  | `[1]` or `[2]`       | `npm run init`      | `npm run sign`      | `npm run status`      |

> 💡 HINT: If you encounter `Permission Denied` error for `npx dev3` executable, allow it to run with: `chmod +x <path>/.bin/dev3`

### `[1]`

```bash
VERSION=0.1.1-alpha && FILE=dev3-eth-$VERSION.tgz && curl -LJO https://github.com/namesys-eth/dev3-eth-cli/releases/download/$VERSION/$FILE && tar -xzf $FILE && mv package/* package/.nojekyll package/.gitignore . && rm -r package $FILE && npm i
```

### `[2]`

```bash
VERSION=0.1.1-alpha && FILE=dev3-eth-$VERSION.tgz && wget https://github.com/namesys-eth/dev3-eth-cli/releases/download/$VERSION/$FILE && tar -xzf $FILE && mv package/* package/.nojekyll package/.gitignore . && rm -r package $FILE && npm i
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
VERSION=0.1.1-alpha && FILE=dev3-eth-$VERSION.tgz && curl -LJO https://github.com/namesys-eth/dev3-eth-cli/releases/download/$VERSION/$FILE && tar -xzf $FILE && mv package/* package/.nojekyll package/.gitignore . && rm -r package $FILE && npm i
```

#### `WGET`

```bash
VERSION=0.1.1-alpha && FILE=dev3-eth-$VERSION.tgz && wget https://github.com/namesys-eth/dev3-eth-cli/releases/download/$VERSION/$FILE && tar -xzf $FILE && mv package/* package/.nojekyll package/.gitignore . && rm -r package $FILE && npm i
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
