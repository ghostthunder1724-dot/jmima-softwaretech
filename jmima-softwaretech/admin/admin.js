
const form = document.querySelector("#login-form");
const loginCard = document.querySelector("#login-card");
const dashboardCard = document.querySelector("#dashboard-card");
const loginMessage = document.querySelector("#login-message");
const loginButton = document.querySelector("#login-button");

// Elementos da gestão de serviços
const serviceForm = document.querySelector("#service-form");
const serviceMessage = document.querySelector("#service-message");
const servicesList = document.querySelector("#services-list");
const newServiceButton = document.querySelector("#new-service-button");
const cancelServiceButton = document.querySelector("#cancel-service-button");
const saveServiceButton = document.querySelector("#save-service-button");

// =====================================================
// COMUNICAÇÃO COM A API
// =====================================================

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
    const error = new Error(
      data.message || `Erro HTTP ${response.status}`
    );
    error.status = response.status;
    throw error;
  }

  return data;
}

// =====================================================
// PAINEL ADMINISTRATIVO
// =====================================================

function showDashboard(admin) {
  loginCard.classList.add("hidden");
  dashboardCard.classList.remove("hidden");

  document.querySelector("#welcome").textContent =
    `Sessão iniciada como ${admin.name} (${admin.email})`;

  document.querySelector("#role").textContent =
    `Perfil: ${admin.role}`;
}

async function loadDashboard() {
  const data = await api("/api/admin/dashboard");

  document.querySelector("#clients").textContent =
    data.totals.clients;

  document.querySelector("#projects").textContent =
    data.totals.projects;

  document.querySelector("#services").textContent =
    data.totals.services;

  document.querySelector("#portfolio").textContent =
    data.totals.portfolio;

  document.querySelector("#quotes").textContent =
    data.totals.quote_requests;
}

// =====================================================
// GESTÃO DE SERVIÇOS
// =====================================================

function clearServiceForm() {
  serviceForm.reset();

  document.querySelector("#service-id").value = "";
  document.querySelector("#service-order").value = "0";
  document.querySelector("#service-active").checked = true;

  saveServiceButton.textContent = "Guardar serviço";
}

function openNewServiceForm() {
  clearServiceForm();
  serviceMessage.textContent = "";
  serviceForm.classList.remove("hidden");

  document.querySelector("#service-title-pt").focus();
}

function closeServiceForm() {
  serviceForm.classList.add("hidden");
  clearServiceForm();
}

async function loadServices() {
  servicesList.textContent = "A carregar serviços...";
  serviceMessage.textContent = "";

  try {
    const data = await api("/api/admin/services");

    const services = Array.isArray(data)
      ? data
      : data.services || [];

    servicesList.replaceChildren();

    if (!services.length) {
      const emptyMessage = document.createElement("p");
      emptyMessage.textContent = "Ainda não existem serviços registados.";
      servicesList.appendChild(emptyMessage);
      return;
    }

    services.forEach((service) => {
      const item = document.createElement("article");
      item.className = "service-item";

      const title = document.createElement("h3");
      title.textContent = service.title_pt;

      const description = document.createElement("p");
      description.textContent =
        service.description_pt || "Sem descrição.";

      const status = document.createElement("p");
      status.textContent =
        Number(service.active) === 1
          ? "Estado: Activo"
          : "Estado: Inactivo";

      const editButton = document.createElement("button");
      editButton.type = "button";
      editButton.textContent = "Editar";
      editButton.addEventListener("click", () => {
        editService(service);
      });

      const deleteButton = document.createElement("button");
      deleteButton.type = "button";
      deleteButton.textContent = "Eliminar";
      deleteButton.className = "secondary";
      deleteButton.addEventListener("click", () => {
        deleteService(service.id);
      });

      item.append(title, description, status, editButton, deleteButton);
      servicesList.appendChild(item);
    });

  } catch (error) {
    servicesList.textContent = "";
    serviceMessage.textContent =
      `Não foi possível carregar os serviços: ${error.message}`;
  }
}

function editService(service) {
  serviceMessage.textContent = "";

  document.querySelector("#service-id").value = service.id;
  document.querySelector("#service-title-pt").value =
    service.title_pt || "";

  document.querySelector("#service-title-en").value =
    service.title_en || "";

  document.querySelector("#service-description-pt").value =
    service.description_pt || "";

  document.querySelector("#service-description-en").value =
    service.description_en || "";

  document.querySelector("#service-image-key").value =
    service.image_key || "";

  document.querySelector("#service-order").value =
    service.display_order ?? 0;

  document.querySelector("#service-active").checked =
    Number(service.active) === 1;

  saveServiceButton.textContent = "Actualizar serviço";
  serviceForm.classList.remove("hidden");

  document.querySelector("#service-title-pt").focus();
}

serviceForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  serviceMessage.textContent = "";
  saveServiceButton.disabled = true;

  const id = document.querySelector("#service-id").value;

  const serviceData = {
    title_pt: document.querySelector("#service-title-pt").value.trim(),
    title_en: document.querySelector("#service-title-en").value.trim(),
    description_pt: document.querySelector("#service-description-pt").value.trim(),
    description_en: document.querySelector("#service-description-en").value.trim(),
    image_key: document.querySelector("#service-image-key").value.trim(),
    display_order: Number(document.querySelector("#service-order").value),
    active: document.querySelector("#service-active").checked ? 1 : 0
  };

  try {
    await api(
      id ? `/api/admin/services/${encodeURIComponent(id)}` : "/api/admin/services",
      {
        method: id ? "PUT" : "POST",
        body: JSON.stringify(serviceData)
      }
    );

    serviceMessage.textContent = id
      ? "Serviço actualizado com sucesso!"
      : "Serviço criado com sucesso!";

    closeServiceForm();

    await loadServices();
    await loadDashboard();

  } catch (error) {
    serviceMessage.textContent =
      `Erro ao guardar serviço: ${error.message}`;
  } finally {
    saveServiceButton.disabled = false;
  }
});

async function deleteService(id) {
  const confirmed = confirm(
    "Tens a certeza de que pretendes eliminar este serviço?"
  );

  if (!confirmed) return;

  serviceMessage.textContent = "";

  try {
    await api(
      `/api/admin/services/${encodeURIComponent(id)}`,
      { method: "DELETE" }
    );

    serviceMessage.textContent = "Serviço eliminado com sucesso!";

    await loadServices();
    await loadDashboard();

  } catch (error) {
    serviceMessage.textContent =
      `Erro ao eliminar serviço: ${error.message}`;
  }
}

// Botões da gestão
newServiceButton.addEventListener("click", openNewServiceForm);
cancelServiceButton.addEventListener("click", closeServiceForm);

// =====================================================
// LOGIN
// =====================================================

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

    await Promise.allSettled([
      loadDashboard(),
      loadServices()
    ]);

  } catch (error) {
    loginMessage.textContent = error.message;
  } finally {
    loginButton.disabled = false;
    loginButton.textContent = "Entrar";
  }
});

// =====================================================
// TERMINAR SESSÃO
// =====================================================

document.querySelector("#logout-button").addEventListener("click", async () => {
  try {
    await api("/api/admin/logout", {
      method: "POST",
      body: "{}"
    });
  } finally {
    dashboardCard.classList.add("hidden");
    loginCard.classList.remove("hidden");

    document.querySelector("#password").value = "";
    loginMessage.textContent = "Sessão terminada.";
  }
});

// =====================================================
// RESTAURAR SESSÃO
// =====================================================

(async function restoreSession() {
  try {
    const result = await api("/api/admin/me");

    showDashboard(result.admin);

    await Promise.allSettled([
      loadDashboard(),
      loadServices()
    ]);

  } catch {
    // Não existe sessão activa.
  }
})();
