# ecoloptim-instalpro
Ecoloptim- InstalPro

## Development Setup

1. Install dependencies:
   ```bash
   cd frontend && npm install
   cd ../backend && npm install
   ```
2. Start the app:
   ```bash
   # Backend
   cd backend && npm start
   # Frontend (separate terminal)
   cd frontend && npm start
   ```

## Important: Do Not Commit `node_modules`

The `node_modules` directories are **not** tracked in this repository and are listed in `.gitignore`.
Never run `git add node_modules` or force-add these directories.

### Recovery if `node_modules` becomes tracked accidentally

If you see `node_modules` files appearing in `git status` or causing merge conflicts, run:

```bash
# Remove node_modules from the git index (keeps local files intact)
git rm -r --cached frontend/node_modules/
git rm -r --cached backend/node_modules/

# Then commit the cleanup
git commit -m "chore: remove node_modules from git tracking"
```

After that, `git status` should remain clean even after running `npm install` or `npm run build`.
