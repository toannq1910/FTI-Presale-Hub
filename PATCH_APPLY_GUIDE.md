# PATCH_APPLY_GUIDE — v9.1.1 DevOps Workflow

## Files in this patch

```text
.github/workflows/deploy-pages.yml
.github/workflows/release.yml
.gitignore
VERSION
CHANGELOG.md
GIT_WORKFLOW.md
PATCH_APPLY_GUIDE.md
```

## Apply steps

1. Extract this PATCH ZIP.
2. Copy all files/folders into your project root.
3. Replace existing files if Windows asks.
4. Commit on `develop`.
5. Merge to `main` when tested.

## Important

After this patch, set GitHub Pages source to:

```text
GitHub Actions
```

instead of:

```text
Deploy from a branch
```
