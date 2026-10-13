# NEUron: Global Copilot Instructions

NEUron is a grade monitoring web app for NEU students. Read this file before every task.

## Tech Stack
- HTML, CSS, and plain JavaScript only. No frameworks and no build step.
- Use classic `<script>` tags, not ES modules, so the app opens directly from the file system.
- Stage 1: browser `localStorage`. Stage 2 (later): Firebase Authentication, Firestore, and Hosting.
- Responsive and mobile first.

## Architecture Rules
- Only `js/storage.js` may touch `localStorage` (or Firebase later). Every function in it is `async`.
- Grade computation and the conversion table live in `js/grading.js`. Pages must not duplicate this logic.
- Shared helpers (login guard, header) live in `js/app.js`.
- Keep the data model: User > Semester > Subject > Category / Activity / ClassSlot, plus one global ConversionTable.
- Activities reference categories by `categoryId`, never by name.

## Grading Rules (do not change without asking)
1. Each subject has categories with weights that must total 100%. The grading system is the same for the whole semester (no separate midterm/finals).
2. Category average = sum of scores / sum of totals.
3. Subject percentage = sum of (category average x category weight).
4. Round the percentage to a whole number, then convert with the NEU table.
5. A subject with no scores shows "—", never 0 or 5.0.
6. Open decision: partial grades (some categories empty). Ask before implementing.

NEU conversion (minimum percentage to grade):
98 = 1.0, 95 = 1.25, 92 = 1.5, 89 = 1.75, 86 = 2.0, 83 = 2.25, 80 = 2.5, 78 = 2.75, 75 = 3.0, 0 = 5.0

## UI Rules
- Pages: Login, Semester Setup, Home (add scores, current grades), Subjects, Schedule, Settings.
- Include empty, error, and confirmation states. Label every input and keep focus visible.
- Use CSS variables for colors and spacing. Reuse existing classes before adding new ones.
- For UI work, follow the `anti-ui-slop` skill in `.github/skills/anti-ui-slop/` (load one playbook per task). Do not use the optional Uizze reference tools unless they are connected.

## Scope and Git
- Follow the roadmap phases in the project docs. Do not add features from a later phase unless asked.
- Never commit directly to `main`. Create a feature branch for each task, for example `feature/add-score-form`.
- Use clear commit messages such as `feat: add score input form`.
- Explain changes in simple, beginner-friendly language.
