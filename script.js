/* =========================================
   TASKFLOW
   SMART TASK MANAGEMENT SYSTEM
========================================= */


/* =========================
   DOM ELEMENTS
========================= */

const modal =
    document.getElementById("modal");

const taskForm =
    document.getElementById("taskForm");

const taskList =
    document.getElementById("taskList");

const emptyState =
    document.getElementById("emptyState");

const openModalBtn =
    document.getElementById("openModal");

const emptyAddBtn =
    document.getElementById("emptyAddBtn");

const closeModalBtn =
    document.getElementById("closeModal");

const cancelModalBtn =
    document.getElementById("cancelModal");

const searchInput =
    document.getElementById("searchInput");

const themeBtn =
    document.getElementById("themeBtn");

const themeTopBtn =
    document.getElementById("themeTopBtn");

const clearCompletedBtn =
    document.getElementById("clearCompleted");


/* =========================
   FORM ELEMENTS
========================= */

const taskId =
    document.getElementById("taskId");

const taskTitle =
    document.getElementById("taskTitle");

const taskDescription =
    document.getElementById("taskDescription");

const taskCategory =
    document.getElementById("taskCategory");

const taskPriority =
    document.getElementById("taskPriority");

const taskDate =
    document.getElementById("taskDate");

const taskImportant =
    document.getElementById("taskImportant");


/* REMINDER */

const reminderEnabled =
    document.getElementById("reminderEnabled");

const reminderDate =
    document.getElementById("reminderDate");

const reminderTime =
    document.getElementById("reminderTime");

const reminderFields =
    document.getElementById("reminderFields");


/* =========================
   DATA
========================= */

let tasks =
    JSON.parse(
        localStorage.getItem("taskflowTasks")
    ) || [];


let currentFilter = "all";

let currentStatus = "all";


/* =========================
   CURRENT DATE
========================= */

document.getElementById(
    "currentDate"
).textContent =
    new Date().toLocaleDateString(
        "en-US",
        {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"
        }
    );


/* =========================
   SAVE TASKS
========================= */

function saveTasks() {

    localStorage.setItem(
        "taskflowTasks",
        JSON.stringify(tasks)
    );

}


/* =========================
   REMINDER TOGGLE
========================= */

reminderEnabled.addEventListener(
    "change",
    function () {

        if (this.checked) {

            reminderFields.classList.add(
                "show"
            );

            requestNotificationPermission();

        } else {

            reminderFields.classList.remove(
                "show"
            );

        }

    }
);


/* =========================
   NOTIFICATION PERMISSION
========================= */

function requestNotificationPermission() {

    if (
        "Notification" in window &&
        Notification.permission === "default"
    ) {

        Notification.requestPermission();

    }

}


/* =========================
   OPEN MODAL
========================= */

function openModal(task = null) {

    modal.classList.add("show");


    if (task) {

        document.getElementById(
            "modalTitle"
        ).textContent =
            "Edit Task";


        taskId.value =
            task.id;


        taskTitle.value =
            task.title;


        taskDescription.value =
            task.description || "";


        taskCategory.value =
            task.category;


        taskPriority.value =
            task.priority;


        taskDate.value =
            task.dueDate || "";


        taskImportant.checked =
            task.important;


        reminderEnabled.checked =
            task.reminderEnabled || false;


        reminderDate.value =
            task.reminderDate || "";


        reminderTime.value =
            task.reminderTime || "";


        if (task.reminderEnabled) {

            reminderFields.classList.add(
                "show"
            );

        } else {

            reminderFields.classList.remove(
                "show"
            );

        }

    } else {

        document.getElementById(
            "modalTitle"
        ).textContent =
            "Create New Task";


        taskForm.reset();

        taskId.value = "";

        reminderFields.classList.remove(
            "show"
        );

    }


    setTimeout(
        () => taskTitle.focus(),
        100
    );

}


/* =========================
   CLOSE MODAL
========================= */

function closeModal() {

    modal.classList.remove(
        "show"
    );

    taskForm.reset();

    taskId.value = "";

    reminderFields.classList.remove(
        "show"
    );

}


/* =========================
   FORM SUBMIT
========================= */

taskForm.addEventListener(
    "submit",
    function (e) {

        e.preventDefault();


        const title =
            taskTitle.value.trim();


        if (!title) {

            alert(
                "Please enter a task title."
            );

            return;

        }


        /* EDIT */

        if (taskId.value) {

            const task =
                tasks.find(
                    t => t.id === taskId.value
                );


            if (task) {

                task.title =
                    title;


                task.description =
                    taskDescription.value.trim();


                task.category =
                    taskCategory.value;


                task.priority =
                    taskPriority.value;


                task.dueDate =
                    taskDate.value;


                task.important =
                    taskImportant.checked;


                task.reminderEnabled =
                    reminderEnabled.checked;


                task.reminderDate =
                    reminderDate.value;


                task.reminderTime =
                    reminderTime.value;

            }

        }


        /* CREATE */

        else {

            const newTask = {

                id:
                    Date.now().toString(),

                title:
                    title,

                description:
                    taskDescription.value.trim(),

                category:
                    taskCategory.value,

                priority:
                    taskPriority.value,

                dueDate:
                    taskDate.value,

                important:
                    taskImportant.checked,

                reminderEnabled:
                    reminderEnabled.checked,

                reminderDate:
                    reminderDate.value,

                reminderTime:
                    reminderTime.value,

                completed:
                    false,

                createdAt:
                    new Date().toISOString(),

                notified:
                    false

            };


            tasks.unshift(
                newTask
            );

        }


        saveTasks();

        closeModal();

        renderTasks();

        checkReminders();

    }
);


/* =========================
   RENDER TASKS
========================= */

function renderTasks() {

    let filteredTasks =
        [...tasks];


    /* SIDEBAR FILTER */

    if (
        currentFilter === "today"
    ) {

        filteredTasks =
            filteredTasks.filter(
                task =>
                    task.dueDate ===
                    getTodayString()
            );

    }


    if (
        currentFilter === "important"
    ) {

        filteredTasks =
            filteredTasks.filter(
                task =>
                    task.important
            );

    }


    if (
        currentFilter === "reminders"
    ) {

        filteredTasks =
            filteredTasks.filter(
                task =>
                    task.reminderEnabled
            );

    }


    if (
        currentFilter === "completed"
    ) {

        filteredTasks =
            filteredTasks.filter(
                task =>
                    task.completed
            );

    }


    if (
        currentFilter === "overdue"
    ) {

        filteredTasks =
            filteredTasks.filter(
                task =>
                    task.dueDate &&
                    task.dueDate <
                    getTodayString() &&
                    !task.completed
            );

    }


    /* STATUS */

    if (
        currentStatus === "pending"
    ) {

        filteredTasks =
            filteredTasks.filter(
                task =>
                    !task.completed
            );

    }


    if (
        currentStatus === "completed"
    ) {

        filteredTasks =
            filteredTasks.filter(
                task =>
                    task.completed
            );

    }


    /* SEARCH */

    const search =
        searchInput.value
            .toLowerCase()
            .trim();


    if (search) {

        filteredTasks =
            filteredTasks.filter(
                task =>

                    task.title
                        .toLowerCase()
                        .includes(search)

                    ||

                    task.description
                        .toLowerCase()
                        .includes(search)

                    ||

                    task.category
                        .toLowerCase()
                        .includes(search)
            );

    }


    taskList.innerHTML = "";


    if (
        filteredTasks.length === 0
    ) {

        emptyState.style.display =
            "block";

    } else {

        emptyState.style.display =
            "none";

    }


    filteredTasks.forEach(
        task => {

            taskList.appendChild(
                createTaskElement(task)
            );

        }
    );


    updateStats();

}


/* =========================
   TASK HTML
========================= */

function createTaskElement(task) {

    const div =
        document.createElement("div");


    div.className =
        "task" +
        (
            task.completed
                ? " completed"
                : ""
        );


    const priorityClass =
        "priority-" +
        task.priority.toLowerCase();


    let reminderHTML = "";


    if (
        task.reminderEnabled &&
        task.reminderDate &&
        task.reminderTime
    ) {

        reminderHTML = `

            <span class="reminder-tag">

                <i class="fa-solid fa-bell"></i>

                ${formatReminder(
                    task.reminderDate,
                    task.reminderTime
                )}

            </span>

        `;

    }


    let overdueHTML = "";


    if (
        task.dueDate &&
        task.dueDate <
        getTodayString() &&
        !task.completed
    ) {

        overdueHTML = `

            <span class="overdue-tag">

                <i class="fa-solid fa-triangle-exclamation"></i>

                Overdue

            </span>

        `;

    }


    div.innerHTML = `

        <div
            class="check"
            onclick="toggleTask('${task.id}')">

            ${
                task.completed
                    ? '<i class="fa-solid fa-check"></i>'
                    : ''
            }

        </div>


        <div class="task-content">

            <div class="task-title">

                ${escapeHTML(task.title)}

            </div>


            ${
                task.description
                    ?
                    `
                    <div class="task-description">

                        ${escapeHTML(
                            task.description
                        )}

                    </div>
                    `
                    :
                    ""
            }


            <div class="task-meta">

                <span class="tag">

                    ${getCategoryIcon(
                        task.category
                    )}

                    ${task.category}

                </span>


                <span
                    class="tag ${priorityClass}">

                    ${task.priority}

                </span>


                ${
                    task.dueDate
                        ?
                        `
                        <span class="due-date">

                            <i class="fa-regular fa-calendar"></i>

                            ${formatDate(
                                task.dueDate
                            )}

                        </span>
                        `
                        :
                        ""
                }


                ${reminderHTML}

                ${overdueHTML}

            </div>

        </div>


        <div class="task-actions">

            <button
                class="star ${
                    task.important
                        ? "active"
                        : ""
                }"
                onclick="toggleImportant('${task.id}')"
                title="Important">

                <i class="fa-solid fa-star"></i>

            </button>


            <button
                onclick="editTask('${task.id}')"
                title="Edit">

                <i class="fa-solid fa-pen"></i>

            </button>


            <button
                class="delete"
                onclick="deleteTask('${task.id}')"
                title="Delete">

                <i class="fa-solid fa-trash"></i>

            </button>

        </div>

    `;


    return div;

}


/* =========================
   COMPLETE TASK
========================= */

function toggleTask(id) {

    const task =
        tasks.find(
            t => t.id === id
        );


    if (!task) return;


    task.completed =
        !task.completed;


    saveTasks();

    renderTasks();

}


/* =========================
   IMPORTANT
========================= */

function toggleImportant(id) {

    const task =
        tasks.find(
            t => t.id === id
        );


    if (!task) return;


    task.important =
        !task.important;


    saveTasks();

    renderTasks();

}


/* =========================
   EDIT
========================= */

function editTask(id) {

    const task =
        tasks.find(
            t => t.id === id
        );


    if (!task) return;


    openModal(task);

}


/* =========================
   DELETE
========================= */

function deleteTask(id) {

    if (
        !confirm(
            "Are you sure you want to delete this task?"
        )
    ) {

        return;

    }


    tasks =
        tasks.filter(
            task =>
                task.id !== id
        );


    saveTasks();

    renderTasks();

}


/* =========================
   CLEAR COMPLETED
========================= */

clearCompletedBtn.addEventListener(
    "click",
    function () {

        const completed =
            tasks.filter(
                t => t.completed
            );


        if (
            completed.length === 0
        ) {

            alert(
                "No completed tasks found."
            );

            return;

        }


        if (
            confirm(
                "Delete all completed tasks?"
            )
        ) {

            tasks =
                tasks.filter(
                    t => !t.completed
                );


            saveTasks();

            renderTasks();

        }

    }
);


/* =========================
   UPDATE STATS
========================= */

function updateStats() {

    const total =
        tasks.length;


    const completed =
        tasks.filter(
            t => t.completed
        ).length;


    const pending =
        total - completed;


    const today =
        getTodayString();


    const todayCount =
        tasks.filter(
            t =>
                t.dueDate === today &&
                !t.completed
        ).length;


    const important =
        tasks.filter(
            t => t.important
        ).length;


    const reminders =
        tasks.filter(
            t =>
                t.reminderEnabled &&
                !t.completed
        ).length;


    const overdue =
        tasks.filter(
            t =>
                t.dueDate &&
                t.dueDate < today &&
                !t.completed
        ).length;


    const progress =
        total === 0
            ? 0
            : Math.round(
                completed / total * 100
            );


    document.getElementById(
        "totalTasks"
    ).textContent = total;


    document.getElementById(
        "pendingTasks"
    ).textContent = pending;


    document.getElementById(
        "doneTasks"
    ).textContent = completed;


    document.getElementById(
        "progressText"
    ).textContent =
        progress + "%";


    document.getElementById(
        "progressPercent"
    ).textContent =
        progress + "%";


    document.getElementById(
        "progressFill"
    ).style.width =
        progress + "%";


    document.getElementById(
        "allCount"
    ).textContent = total;


    document.getElementById(
        "todayCount"
    ).textContent =
        todayCount;


    document.getElementById(
        "importantCount"
    ).textContent =
        important;


    document.getElementById(
        "reminderCount"
    ).textContent =
        reminders;


    document.getElementById(
        "completedCount"
    ).textContent =
        completed;


    document.getElementById(
        "overdueCount"
    ).textContent =
        overdue;


    document.getElementById(
        "taskCountText"
    ).textContent =
        `${total} ${
            total === 1
                ? "task"
                : "tasks"
        }`;

}


/* =========================
   SIDEBAR FILTER
========================= */

document
    .querySelectorAll(".nav-item")
    .forEach(button => {

        button.addEventListener(
            "click",
            function () {

                document
                    .querySelectorAll(
                        ".nav-item"
                    )
                    .forEach(btn =>
                        btn.classList.remove(
                            "active"
                        )
                    );


                this.classList.add(
                    "active"
                );


                currentFilter =
                    this.dataset.filter;


                updateSectionTitle();

                renderTasks();

            }
        );

    });


/* =========================
   STATUS FILTER
========================= */

document
    .querySelectorAll(".filter-btn")
    .forEach(button => {

        button.addEventListener(
            "click",
            function () {

                document
                    .querySelectorAll(
                        ".filter-btn"
                    )
                    .forEach(btn =>
                        btn.classList.remove(
                            "active"
                        )
                    );


                this.classList.add(
                    "active"
                );


                currentStatus =
                    this.dataset.status;


                renderTasks();

            }
        );

    });


/* =========================
   SEARCH
========================= */

searchInput.addEventListener(
    "input",
    renderTasks
);


/* =========================
   SECTION TITLE
========================= */

function updateSectionTitle() {

    const titles = {

        all:
            "All Tasks",

        today:
            "Today's Tasks",

        important:
            "Important Tasks",

        reminders:
            "My Reminders",

        completed:
            "Completed Tasks",

        overdue:
            "Overdue Tasks"

    };


    document.getElementById(
        "sectionTitle"
    ).textContent =
        titles[currentFilter];

}


/* =========================
   DARK MODE
========================= */

function toggleTheme() {

    document.body.classList.toggle(
        "dark"
    );


    const dark =
        document.body.classList.contains(
            "dark"
        );


    localStorage.setItem(
        "taskflowDarkMode",
        dark
    );


    updateThemeIcon();

}


function updateThemeIcon() {

    const dark =
        document.body.classList.contains(
            "dark"
        );


    const icons =
        document.querySelectorAll(
            "#themeBtn i, #themeTopBtn i"
        );


    icons.forEach(icon => {

        icon.className =
            dark
                ? "fa-solid fa-sun"
                : "fa-solid fa-moon";

    });

}


themeBtn.addEventListener(
    "click",
    toggleTheme
);


themeTopBtn.addEventListener(
    "click",
    toggleTheme
);


/* =========================
   MODAL EVENTS
========================= */

openModalBtn.addEventListener(
    "click",
    () => openModal()
);


emptyAddBtn.addEventListener(
    "click",
    () => openModal()
);


closeModalBtn.addEventListener(
    "click",
    closeModal
);


cancelModalBtn.addEventListener(
    "click",
    closeModal
);


modal.addEventListener(
    "click",
    function (e) {

        if (
            e.target === modal
        ) {

            closeModal();

        }

    }
);


/* ESC */

document.addEventListener(
    "keydown",
    function (e) {

        if (
            e.key === "Escape"
        ) {

            closeModal();

        }

    }
);


/* =========================
   REMINDER CHECK
========================= */

function checkReminders() {

    const now =
        new Date();


    let changed = false;


    tasks.forEach(task => {

        if (
            !task.reminderEnabled ||
            task.completed ||
            !task.reminderDate ||
            !task.reminderTime
        ) {

            return;

        }


        const reminderDateTime =
            new Date(
                `${task.reminderDate}T${task.reminderTime}`
            );


        const difference =
            Math.abs(
                now - reminderDateTime
            );


        /*
           Reminder window:
           1 minute
        */

        if (
            difference <= 60000 &&
            !task.notified
        ) {

            showNotification(
                task
            );


            task.notified = true;

            changed = true;

        }

    });


    if (changed) {

        saveTasks();

    }

}


/* =========================
   SHOW NOTIFICATION
========================= */

function showNotification(task) {

    if (
        "Notification" in window &&
        Notification.permission === "granted"
    ) {

        new Notification(
            "🔔 TaskFlow Reminder",
            {
                body:
                    task.title +
                    " is due now.",
                icon: ""
            }
        );

    } else {

        alert(
            "🔔 TaskFlow Reminder\n\n" +
            task.title
        );

    }

}


/* Check every 30 seconds */

setInterval(
    checkReminders,
    30000
);


/* =========================
   HELPERS
========================= */

function getTodayString() {

    const date =
        new Date();


    const year =
        date.getFullYear();


    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");


    const day =
        String(
            date.getDate()
        ).padStart(2, "0");


    return `${year}-${month}-${day}`;

}


/* FORMAT DATE */

function formatDate(
    dateString
) {

    if (!dateString) {

        return "No due date";

    }


    const date =
        new Date(
            dateString +
            "T00:00:00"
        );


    return date.toLocaleDateString(
        "en-US",
        {
            month: "short",
            day: "numeric",
            year: "numeric"
        }
    );

}


/* FORMAT REMINDER */

function formatReminder(
    date,
    time
) {

    const d =
        new Date(
            date +
            "T" +
            time
        );


    return d.toLocaleDateString(
        "en-US",
        {
            month: "short",
            day: "numeric"
        }
    ) +
    " • " +
    d.toLocaleTimeString(
        "en-US",
        {
            hour: "numeric",
            minute: "2-digit"
        }
    );

}


/* CATEGORY ICON */

function getCategoryIcon(
    category
) {

    const icons = {

        Work: "💼",

        Personal: "🏠",

        Study: "📚",

        Shopping: "🛒",

        Health: "❤️"

    };


    return (
        icons[category] ||
        "📌"
    );

}


/* ESCAPE HTML */

function escapeHTML(text) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent = text;


    return div.innerHTML;

}


/* =========================
   LOAD DARK MODE
========================= */

if (
    localStorage.getItem(
        "taskflowDarkMode"
    ) === "true"
) {

    document.body.classList.add(
        "dark"
    );

}


updateThemeIcon();


/* =========================
   INITIAL LOAD
========================= */

renderTasks();

checkReminders();