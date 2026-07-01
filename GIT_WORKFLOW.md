# GIT_WORKFLOW.md

## Branch model

```text
main     = production / GitHub Pages
develop  = testing / patch integration
tags     = releases: v9.1.0, v9.1.1, v9.2.0
```

## One-time setup after applying this patch

### 1. Create develop branch

```bash
git checkout -b develop
git push -u origin develop
```

If `develop` already exists:

```bash
git checkout develop
git pull origin develop
```

### 2. Commit this DevOps patch

```bash
git checkout develop
git add .
git commit -m "DevOps setup v9.1.1"
git push origin develop
```

### 3. Test locally

Open with Live Server and check:

```text
index.html
index.html#oncallcx
index.html#oncallcx-product-center
```

### 4. Merge to main

```bash
git checkout main
git pull origin main
git merge develop
git push origin main
```

GitHub Actions will deploy Pages automatically from `main`.

### 5. Create release tag

```bash
git tag v9.1.1
git push origin v9.1.1
```

GitHub Actions will create a Release and attach a ZIP source package.

## Normal patch workflow after this

When ChatGPT sends a new patch, for example `v9.1.2`:

```bash
git checkout develop
git pull origin develop
```

Copy patch files into the project, then:

```bash
git status
git add .
git commit -m "Update v9.1.2"
git push origin develop
```

Test locally. If OK:

```bash
git checkout main
git pull origin main
git merge develop
git push origin main
git tag v9.1.2
git push origin v9.1.2
```

## GitHub Pages setting

After adding `.github/workflows/deploy-pages.yml`, go to:

```text
Repository → Settings → Pages → Build and deployment → Source
```

Choose:

```text
GitHub Actions
```

Then every push to `main` will deploy automatically.

## Rollback

To rollback local source to a release tag:

```bash
git checkout main
git reset --hard v9.1.0
git push --force-with-lease origin main
```

Only use rollback when necessary. Prefer creating a hotfix patch instead.
