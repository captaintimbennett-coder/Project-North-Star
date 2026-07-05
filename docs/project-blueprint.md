# Reusable Project Blueprint

Use this blueprint for new long-lived Codex projects. Replace Project North
Star-specific language with the new project's purpose and rules.

## Finder organization

Keep every real project directly inside the main Codex folder:

```text
Documents/
└── Codex/
    ├── Project North Star/
    ├── Project Two/
    ├── Project Three/
    └── Project Four/
```

Use descriptive names. Do not bury long-lived projects inside dated or
chat-generated folders.

## Recommended structure

```text
Project Name/
├── AGENTS.md
├── README.md
├── docs/
│   ├── architecture.md
│   ├── content-strategy.md
│   ├── design-system.md
│   ├── master-vision.md
│   ├── roadmap.md
│   ├── plans/
│   ├── reviews/
│   └── sprints/
├── public/images/
├── src/
│   ├── app/
│   ├── components/
│   ├── data/
│   ├── lib/
│   └── styles/
├── package.json
└── project configuration files
```

Not every project needs every folder. Add a folder only when it has a clear
responsibility, while separating documentation, assets, application code,
components, content, utilities, and styles.

## Essential files

### `AGENTS.md`

Tell future agents what the project is, what to read, where changes belong,
which checks to run, and what cannot be moved, published, or merged without
approval.

### `README.md`

Give humans a short project explanation, setup instructions, folder map, and
links to deeper documentation.

### Core documentation

- `docs/master-vision.md`: purpose, audience, values, and boundaries
- `docs/architecture.md`: structure, responsibilities, and data flow
- `docs/design-system.md`: visual, responsive, and accessibility rules
- `docs/roadmap.md`: long-term direction
- `docs/sprints/`: completed, current, deferred, and future work

## New-project checklist

1. Create `Documents/Codex/Project Name/`.
2. Initialize Git inside that folder.
3. Create `AGENTS.md` and `README.md`.
4. Add only the folders the project actually needs.
5. Record the vision, architecture, design rules, roadmap, and current sprint.
6. Define verification commands before implementation grows.
7. Create a GitHub repository when remote backup or collaboration is needed.
8. Keep local, repository, and public names clear and intentional.

Update the agent guide, README, and documentation whenever the project's
structure or working rules materially change.
