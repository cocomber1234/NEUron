# NEUron

**Grade Monitoring for NEU Students**

NEUron is a responsive web application that helps college students monitor their academic performance throughout the semester. Every professor grades differently, so NEUron lets students set up a custom grading system for each subject, with their own categories, weights, and percentage-to-grade conversion on the 1.0–5.0 scale.

> 🚧 **Status:** In development

---

## Features

- **Login** – personal accounts to access the app
- **Semester setup** – create a semester and enter the subjects in your curriculum
- **Year and semester tracking** – label each record by year level and term, and keep prior semesters
- **Editable grading system per subject** – custom categories (e.g. Quizzes, Exams, Projects) with weights that total 100%, plus an editable percentage-to-grade conversion table
- **Activity and score tracking** – log scores for quizzes, exams, projects, and more from the landing page
- **Automatic grade computation** – current grade per subject on the 1.0–5.0 scale
- **Subjects page** – browse subjects by year and semester, with full activity and score histories
- **Schedule page** – weekly calendar view of your classes, including Saturday
- **Reminders** – get notified about upcoming classes, quizzes, and exams
- **Responsive design** – works on phones, tablets, and desktops

### Planned

- [ ] Target grade calculator ("what do I need to reach 1.75?")
- [ ] Semester GWA computation
- [ ] Charts and grade trends
- [ ] Dark mode
- [ ] Export to PDF/Excel
- [ ] Cloud sync and real authentication with Firebase

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | HTML, CSS, JavaScript |
| Storage (current) | Browser `localStorage` |
| Backend / Auth / Database (planned) | Firebase (Authentication, Firestore, Hosting) |

## Interface Direction

The interface follows the **Campus Studio** visual direction: warm paper backgrounds, deep campus green, and energetic mint, coral, and marigold accents. Friendly, rounded Nunito typography is used throughout to make the app feel approachable to students while keeping headings and controls easy to scan. The same color, type, and spacing tokens are shared across login, setup, Overview, Subjects, Schedule, and Settings in `css/styles.css`.

---

## Project Structure

```
neuron/
├── index.html          # Semester overview, score entry, and app navigation
├── login.html          # Local demo sign-in
├── setup.html          # First-semester setup
├── css/
│   └── styles.css
├── js/
│   ├── storage.js      # All browser storage access
│   ├── grading.js      # Grade computation and conversion
│   ├── login.js        # Demo sign-in behavior
│   ├── setup.js        # Semester setup behavior
│   └── app.js          # Shared shell and overview/subjects/schedule/settings
└── README.md
```

---

## Getting Started

1. Open `login.html` directly in a browser, or serve the repository with any static web server and open its `login.html`.
2. Enter a name and email to create or reopen a demo profile on this browser.
3. Select your year level and current semester, then add your subjects. Use Settings to create a new semester later; earlier subjects and scores remain grouped in Subjects.

> **Note:** This is a demo app. Data is stored in this browser's `localStorage`; there is no password protection, cloud backup, or real authentication. A subject grade stays “—” until every grading category has at least one score.

---

## How Grading Works

1. Each subject has its own **grading system**: a list of categories and their weights (new subjects start with editable Quizzes 25%, Exams 40%, Projects 25%, Participation 10%).
2. Each **activity** belongs to a category and has a score and total items.
3. NEUron computes the average per category, applies the weights, and gets the subject's percentage.
4. The percentage is rounded to a whole number, then converted to the **1.0–5.0 scale** using the editable global conversion table in Settings.
5. Until each category has at least one score, the subject grade is shown as “—”.

```
Percentage = Σ (category average × category weight)
Grade      = lookup(Percentage, conversion table)
```

---

## Roadmap

1. **Setup** – folder structure, `storage.js`, responsive layout
2. **Semesters and subjects** – add subjects with editable grading systems
3. **Landing page** – activity input and grade computation
4. **Subjects page** – activities and scores per subject
5. **Schedule page** – weekly calendar view
6. **Extras** – target grade calculator, reminders, GWA, charts
7. **Firebase migration** – real login, cloud database, and public hosting

---

## Author

**Marco Eduardo Asegurado**
BSIT student, NEU

---

## License

This project is for personal and portfolio use.
