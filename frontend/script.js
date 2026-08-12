const API_URL = "https://task-management-app-63md.onrender.com";


// ===============================
// SHOW LOGIN / REGISTER
// ===============================

function showRegister() {
    document.getElementById("loginSection").classList.add("hidden");
    document.getElementById("registerSection").classList.remove("hidden");
}

function showLogin() {
    document.getElementById("registerSection").classList.add("hidden");
    document.getElementById("loginSection").classList.remove("hidden");
}


// ===============================
// REGISTER
// ===============================

async function register() {

    const name = document.getElementById("registerName").value.trim();
    const email = document.getElementById("registerEmail").value.trim();
    const password = document.getElementById("registerPassword").value;

    const message = document.getElementById("registerMessage");

    if (!name || !email || !password) {
        message.textContent = "Please fill all fields.";
        message.style.color = "red";
        return;
    }

    try {

        const response = await fetch(`${API_URL}/auth/register`, {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                name,
                email,
                password
            })
        });

        const data = await response.json();

        if (response.ok) {

            message.textContent = "Registration successful! Please login.";
            message.style.color = "green";

            document.getElementById("registerName").value = "";
            document.getElementById("registerEmail").value = "";
            document.getElementById("registerPassword").value = "";

            setTimeout(showLogin, 1000);

        } else {

            message.textContent = data.message || "Registration failed.";
            message.style.color = "red";
        }

    } catch (error) {

        message.textContent = "Unable to connect to server.";
        message.style.color = "red";

        console.error(error);
    }
}


// ===============================
// LOGIN
// ===============================

async function login() {

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    const message = document.getElementById("loginMessage");

    if (!email || !password) {
        message.textContent = "Please enter email and password.";
        message.style.color = "red";
        return;
    }

    try {

        const response = await fetch(`${API_URL}/auth/login`, {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                email,
                password
            })
        });

        const data = await response.json();

        if (response.ok) {

            localStorage.setItem("token", data.token);

            document.getElementById("loginSection").classList.add("hidden");
            document.getElementById("dashboardSection").classList.remove("hidden");

            message.textContent = "";

            loadTasks();

        } else {

            message.textContent = data.message || "Login failed.";
            message.style.color = "red";
        }

    } catch (error) {

        message.textContent = "Unable to connect to server.";
        message.style.color = "red";

        console.error(error);
    }
}


// ===============================
// CREATE TASK
// ===============================

async function createTask() {

    const title = document.getElementById("taskTitle").value.trim();
    const description = document.getElementById("taskDescription").value.trim();
    const status = document.getElementById("taskStatus").value;
    const dueDate = document.getElementById("taskDueDate").value;

    const message = document.getElementById("taskMessage");

    if (!title) {
        message.textContent = "Task title is required.";
        message.style.color = "red";
        return;
    }

    const token = localStorage.getItem("token");

    try {

        const response = await fetch(`${API_URL}/tasks`, {

            method: "POST",

            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },

            body: JSON.stringify({
                title,
                description,
                status,
                dueDate
            })
        });

        const data = await response.json();

        if (response.ok) {

            message.textContent = "Task added successfully!";
            message.style.color = "green";

            document.getElementById("taskTitle").value = "";
            document.getElementById("taskDescription").value = "";
            document.getElementById("taskStatus").value = "Pending";
            document.getElementById("taskDueDate").value = "";

            loadTasks();

        } else {

            message.textContent = data.message || "Failed to create task.";
            message.style.color = "red";
        }

    } catch (error) {

        message.textContent = "Unable to connect to server.";
        message.style.color = "red";

        console.error(error);
    }
}


// ===============================
// LOAD TASKS
// ===============================

async function loadTasks() {

    const token = localStorage.getItem("token");

    if (!token) return;

    try {

        const response = await fetch(`${API_URL}/tasks`, {

            method: "GET",

            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const tasks = await response.json();

        if (!response.ok) {

            console.error(tasks);
            return;
        }

        displayTasks(tasks);

    } catch (error) {

        console.error("Error loading tasks:", error);
    }
}


// ===============================
// DISPLAY TASKS
// ===============================

function displayTasks(tasks) {

    const taskList = document.getElementById("taskList");

    taskList.innerHTML = "";

    if (tasks.length === 0) {

        taskList.innerHTML = `
            <div class="task-card">
                <h3>No tasks yet</h3>
                <p>Create your first task above.</p>
            </div>
        `;

        return;
    }

    tasks.forEach(task => {

        const card = document.createElement("div");

        card.className = "task-card";

        card.innerHTML = `
            <h3>${escapeHtml(task.title)}</h3>

            <p>
                ${escapeHtml(task.description || "No description")}
            </p>

            <span class="status">
                ${escapeHtml(task.status)}
            </span>

            ${
                task.dueDate
                    ? `<p><strong>Due:</strong> ${formatDate(task.dueDate)}</p>`
                    : ""
            }

            <div class="task-actions">

                <button
                    class="edit-btn"
                    onclick="editTask('${task._id}')"
                >
                    Edit
                </button>

                <button
                    class="delete-btn"
                    onclick="deleteTask('${task._id}')"
                >
                    Delete
                </button>

            </div>
        `;

        taskList.appendChild(card);
    });
}


// ===============================
// EDIT TASK
// ===============================

async function editTask(id) {

    const title = prompt("Enter new task title:");

    if (title === null) return;

    const description = prompt("Enter new description:");

    if (description === null) return;

    const status = prompt(
        "Enter status: Pending, In Progress, or Completed"
    );

    if (status === null) return;

    const validStatuses = [
        "Pending",
        "In Progress",
        "Completed"
    ];

    if (!validStatuses.includes(status)) {

        alert(
            "Invalid status. Please use Pending, In Progress, or Completed."
        );

        return;
    }

    const token = localStorage.getItem("token");

    try {

        const response = await fetch(`${API_URL}/tasks/${id}`, {

            method: "PUT",

            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },

            body: JSON.stringify({
                title,
                description,
                status
            })
        });

        const data = await response.json();

        if (response.ok) {

            alert("Task updated successfully!");

            loadTasks();

        } else {

            alert(data.message || "Failed to update task.");
        }

    } catch (error) {

        console.error(error);

        alert("Unable to connect to server.");
    }
}


// ===============================
// DELETE TASK
// ===============================

async function deleteTask(id) {

    const confirmDelete = confirm(
        "Are you sure you want to delete this task?"
    );

    if (!confirmDelete) return;

    const token = localStorage.getItem("token");

    try {

        const response = await fetch(`${API_URL}/tasks/${id}`, {

            method: "DELETE",

            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (response.ok) {

            alert("Task deleted successfully!");

            loadTasks();

        } else {

            alert(data.message || "Failed to delete task.");
        }

    } catch (error) {

        console.error(error);

        alert("Unable to connect to server.");
    }
}


// ===============================
// LOGOUT
// ===============================

function logout() {

    localStorage.removeItem("token");

    document.getElementById("dashboardSection")
        .classList.add("hidden");

    document.getElementById("loginSection")
        .classList.remove("hidden");
}


// ===============================
// HELPERS
// ===============================

function formatDate(date) {

    return new Date(date).toLocaleDateString();
}


function escapeHtml(value) {

    const div = document.createElement("div");

    div.textContent = value;

    return div.innerHTML;
}


// ===============================
// CHECK EXISTING LOGIN
// ===============================

window.addEventListener("load", () => {

    const token = localStorage.getItem("token");

    if (token) {

        document.getElementById("loginSection")
            .classList.add("hidden");

        document.getElementById("dashboardSection")
            .classList.remove("hidden");

        loadTasks();
    }
});