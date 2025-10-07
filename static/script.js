document.addEventListener("DOMContentLoaded", function () {
    console.log("App loaded!");
    loadEmployees();
    setupTabs();
    updateStatistics();
});

function setupTabs() {
    const tabs = document.querySelectorAll(".tab-btn");
    const contents = document.querySelectorAll(".tab-content");

    tabs.forEach((tab) => {
        tab.addEventListener("click", () => {
            tabs.forEach((t) => t.classList.remove("active"));
            contents.forEach((c) => c.classList.remove("active"));
            tab.classList.add("active");
            document.getElementById(tab.dataset.tab).classList.add("active");
        });
    });
}

function loadEmployees() {
    console.log("Loading employees...");
    fetch("/get_employees")
        .then((res) => res.json())
        .then((data) => {
            console.log("Employees loaded:", data);
            const list = document.getElementById("employeesList");
            list.innerHTML = "";

            if (data.length === 0) {
                list.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-users fa-3x"></i>
                        <p>No employees yet. Click "Add Employee" to get started.</p>
                    </div>
                `;
                return;
            }

            data.forEach(emp => {
                const card = document.createElement("div");
                card.classList.add("employee-card");
                card.innerHTML = `
                    <div class="employee-header">
                        <div class="employee-info">
                            <h3>${emp.name}</h3>
                            <div class="employee-badges">
                                <span class="badge badge-outline">${emp.role}</span>
                            </div>
                            <p class="employee-id">ID: ${emp.id}</p>
                        </div>
                        <div class="employee-stats">
                            <button class="btn btn-sm btn-secondary" onclick="deleteEmployee(${emp.id}, '${emp.name}')">
                                <i class="fas fa-trash"></i> Delete
                            </button>
                        </div>
                    </div>
                `;
                list.appendChild(card);
            });
            
            updateStatistics();
        })
        .catch(err => {
            console.error("Error loading employees:", err);
            alert("Failed to load employees. Check console.");
        });
}

function addEmployee() {
    const name = prompt("Enter employee name:");
    if (!name || !name.trim()) return;

    const role = prompt("Enter employee role:");
    if (!role || !role.trim()) return;

    showLoading(true);

    fetch("/add_employee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), role: role.trim() }),
    })
        .then((res) => res.json())
        .then(() => {
            showLoading(false);
            alert("Employee added successfully!");
            loadEmployees();
        })
        .catch(err => {
            console.error("Error adding employee:", err);
            showLoading(false);
            alert("Failed to add employee");
        });
}

function deleteEmployee(id, name) {
    if (!confirm(`Delete ${name}?`)) return;

    showLoading(true);

    fetch(`/delete_employee/${id}`, { method: "DELETE" })
        .then((res) => res.json())
        .then(() => {
            showLoading(false);
            alert("Employee deleted!");
            loadEmployees();
        })
        .catch(err => {
            console.error("Error:", err);
            showLoading(false);
            alert("Failed to delete employee");
        });
}

function generateSchedule(algorithm) {
    console.log("Generating schedule with:", algorithm);
    showLoading(true);
    
    fetch(`/generate_schedule/${algorithm}`)
        .then(res => res.json())
        .then(data => {
            console.log("Schedule generated:", data);
            showLoading(false);
            displayScheduleResults(data);
            displaySchedule(data.schedule_data);
            
            const scheduleTab = document.querySelector('[data-tab="schedule"]');
            if (scheduleTab) scheduleTab.click();
            
            alert(`Schedule generated using ${data.algorithm}!`);
        })
        .catch(err => {
            console.error("Error:", err);
            showLoading(false);
            alert("Failed to generate schedule");
        });
}

function displayScheduleResults(data) {
    const resultsCard = document.getElementById('resultsCard');
    resultsCard.style.display = 'block';
    
    document.getElementById('resultAlgorithm').textContent = data.algorithm;
    document.getElementById('resultFitness').textContent = data.fitness;
    document.getElementById('resultTime').textContent = data.time;
    document.getElementById('resultViolations').textContent = data.violations;
    
    const violationsList = document.getElementById('violationsList');
    if (data.violations > 0) {
        violationsList.innerHTML = `
            <div class="violations-box">
                <div class="violations-title">⚠️ ${data.violations} Violations</div>
            </div>
        `;
    } else {
        violationsList.innerHTML = `
            <div style="margin-top: 1rem; padding: 0.75rem; background: rgba(16, 185, 129, 0.1); border-radius: 6px; color: #10b981; font-size: 0.875rem;">
                ✓ All constraints satisfied
            </div>
        `;
    }
}

function displaySchedule(scheduleData) {
    const scheduleView = document.getElementById('scheduleView');
    scheduleView.innerHTML = '';
    
    for (const [day, shifts] of Object.entries(scheduleData)) {
        const dayDiv = document.createElement('div');
        dayDiv.classList.add('day-schedule');
        
        let shiftsHtml = '<div class="shifts-container">';
        shifts.forEach(shift => {
            const assignedHtml = shift.assigned.length > 0
                ? shift.assigned.map(emp => `<span class="employee-name-badge">${emp}</span>`).join('')
                : '<div class="no-staff"><i class="fas fa-exclamation-circle"></i> No staff</div>';
            
            shiftsHtml += `
                <div class="shift-assignment">
                    <div class="shift-name">${shift.shift}</div>
                    <div class="shift-time"><i class="fas fa-clock"></i> ${shift.time}</div>
                    <div class="assigned-employees">${assignedHtml}</div>
                    <div class="staff-count">${shift.assigned.length} staff</div>
                </div>
            `;
        });
        shiftsHtml += '</div>';
        
        dayDiv.innerHTML = `
            <div class="day-title">
                <i class="fas fa-calendar-day"></i> ${day}
            </div>
            ${shiftsHtml}
        `;
        
        scheduleView.appendChild(dayDiv);
    }
}

function updateStatistics() {
    fetch("/get_employees")
        .then(res => res.json())
        .then(data => {
            document.getElementById('statsEmployees').textContent = data.length;
            document.getElementById('statsShifts').textContent = '10';
            document.getElementById('statsWeeklyHours').textContent = '160h';
        })
        .catch(err => console.error("Error:", err));
}

function showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    overlay.style.display = show ? 'flex' : 'none';
}

function addShift() {
    alert("Shift management coming soon!");
}