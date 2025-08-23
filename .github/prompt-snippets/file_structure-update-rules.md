## file_structure.md Rules on the Level of Detail

### Include

- Only include major files in the root folder. Do not include minor files that are normally not important to be documented.
- Include all files and subdirectories in the `docs/` folder, **EXCEPT** for the files inside `docs/plans`.
- Other than `docs/`, Include folders in the root directory, and the next level of sub directories. **DO NOT** include the files inside these folders, nor level 3 folders.

### Exclude

- Exclude everything specified in the `.gitignore` file
- Exclude files in the `docs/plans` folder
- Exclude System generated, temporary, or local-only files and folders (e.g. `.git`, `node_modules/`, `dist/`, `log.local.txt`)

## Format

When generating the tree, add a comment on the right to describe the folder or file. For example

```text
uy-kape/
├── .github/               # GitHub configs, workflows, AI instructions
└── package.json           # Dependencies & scripts
```

## Additional Instructions

- Update the change log at the bottom of `file_structure.md`, in chronological order, with the most recent update at the top.
