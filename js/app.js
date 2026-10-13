(function () {
  "use strict";

  const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const ROUTES = ["home", "subjects", "schedule", "settings"];
  const ROUTE_LABELS = { home: "Overview", subjects: "Subjects", schedule: "Schedule", settings: "Settings" };
  let currentUser;
  let currentSemester;
  let conversionTable;
  let activeRoute = "home";

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (character) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character];
    });
  }

  function formatGrade(grade) {
    return grade === null ? "—" : Number(grade).toFixed(grade % 1 ? 2 : 1);
  }

  function formatDate(date) {
    return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(new Date(date + "T12:00:00"));
  }

  function currentRoute() {
    const requested = window.location.hash.slice(1);
    return ROUTES.includes(requested) ? requested : "home";
  }

  function showNotice(message, isError) {
    const region = document.getElementById("notice-region");
    region.innerHTML = '<div class="notice' + (isError ? " error" : "") + '" role="' + (isError ? "alert" : "status") + '"><span>' + escapeHtml(message) + '</span><button type="button" aria-label="Dismiss notification">×</button></div>';
    region.querySelector("button").addEventListener("click", function () { region.replaceChildren(); });
    window.setTimeout(function () { region.replaceChildren(); }, 5500);
  }

  function updateChrome() {
    document.getElementById("sidebar-semester").textContent = currentSemester.name;
    document.getElementById("sidebar-name").textContent = currentUser.name;
    document.getElementById("sidebar-avatar").textContent = currentUser.name.trim().charAt(0).toUpperCase();
    document.getElementById("page-label").textContent = ROUTE_LABELS[activeRoute];
    document.getElementById("today-label").textContent = new Intl.DateTimeFormat(undefined, { weekday: "short", month: "short", day: "numeric" }).format(new Date()).toUpperCase();
    document.getElementById("footer-year").textContent = new Date().getFullYear();
    document.querySelectorAll("[data-route]").forEach(function (link) {
      if (link.dataset.route === activeRoute) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  function renderGradeRow(subject) {
    const grade = window.NeuronGrading.calculateSubjectGrade(subject, conversionTable);
    const percentage = window.NeuronGrading.calculateSubjectPercentage(subject);
    return '<div class="subject-progress"><span class="subject-progress-name" title="' + escapeHtml(subject.name) + '">' + escapeHtml(subject.name) + '</span><span class="subject-progress-value">' + (grade === null ? '<span class="pending-text">—</span>' : formatGrade(grade)) + '</span><div class="progress-track" role="progressbar" aria-label="' + escapeHtml(subject.name) + ' completion" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + (percentage === null ? "0" : percentage) + '"><div class="progress-fill" style="width:' + (percentage === null ? 0 : percentage) + '%"></div></div></div>';
  }

  function renderDashboard() {
    const subjects = currentSemester.subjects;
    const gradedSubjects = subjects.filter(function (subject) {
      return window.NeuronGrading.calculateSubjectGrade(subject, conversionTable) !== null;
    });
    const recentActivities = subjects.flatMap(function (subject) {
      return subject.activities.map(function (activity) {
        const category = subject.categories.find(function (item) { return item.id === activity.categoryId; });
        return { subject: subject.name, activity: activity, category: category ? category.name : "Activity" };
      });
    }).sort(function (a, b) {
      return b.activity.date.localeCompare(a.activity.date);
    }).slice(0, 4);
    const selectedSubject = subjects[0];
    const subjectOptions = subjects.map(function (subject) {
      return '<option value="' + escapeHtml(subject.id) + '">' + escapeHtml(subject.name) + '</option>';
    }).join("");
    const categoryOptions = (selectedSubject ? selectedSubject.categories : []).map(function (category) {
      return '<option value="' + escapeHtml(category.id) + '">' + escapeHtml(category.name) + '</option>';
    }).join("");
    const content = document.getElementById("page-content");
    content.innerHTML =
      '<div class="welcome-row"><div><span class="eyebrow">A FRESH LOOK AT YOUR PROGRESS</span><h1>One step at a time,<br><em>' + escapeHtml(currentUser.name.split(" ")[0]) + '.</em></h1><p>Here’s where things stand in ' + escapeHtml(currentSemester.name) + '.</p></div><div class="term-badge"><span></span>' + escapeHtml(currentSemester.name) + '</div></div>' +
      '<div class="dashboard-grid"><section class="panel overview-panel" aria-labelledby="overview-title"><div class="panel-top"><div><h2 id="overview-title">Your overview</h2><p class="panel-subtitle">A little progress adds up.</p></div><a class="text-link" href="#subjects">All subjects →</a></div><div class="grade-summary"><div class="grade-ring ' + (gradedSubjects.length ? "" : "grade-pending") + '"><span>' + gradedSubjects.length + '/' + subjects.length + '</span></div><div><span class="eyebrow">SUBJECTS GRADED</span><h3>' + (gradedSubjects.length === subjects.length && subjects.length ? "Every subject has a grade." : gradedSubjects.length ? "You’re finding your rhythm." : "Your grades are taking shape.") + '</h3><p>' + (gradedSubjects.length === subjects.length && subjects.length ? "All your categories have scores recorded." : gradedSubjects.length ? "Add scores in each category to complete the rest." : "Add scores across every category to see a grade.") + '</p></div></div><div class="divider"></div><div class="subject-progress-list">' + (subjects.length ? subjects.map(renderGradeRow).join("") : '<div class="empty-state"><strong>No subjects yet</strong><p>Add a subject to start keeping track.</p></div>') + '</div></section>' +
      '<section class="panel score-panel" aria-labelledby="score-title"><span class="eyebrow">QUICK UPDATE</span><h2 id="score-title">Add a score</h2><p class="panel-subtitle">Log a result while it’s still fresh.</p>' +
      (subjects.length ? '<form id="score-form" class="score-form"><div class="form-stack"><label for="score-subject">Subject</label><select id="score-subject" name="subjectId" required>' + subjectOptions + '</select></div><div class="form-stack"><label for="score-category">Category</label><select id="score-category" name="categoryId" required>' + categoryOptions + '</select></div><div class="form-stack"><label for="score-name">Activity name</label><input id="score-name" name="activityName" required maxlength="100" placeholder="e.g. Quiz 2"></div><div class="form-pair"><div class="form-stack"><label for="score-value">Your score</label><input id="score-value" name="score" type="number" min="0" step="any" required placeholder="18"></div><div class="form-stack"><label for="score-total">Out of</label><input id="score-total" name="total" type="number" min="0.01" step="any" required placeholder="20"></div></div><div class="form-stack"><label for="score-date">Date</label><input id="score-date" name="date" type="date" value="' + new Date().toISOString().slice(0, 10) + '" required></div><button class="button button-primary" type="submit">Save this score <span aria-hidden="true">→</span></button></form>' : '<div class="empty-state" style="margin-top:16px"><strong>First, add your subjects</strong><p>Once your semester is set up, you can record scores right here.</p><a class="text-link" href="setup.html">Set up semester →</a></div>') + '</section></div>' +
      '<section class="activity-section"><div class="section-heading"><h2>Recent activity</h2><a class="text-link" href="#subjects">See subjects →</a></div>' + (recentActivities.length ? '<div class="activity-list">' + recentActivities.map(function (item) {
        return '<article class="activity-row"><span class="activity-symbol" aria-hidden="true">✓</span><div class="activity-copy"><strong>' + escapeHtml(item.activity.name) + '</strong><span>' + escapeHtml(item.subject) + ' · ' + escapeHtml(item.category) + ' · ' + formatDate(item.activity.date) + '</span></div><span class="activity-score">' + item.activity.score + ' / ' + item.activity.total + '</span></article>';
      }).join("") + '</div>' : '<div class="empty-state"><span class="empty-mark" aria-hidden="true">✳</span><strong>Your semester starts here</strong><p>When you add your first result, it’ll show up here for an easy recap.</p></div>') + '</section>';

    const scoreForm = document.getElementById("score-form");
    if (scoreForm) {
      const subjectSelect = scoreForm.elements.subjectId;
      const categorySelect = scoreForm.elements.categoryId;
      function updateCategories() {
        const subject = subjects.find(function (item) { return item.id === subjectSelect.value; });
        categorySelect.innerHTML = subject ? subject.categories.map(function (category) {
          return '<option value="' + escapeHtml(category.id) + '">' + escapeHtml(category.name) + '</option>';
        }).join("") : "";
      }
      subjectSelect.addEventListener("change", updateCategories);
      scoreForm.addEventListener("submit", async function (event) {
        event.preventDefault();
        const values = new FormData(scoreForm);
        const score = Number(values.get("score"));
        const total = Number(values.get("total"));
        if (score < 0 || total <= 0 || score > total) {
          showNotice("Enter a score from 0 up to the total possible points.", true);
          return;
        }
        try {
          await window.NeuronStorage.addActivity(currentUser.id, currentSemester.id, values.get("subjectId"), {
            name: values.get("activityName"), categoryId: values.get("categoryId"), score: score, total: total, date: values.get("date")
          });
          await refreshPage();
          showNotice("Score saved. Nice work keeping your semester up to date.");
        } catch (error) {
          showNotice(error.message, true);
        }
      });
    }
  }

  function renderSubjectCard(subject) {
    const grade = window.NeuronGrading.calculateSubjectGrade(subject, conversionTable);
    const percentage = window.NeuronGrading.calculateSubjectPercentage(subject);
    return '<article class="panel subject-card"><div class="subject-card-header"><div><h2>' + escapeHtml(subject.name) + '</h2><p>' + subject.activities.length + ' recorded result' + (subject.activities.length === 1 ? "" : "s") + (percentage === null ? " · Grade appears when all categories have scores" : " · " + percentage + "% overall") + '</p></div><span class="grade-pill ' + (grade === null ? "ungraded" : "") + '">' + formatGrade(grade) + '</span></div><div class="subject-categories">' + subject.categories.map(function (category) {
      const average = window.NeuronGrading.calculateCategoryAverage(subject, category.id);
      return '<div class="category-row"><span>' + escapeHtml(category.name) + '</span><span>' + category.weight + '% weight · ' + (average === null ? "No scores" : Math.round(average * 100) + "% average") + '</span></div>';
    }).join("") + '</div>' + (subject.activities.length ? '<div class="subject-activities">' + subject.activities.slice().sort(function (a, b) { return b.date.localeCompare(a.date); }).slice(0, 3).map(function (activity) {
      return '<div class="compact-activity"><span>' + escapeHtml(activity.name) + '</span><span>' + activity.score + ' / ' + activity.total + '</span></div>';
    }).join("") + '</div>' : "") + '<details class="category-edit"><summary>Edit category names and weights</summary><form class="category-edit-form" data-category-form="' + escapeHtml(subject.id) + '">' + subject.categories.map(function (category, index) {
      return '<div class="category-edit-row"><input name="name-' + index + '" aria-label="Category ' + (index + 1) + ' name" required maxlength="40" value="' + escapeHtml(category.name) + '"><input name="weight-' + index + '" aria-label="Category ' + (index + 1) + ' weight percentage" type="number" min="0" max="100" step="any" required value="' + category.weight + '"></div>';
    }).join("") + '<span class="category-help">Weights must total exactly 100%.</span><button class="button button-secondary button-small" type="submit">Save categories</button></form></details></article>';
  }

  function renderSubjects() {
    const content = document.getElementById("page-content");
    content.innerHTML = '<div class="page-heading"><div><span class="eyebrow">THE DETAILS THAT ADD UP</span><h1>Your <em>subjects.</em></h1><p>See your categories, recorded scores, and what still needs a mark.</p></div></div><div class="subject-grid">' + currentSemester.subjects.map(renderSubjectCard).join("") + '<section class="panel add-card"><h2>Add a subject</h2><form id="add-subject-form" class="form-stack"><label for="new-subject-name">Subject name</label><input id="new-subject-name" name="name" required maxlength="100" placeholder="e.g. Discrete Mathematics"><span class="category-help">We’ll add the same editable category weights as your other subjects.</span><button class="button button-primary" type="submit">Add subject <span aria-hidden="true">→</span></button></form></section></div>';
    document.getElementById("add-subject-form").addEventListener("submit", async function (event) {
      event.preventDefault();
      const form = event.currentTarget;
      const name = new FormData(form).get("name").trim();
      if (currentSemester.subjects.some(function (subject) { return subject.name.toLowerCase() === name.toLowerCase(); })) {
        showNotice("That subject is already in this semester.", true);
        return;
      }
      try {
        await window.NeuronStorage.addSubject(currentUser.id, currentSemester.id, name);
        await refreshPage();
        showNotice("Subject added. You can change its category names and weights below.");
      } catch (error) {
        showNotice(error.message, true);
      }
    });
    content.querySelectorAll("[data-category-form]").forEach(function (form) {
      form.addEventListener("submit", async function (event) {
        event.preventDefault();
        const subject = currentSemester.subjects.find(function (item) { return item.id === form.dataset.categoryForm; });
        const values = new FormData(form);
        const categories = subject.categories.map(function (category, index) {
          return { id: category.id, name: String(values.get("name-" + index)).trim(), weight: Number(values.get("weight-" + index)) };
        });
        const total = categories.reduce(function (sum, category) { return sum + category.weight; }, 0);
        if (Math.abs(total - 100) > 0.000001 || categories.some(function (category) { return !category.name || category.weight < 0; })) {
          showNotice("Category weights need to add up to exactly 100%.", true);
          return;
        }
        try {
          await window.NeuronStorage.updateSubjectCategories(currentUser.id, currentSemester.id, subject.id, categories);
          await refreshPage();
          showNotice("Category names and weights updated.");
        } catch (error) {
          showNotice(error.message, true);
        }
      });
    });
  }

  function timeToMinutes(value) {
    const parts = value.split(":").map(Number);
    return parts[0] * 60 + parts[1];
  }

  function formatTime(value) {
    const parts = value.split(":").map(Number);
    const date = new Date();
    date.setHours(parts[0], parts[1], 0, 0);
    return new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(date);
  }

  function renderSchedule() {
    const allClasses = currentSemester.subjects.flatMap(function (subject) {
      return subject.classSlots.map(function (slot) { return Object.assign({ subject: subject.name }, slot); });
    });
    const content = document.getElementById("page-content");
    content.innerHTML = '<div class="page-heading"><div><span class="eyebrow">A LITTLE ROOM TO BREATHE</span><h1>Your weekly <em>rhythm.</em></h1><p>Keep your class times close, so the week feels a bit more manageable.</p></div></div><div class="schedule-day-tabs" role="group" aria-label="Choose a weekday">' + WEEKDAYS.map(function (day, index) {
      return '<button type="button" data-day-tab="' + day + '" aria-pressed="' + (index === 0 ? "true" : "false") + '">' + day.slice(0, 3) + '</button>';
    }).join("") + '</div><div class="schedule-board">' + WEEKDAYS.map(function (day, index) {
      const dayClasses = allClasses.filter(function (slot) { return slot.day === day; }).sort(function (a, b) {
        return timeToMinutes(a.startTime) - timeToMinutes(b.startTime);
      });
      return '<section class="day-column" data-day-column="' + day + '" data-selected="' + (index === 0 ? "true" : "false") + '"><h2>' + day + '<span>' + dayClasses.length + ' class' + (dayClasses.length === 1 ? "" : "es") + '</span></h2>' + (dayClasses.length ? '<div class="class-list">' + dayClasses.map(function (slot) {
        return '<article class="class-card"><strong>' + escapeHtml(slot.subject) + '</strong><span>' + formatTime(slot.startTime) + '–' + formatTime(slot.endTime) + '</span><span>' + (slot.room ? escapeHtml(slot.room) : "Room not set") + '</span></article>';
      }).join("") + '</div>' : '<div class="empty-state"><strong>A little breathing room</strong><p>No classes added for this day.</p></div>') + '</section>';
    }).join("") + '</div>' + (currentSemester.subjects.length ? '<section class="panel schedule-form-panel"><h2>Add a class time</h2><p class="panel-subtitle">Add a weekly class meeting to your schedule.</p><form id="schedule-form" class="schedule-form"><div class="form-stack"><label for="class-subject">Subject</label><select id="class-subject" name="subjectId" required>' + currentSemester.subjects.map(function (subject) {
      return '<option value="' + escapeHtml(subject.id) + '">' + escapeHtml(subject.name) + '</option>';
    }).join("") + '</select></div><div class="form-stack"><label for="class-day">Day</label><select id="class-day" name="day" required>' + WEEKDAYS.map(function (day) { return '<option>' + day + '</option>'; }).join("") + '</select></div><div class="form-stack"><label for="class-start">Starts</label><input id="class-start" name="startTime" type="time" required></div><div class="form-stack"><label for="class-end">Ends</label><input id="class-end" name="endTime" type="time" required></div><div class="form-stack"><label for="class-room">Room</label><input id="class-room" name="room" maxlength="60" placeholder="e.g. Room 204"></div><button class="button button-primary" type="submit">Add class</button></form></section>' : "");
    content.querySelectorAll("[data-day-tab]").forEach(function (button) {
      button.addEventListener("click", function () {
        content.querySelectorAll("[data-day-tab]").forEach(function (tab) { tab.setAttribute("aria-pressed", String(tab === button)); });
        content.querySelectorAll("[data-day-column]").forEach(function (column) {
          column.dataset.selected = String(column.dataset.dayColumn === button.dataset.dayTab);
        });
      });
    });
    const form = document.getElementById("schedule-form");
    if (form) {
      form.addEventListener("submit", async function (event) {
        event.preventDefault();
        const values = new FormData(form);
        if (values.get("startTime") >= values.get("endTime")) {
          showNotice("The end time needs to be later than the start time.", true);
          return;
        }
        try {
          await window.NeuronStorage.addClassSlot(currentUser.id, currentSemester.id, values.get("subjectId"), {
            day: values.get("day"), startTime: values.get("startTime"), endTime: values.get("endTime"), room: values.get("room")
          });
          await refreshPage();
          showNotice("Class time added to your weekly schedule.");
        } catch (error) {
          showNotice(error.message, true);
        }
      });
    }
  }

  function renderSettings() {
    const content = document.getElementById("page-content");
    const conversionRows = conversionTable.map(function (row) { return row.minimum + " = " + row.grade.toFixed(2).replace(/0+$/, "").replace(/\.$/, ""); }).join("\n");
    content.innerHTML = '<div class="page-heading"><div><span class="eyebrow">MAKE THIS SPACE YOURS</span><h1>Settings &amp; <em>preferences.</em></h1><p>Your demo profile and the conversion table used for every subject.</p></div></div><div class="settings-grid"><section class="panel settings-panel"><h2>Grade conversion table</h2><p>One threshold per line, written as <code>minimum percentage = NEU grade</code>.</p><form id="conversion-form" class="conversion-form"><label class="field-label" for="conversion-rows">Conversion thresholds</label><textarea id="conversion-rows" class="conversion-textarea" name="rows" required spellcheck="false">' + escapeHtml(conversionRows) + '</textarea><span class="field-hint">Include a 0 threshold. Highest percentages should come first.</span><p id="conversion-error" class="field-error" role="alert" hidden></p><button class="button button-primary" type="submit">Save conversion table</button></form></section><div class="form-stack"><section class="panel settings-panel"><span class="profile-avatar-large" aria-hidden="true">' + escapeHtml(currentUser.name.charAt(0).toUpperCase()) + '</span><h2>Your profile</h2><p>Your name appears in your workspace. This is a demo profile saved on this device.</p><form id="profile-form" class="form-stack"><label for="profile-name">Name</label><input id="profile-name" name="name" required maxlength="80" value="' + escapeHtml(currentUser.name) + '"><label for="profile-email">Email</label><input id="profile-email" value="' + escapeHtml(currentUser.email) + '" disabled><button class="button button-secondary" type="submit">Update name</button></form></section><div class="storage-note"><span aria-hidden="true">ⓘ</span><p>Your information is saved in this browser only. Avoid using sensitive personal information; real cloud accounts aren’t connected yet.</p></div></div></div>';
    document.getElementById("conversion-form").addEventListener("submit", async function (event) {
      event.preventDefault();
      const form = event.currentTarget;
      const error = document.getElementById("conversion-error");
      const entries = new FormData(form).get("rows").split(/\n/).map(function (line) {
        const match = line.trim().match(/^(\d+(?:\.\d+)?)\s*=\s*(\d+(?:\.\d+)?)$/);
        return match ? { minimum: Number(match[1]), grade: Number(match[2]) } : null;
      });
      if (entries.some(function (row) { return row === null; })) {
        error.textContent = "Use one valid line per threshold, for example: 98 = 1.0";
        error.hidden = false;
        return;
      }
      const sorted = entries.slice().sort(function (a, b) { return b.minimum - a.minimum; });
      const hasZero = sorted.some(function (row) { return row.minimum === 0; });
      const uniqueThresholds = sorted.every(function (row, index) { return index === 0 || row.minimum < sorted[index - 1].minimum; });
      const validGrades = sorted.every(function (row) { return row.minimum <= 100 && row.grade >= 1 && row.grade <= 5; });
      if (!hasZero || !uniqueThresholds || !validGrades) {
        error.textContent = "Use unique thresholds from 0 to 100 and NEU grades from 1.0 to 5.0, including a 0 threshold.";
        error.hidden = false;
        return;
      }
      try {
        await window.NeuronStorage.saveConversionTable(sorted);
        conversionTable = sorted;
        await refreshPage();
        showNotice("Grade conversion table saved and applied to all your subjects.");
      } catch (problem) {
        error.textContent = problem.message;
        error.hidden = false;
      }
    });
    document.getElementById("profile-form").addEventListener("submit", async function (event) {
      event.preventDefault();
      const name = new FormData(event.currentTarget).get("name").trim();
      try {
        currentUser = await window.NeuronStorage.updateProfile(currentUser.id, name);
        updateChrome();
        await refreshPage();
        showNotice("Your profile name has been updated.");
      } catch (error) {
        showNotice(error.message, true);
      }
    });
  }

  async function refreshPage() {
    currentUser = await window.NeuronStorage.getCurrentUser();
    if (!currentUser) {
      window.location.replace("login.html");
      return false;
    }
    currentSemester = await window.NeuronStorage.getCurrentSemester(currentUser.id);
    if (!currentSemester) {
      window.location.replace("setup.html");
      return false;
    }
    conversionTable = await window.NeuronStorage.getConversionTable();
    activeRoute = currentRoute();
    updateChrome();
    if (activeRoute === "subjects") renderSubjects();
    else if (activeRoute === "schedule") renderSchedule();
    else if (activeRoute === "settings") renderSettings();
    else renderDashboard();
    return true;
  }

  async function initializeApp() {
    try {
      const shouldDisplay = await refreshPage();
      if (!shouldDisplay) return;
      document.getElementById("app-loading").hidden = true;
      document.getElementById("app-shell").hidden = false;
      document.getElementById("logout-button").addEventListener("click", async function () {
        try {
          await window.NeuronStorage.clearSession();
          window.location.assign("login.html");
        } catch (error) {
          showNotice(error.message, true);
        }
      });
      window.addEventListener("hashchange", async function () {
        try {
          await refreshPage();
          document.getElementById("page-content").focus({ preventScroll: true });
        } catch (error) {
          showNotice(error.message, true);
        }
      });
    } catch (error) {
      const loading = document.getElementById("app-loading");
      loading.innerHTML = '<div class="empty-state"><strong>We couldn’t open your workspace</strong><p>' + escapeHtml(error.message) + '</p><a class="text-link" href="login.html">Return to sign in →</a></div>';
    }
  }

  document.addEventListener("DOMContentLoaded", initializeApp);
}());
