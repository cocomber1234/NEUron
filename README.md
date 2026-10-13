# NEUron

**Grade Monitoring for NEU Students**

NEUron is a responsive web application that helps college students monitor their academic performance throughout the semester. Every professor grades differently, so NEUron lets students set up a custom grading system for each subject, with their own categories, weights, and percentage-to-grade conversion on the 1.0–5.0 scale.

> 🚧 **Status:** In development

---

## Features

- **Login** – personal accounts to access the app
- **Semester setup** – create a semester and enter the subjects in your curriculum
- **Editable grading system per subject** – custom categories (e.g. Quizzes, Exams, Projects) with weights that total 100%, plus an editable percentage-to-grade conversion table
- **Activity and score tracking** – log scores for quizzes, exams, projects, and more from the landing page
- **Automatic grade computation** – current grade per subject on the 1.0–5.0 scale
- **Subjects page** – every subject with its activities and scores in one view
- **Schedule page** – weekly calendar view of your classes per subject
- **Reminders** – get notified about upcoming classes, quizzes, and exams
- **Responsive design** – works on phones, tablets, and desktops

### Planned

- [ ] Target grade calculator ("what do I need to reach 1.75?")
- [ ] Semester GWA computation
- [ ] Charts and grade trends
- [ ] Multi-semester history
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

---

## Project Structure

```
neuron/
├── index.html          # Landing page (activity and score input)
├── login.html          # Login page
├── subjects.html       # Subjects with activities and scores
├── schedule.html       # Weekly schedule
├── css/
│   └── styles.css
├── js/
│   ├── storage.js      # All save/load logic (swap for Firebase later)
│   ├── grading.js      # Grade computation and 1.0–5.0 conversion
│   ├── subjects.js
│   ├── schedule.js
│   └── reminders.js
└── README.md
```

---

## Getting Started

1. Clone the repository
   ```bash
   git clone https://github.com/<your-username>/neuron.git
   ```
2. Open the project folder
   ```bash
   cd neuron
   ```
3. Open `login.html` (or `index.html`) in your browser. No installation or server needed.

> **Note:** Data is currently saved in your browser's `localStorage`, so it stays on the device you use. The login in this version is for demo purposes only; real authentication comes with the Firebase integration.

---

## How Grading Works

1. Each subject has its own **grading system**: a list of categories and their weights (e.g. Quizzes 20%, Exams 40%, Projects 30%, Attendance 10%).
2. Each **activity** belongs to a category and has a score and total items.
3. NEUron computes the average per category, applies the weights, and gets the subject's percentage.
4. The percentage is converted to the **1.0–5.0 scale** using the subject's editable conversion table.

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
