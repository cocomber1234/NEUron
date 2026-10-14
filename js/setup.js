(function () {
  "use strict";

  async function initializeSetup() {
    const form = document.getElementById("setup-form");
    const error = document.getElementById("setup-error");
    const signout = document.getElementById("setup-signout");
    let user;
    try {
      user = await window.NeuronStorage.getCurrentUser();
      if (!user) {
        window.location.replace("login.html");
        return;
      }
      if (user.activeSemesterId) {
        window.location.replace("index.html");
        return;
      }
    } catch (problem) {
      error.textContent = problem.message;
      error.hidden = false;
    }

    signout.addEventListener("click", async function (event) {
      event.preventDefault();
      try {
        await window.NeuronStorage.clearSession();
        window.location.assign("login.html");
      } catch (problem) {
        error.textContent = problem.message;
        error.hidden = false;
      }
    });

    form.addEventListener("submit", async function (event) {
      event.preventDefault();
      error.hidden = true;
      const values = new FormData(form);
      const names = String(values.get("subjects"))
        .split(/\n/)
        .map(function (name) { return name.trim(); })
        .filter(Boolean);
      const uniqueNames = Array.from(new Set(names.map(function (name) { return name.toLowerCase(); })));
      if (!names.length) {
        error.textContent = "Add at least one subject before continuing.";
        error.hidden = false;
        return;
      }
      if (uniqueNames.length !== names.length) {
        error.textContent = "Each subject should appear only once.";
        error.hidden = false;
        return;
      }
      const submit = form.querySelector('button[type="submit"]');
      submit.disabled = true;
      submit.textContent = "Setting things up…";
      try {
        const yearLevel = values.get("yearLevel");
        const term = values.get("term");
        await window.NeuronStorage.createSemester(user.id, yearLevel + " · " + term, names, {
          yearLevel: yearLevel,
          term: term
        });
        window.location.assign("index.html");
      } catch (problem) {
        error.textContent = problem.message;
        error.hidden = false;
        submit.disabled = false;
        submit.innerHTML = 'Create my workspace <span aria-hidden="true">→</span>';
      }
    });
  }

  document.addEventListener("DOMContentLoaded", initializeSetup);
}());
