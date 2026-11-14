const form = document.querySelector("#login-form");
const loginCard = document.querySelector("#login-card");
const dashboardCard = document.querySelector("#dashboard-card");
const loginMessage = document.querySelector("#login-message");
const loginButton = document.querySelector("#login-button");

async function api(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.message || `Erro HTTP ${response.status}`);
    error.status = response.status;
    throw error;
  }
  return data;
}

function showDashboard(admin) {
  loginCard.classList.add("hidden");
  dashboardCard.classList.remove("hidden");
  document.querySelector("#welcome").textContent = `Sessão iniciada como ${admin.name} (${admin.email})`;
  document.querySelector("#role").textContent = `Perfil: ${admin.role}`;
}

async function loadDashboard() {
  const data = await api("/api/admin/dashboard");
  document.querySelector("#clients").textContent = data.totals.clients;
  document.querySelector("#projects").textContent = data.totals.projects;
  document.querySelector("#services").textContent = data.totals.services;
  document.querySelector("#portfolio").textContent = data.totals.portfolio;
  document.querySelector("#quotes").textContent = data.totals.quote_requests;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  loginMessage.textContent = "";
  loginButton.disabled = true;
  loginButton.textContent = "A validar…";

  const email = document.querySelector("#email").value.trim();
  const password = document.querySelector("#password").value;

  try {
    const result = await api("/api/admin/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    });
    document.querySelector("#password").value = "";
    showDashboard(result.admin);
    await loadDashboard();
  } catch (error) {
    loginMessage.textContent = error.message;
  } finally {
    loginButton.disabled = false;
    loginButton.textContent = "Entrar";
  }
});

document.querySelector("#logout-button").addEventListener("click", async () => {
  try {
    await api("/api/admin/logout", { method: "POST", body: "{}" });
  } finally {
    dashboardCard.classList.add("hidden");
    loginCard.classList.remove("hidden");
    document.querySelector("#password").value = "";
    loginMessage.textContent = "Sessão terminada.";
  }
});

(async function restoreSession() {
  try {
    const result = await api("/api/admin/me");
    showDashboard(result.admin);
    await loadDashboard();
  } catch {
    // Not logged in; leave login form visible.
  }
})();
