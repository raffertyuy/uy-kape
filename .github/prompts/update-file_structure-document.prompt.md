---
mode: "agent"
description: "Updates `docs/file_structure.md` according to the latest.
---

Update `docs/file_structure.md` according to the latest updates.

## Rules on the Level of Detail
### Include
- Major files in the root folder. Do not include minor files that are normally not important to be documented.
- All files and subdirectories in the `docs/` folder, **EXCEPT** for the files inside `docs/plans`.

### Exclude
- Files in the `docs/plans` folder
- System generated, temporary, or local-only files and folders (e.g. `node_modules/`, `dist/`, `log.local.txt`)
- Files and folders that are Git ignored (see `.gitignore)

## Format
When generating the tree, add a comment on the right to describe the folder or file. For example

```text
uy-kape/
├── .git/                  # Git metadata
├── .github/               # GitHub configs, workflows, AI instructions
└── package.json           # Dependencies & scripts
```

## Additional Instructions
- Update the change log at the bottom of `file_structure.md`, in chronological order, with the most recent update at the top.