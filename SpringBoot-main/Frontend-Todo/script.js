// Shared script for login, register, and todos pages
const SERVER_URL = "http://localhost:8080";
const token = localStorage.getItem("token");

// Login page logic
function login() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    fetch(`${SERVER_URL}/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
    })
        .then((response) => {
            if (response.ok) {
                return response.json();
            } else {
                return response.json().then((data) => {
                    throw new Error(data.message || "Login failed");
                });
            }
        })
        .then((data) => {
            localStorage.setItem("token", data.token);
            alert("Login successfully");
            window.location.href = "todos.html";
        })
        .catch((error) => {
            console.error(error);
            alert(error.message);
        });
}

// Register page logic
function register() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    fetch(`${SERVER_URL}/auth/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
    })
        .then((response) => {
            if (response.ok) {
                alert("Register successfully");
                window.location.href = "login.html";
            } else {
                alert("Register failed");
                return response.json().then((data) => {
                    alert(data.message);
                });
            }
        })
        .catch((error) => {
            console.error(error);
        });

}

// Todos page logic
function createTodoCard(todo) {
    const card = document.createElement("div");
    card.classList.add("todo-card");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = todo.isCompleted;
    checkbox.addEventListener("change", () => {
        const updatedTodo = {
            ...todo, isCompleted: checkbox.checked
        }
        updateTodoStatus(updatedTodo);
    });
    const titleElement = document.createElement("span");
    titleElement.textContent = todo.title;
    if (todo.isCompleted) {
        titleElement.style.textDecoration = "line-through";
        titleElement.style.color = "gray";

    }
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", () => {
        deleteTodo(todo.id);
    });
    card.appendChild(checkbox);
    card.appendChild(titleElement);
    card.appendChild(deleteButton);
    return card;
}

function loadTodos() {
    if (!token) {
        alert("Please login first");
        window.location.href = "login.html";
        return;
    }
    fetch(`${SERVER_URL}/api/v1/todo`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    })
        .then((response) => response.json())
        .then((data) => {
            const todoList = document.getElementById("todo-list");
            todoList.innerHTML = "";
            if (data.length) {
                data.forEach((todo) => {
                    const card = createTodoCard(todo);
                    todoList.appendChild(card);
                });
            } else {
                todoList.innerHTML = '<p id="empty-message">No todos found</p>';
            }
        })
        .catch((error) => {
            alert(error.message);
            const todoList = document.getElementById("todo-list");
            if (todoList) {
                todoList.innerHTML = '<p id="empty-message">Loading failed</p>';
            }
        });
}

function addTodo() {
    const input = document.getElementById("new-todo");
    if (!input) return;

    const title = input.value.trim();
    if (!title) {
        alert("Please enter a todo item");
        return;
    }

    const todo = {
        title: title,
        description: title, // Backend requires description, using title as fallback
        isCompleted: false
    };

    fetch(`${SERVER_URL}/api/v1/todo/create`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(todo)
    })
        .then((response) => {
            if (response.ok) {
                // alert("Todo added successfully"); // Optional: remove alert for smoother UX
                return response.json();
            } else {
                throw new Error("Failed to add todo");
            }
        })
        .then((newtodo) => {
            input.value = "";
            console.log(newtodo);
            loadTodos();
        })
        .catch((error) => {
            alert(error.message);
        });
}

function updateTodoStatus(todo) {
    fetch(`${SERVER_URL}/api/v1/todo`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(todo)
    })
        .then((response) => {
            if (response.ok)
                alert("Todo updated successfully");
            else
                alert("Todo updated failed");
            return response.text();
        })
        .then((data) => {
            console.log(data);
            loadTodos();
        })
        .catch((error) => {
            alert(error.message);
        });
}

function deleteTodo(id) {
    fetch(`${SERVER_URL}/api/v1/todo/${id}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    })
        .then((response) => {
            if (response.ok)
                alert("Todo deleted successfully");
            else
                alert("Todo deleted failed");
            return response.text();
        })
        .then((data) => {
            console.log(data);
            loadTodos();
        })
        .catch((error) => {
            alert(error.message);
        });
}

// Page-specific initializations
document.addEventListener("DOMContentLoaded", function () {
    if (document.getElementById("todo-list")) {
        loadTodos();
    }
});
