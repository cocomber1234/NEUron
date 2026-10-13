(function () {
  "use strict";

  async function initializeLogin() {
    const form = document.getElementById("login-form");
    const error = document.getElementById("login-error");
    try {
      const user = await window.NeuronStorage.getCurrentUser();
      if (user) {
        window.location.replace(user.activeSemesterId ? "index.html" : "setup.html");
        return;
      }
    } catch (problem) {
      error.textContent = problem.message;
      error.hidden = false;
    }

    form.addEventListener("submit", async function (event) {
      event.preventDefault();
      error.hidden = true;
      const submit = form.querySelector('button[type="submit"]');
      submit.disabled = true;
      submit.textContent = "Opening your workspace…";
      try {
        const values = new FormData(form);
        const user = await window.NeuronStorage.beginDemoSession(values.get("name"), values.get("email"));
        window.location.assign(user.activeSemesterId ? "index.html" : "setup.html");
      } catch (problem) {
        error.textContent = problem.message;
        error.hidden = false;
        submit.disabled = false;
        submit.innerHTML = 'Continue to my semester <span aria-hidden="true">→</span>';
      }
    });
  }

  document.addEventListener("DOMContentLoaded", initializeLogin);
}());
