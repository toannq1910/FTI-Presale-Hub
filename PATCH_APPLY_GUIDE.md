# PATCH_APPLY_GUIDE — v9.2.0 CMS Data Foundation

## Files in this patch

```text
index.html
data/cms-content.json
js/cms-portal.js
css/cms.css
VERSION
CHANGELOG.md
PATCH_APPLY_GUIDE.md
```

## Apply steps

```bash
git checkout develop
git pull origin develop
```

1. Extract PATCH ZIP.
2. Copy all files/folders into project root.
3. Replace existing files.
4. Commit:

```bash
git status
git add .
git commit -m "Add CMS data foundation v9.2.0"
git push origin develop
```

5. Test locally with Live Server:

```text
index.html#cms
```

6. If OK, release:

```bash
git checkout main
git pull origin main
git merge develop
git push origin main

git tag v9.2.0
git push origin v9.2.0
```

## CMS usage

Open:

```text
index.html#cms
```

Workflow:
1. Open tab `JSON Editor`.
2. Edit JSON.
3. Click `Lưu Local` to preview in your browser.
4. Click `Export JSON`.
5. Replace `data/cms-content.json`.
6. Commit and push.

LocalStorage changes are browser-local only. To publish CMS changes to GitHub Pages, always export JSON and commit `data/cms-content.json`.
