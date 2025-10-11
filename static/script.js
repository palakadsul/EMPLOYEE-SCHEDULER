document.addEventListener("DOMContentLoaded", function () {
    console.log("App loaded!");
    loadEmployees();
    loadShifts();
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
                const unavailableDays = emp.unavailable_days ? emp.unavailable_days.split(',').filter(d => d.trim()) : [];
                const skills = emp.skills ? emp.skills.split(',').filter(s => s.trim()) : [];
                
                const card = document.createElement("div");
                card.classList.add("employee-card");
                card.innerHTML = `
                    <div class="employee-header">
                        <div class="employee-info">
                            <h3>${emp.name}</h3>
                            <div class="employee-badges">
                                <span class="badge badge-outline">${emp.role}</span>
                                ${skills.slice(0, 3).map(skill => 
                                    `<span class="badge badge-primary">${skill.trim()}</span>`
                                ).join('')}
                            </div>
                            <p class="employee-id">ID: ${emp.id} | Max Hours: ${emp.max_hours_per_week}h/week</p>
                        </div>
                        <div class="employee-stats">
                            <button class="btn btn-sm btn-secondary" onclick="editEmployee(${emp.id})" style="margin-right: 0.5rem;">
                                <i class="fas fa-edit"></i> Edit
                            </button>
                            <button class="btn btn-sm btn-secondary" onclick="deleteEmployee(${emp.id}, '${emp.name.replace(/'/g, "\\'")}')">
                                <i class="fas fa-trash"></i> Delete
                            </button>
                        </div>
                    </div>
                    <div class="employee-details">
                        <div class="detail-section">
                            <div class="detail-label">Skills</div>
                            <div class="detail-content">
                                ${skills.length > 0 ? 
                                    skills.map(s => `<span class="badge badge-outline">${s.trim()}</span>`).join(' ') :
                                    '<span style="color: #94a3b8;">No skills listed</span>'
                                }
                            </div>
                        </div>
                        <div class="detail-section">
                            <div class="detail-label">Days Off (Unavailable Days)</div>
                            <div class="detail-content">
                                ${unavailableDays.length > 0 ? 
                                    unavailableDays.map(d => `<span class="badge badge-error">${d.trim()}</span>`).join(' ') :
                                    '<span style="color: #10b981;">Available all days</span>'
                                }
                            </div>
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

function loadShifts() {
    console.log("Loading shifts...");
    fetch("/get_shifts")
        .then((res) => res.json())
        .then((data) => {
            console.log("Shifts loaded:", data);
            const list = document.getElementById("shiftsList");
            list.innerHTML = "";

            if (data.length === 0) {
                list.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-clock fa-3x"></i>
                        <p>No shifts yet. Click "Add Shift" to create shifts.</p>
                    </div>
                `;
                return;
            }

            // Group by day
            const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
            days.forEach(day => {
                const dayShifts = data.filter(s => s.day === day);
                if (dayShifts.length === 0) return;
                
                const daySection = document.createElement("div");
                daySection.innerHTML = `<h3 style="margin: 1.5rem 0 1rem 0; color: #0066cc;"><i class="fas fa-calendar-day"></i> ${day}</h3>`;
                list.appendChild(daySection);
                
                const shiftsGrid = document.createElement("div");
                shiftsGrid.classList.add("shift-grid");
                
                dayShifts.forEach(shift => {
                    const card = document.createElement("div");
                    card.classList.add("shift-card");
                    card.innerHTML = `
                        <div class="shift-info">
                            <h3>${shift.name}</h3>
                            <div class="shift-details">
                                <div><i class="fas fa-clock"></i> ${shift.start_time} - ${shift.end_time}</div>
                                <div><i class="fas fa-users"></i> Required Staff: ${shift.required_staff}</div>
                                ${shift.required_skills ? 
                                    `<div><i class="fas fa-code"></i> Skills: ${shift.required_skills}</div>` : 
                                    ''
                                }
                            </div>
                            <div style="margin-top: 1rem;">
                                <button class="btn btn-sm btn-secondary" onclick="deleteShift(${shift.id}, '${shift.name.replace(/'/g, "\\'")}')">
                                    <i class="fas fa-trash"></i> Delete
                                </button>
                            </div>
                        </div>
                    `;
                    shiftsGrid.appendChild(card);
                });
                
                list.appendChild(shiftsGrid);
            });
            
            updateStatistics();
        })
        .catch(err => {
            console.error("Error loading shifts:", err);
        });
}

function showAddEmployeeModal() {
    const modal = createEmployeeModal();
    document.body.appendChild(modal);
}

function editEmployee(id) {
    fetch("/get_employees")
        .then(res => res.json())
        .then(data => {
            const emp = data.find(e => e.id === id);
            if (emp) {
                const modal = createEmployeeModal(emp);
                document.body.appendChild(modal);
            }
        });
}

function createEmployeeModal(employee = null) {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0,0,0,0.7); display: flex; align-items: center;
        justify-content: center; z-index: 10000;
    `;
    
    const isEdit = employee !== null;
    
    modal.innerHTML = `
        <div style="background: white; border-radius: 12px; padding: 2rem; max-width: 600px; width: 90%; max-height: 90vh; overflow-y: auto;">
            <h2 style="margin-bottom: 1.5rem;">${isEdit ? 'Edit' : 'Add'} Employee</h2>
            
            <div class="form-group">
                <label>Name *</label>
                <input type="text" id="empName" class="form-control" value="${employee?.name || ''}" required>
            </div>
            
            <div class="form-group">
                <label>Role *</label>
                <input type="text" id="empRole" class="form-control" value="${employee?.role || ''}" required>
            </div>
            
            <div class="form-group">
                <label>Skills (comma-separated)</label>
                <input type="text" id="empSkills" class="form-control" value="${employee?.skills || ''}" placeholder="Python,Java,Leadership">
            </div>
            
            <div class="form-group">
                <label>Max Hours Per Week</label>
                <input type="number" id="empMaxHours" class="form-control" value="${employee?.max_hours_per_week || 40}" min="1" max="80">
            </div>
            
            <div class="form-group">
                <label>Days Off / Unavailable Days (comma-separated)</label>
                <input type="text" id="empUnavailable" class="form-control" value="${employee?.unavailable_days || ''}" placeholder="Saturday,Sunday">
                <small style="color: #64748b; font-size: 0.75rem;">Days: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday</small>
            </div>
            
            <div style="display: flex; gap: 0.75rem; margin-top: 1.5rem;">
                <button class="btn btn-primary" onclick="saveEmployee(${isEdit ? employee.id : 'null'})">
                    <i class="fas fa-save"></i> Save
                </button>
                <button class="btn btn-secondary" onclick="this.closest('[style*=fixed]').remove()">
                    Cancel
                </button>
            </div>
        </div>
    `;
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
    
    return modal;
}

function saveEmployee(id) {
    const name = document.getElementById('empName').value.trim();
    const role = document.getElementById('empRole').value.trim();
    const skills = document.getElementById('empSkills').value.trim();
    const maxHours = document.getElementById('empMaxHours').value;
    const unavailable = document.getElementById('empUnavailable').value.trim();
    
    if (!name || !role) {
        alert('Name and Role are required');
        return;
    }
    
    showLoading(true);
    
    const url = id ? `/update_employee/${id}` : '/add_employee';
    const method = id ? 'PUT' : 'POST';
    
    fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            name, role, skills, 
            max_hours: parseInt(maxHours),
            unavailable_days: unavailable
        }),
    })
    .then((res) => res.json())
    .then(() => {
        showLoading(false);
        document.querySelector('[style*=fixed]').remove();
        alert(`Employee ${id ? 'updated' : 'added'} successfully!`);
        loadEmployees();
    })
    .catch(err => {
        console.error("Error:", err);
        showLoading(false);
        alert(`Failed to ${id ? 'update' : 'add'} employee`);
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

function showAddShiftModal() {
    const modal = createShiftModal();
    document.body.appendChild(modal);
}

function createShiftModal() {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0,0,0,0.7); display: flex; align-items: center;
        justify-content: center; z-index: 10000;
    `;
    
    modal.innerHTML = `
        <div style="background: white; border-radius: 12px; padding: 2rem; max-width: 500px; width: 90%;">
            <h2 style="margin-bottom: 1.5rem;">Add Shift</h2>
            
            <div class="form-group">
                <label>Shift Name *</label>
                <input type="text" id="shiftName" class="form-control" placeholder="Morning Shift" required>
            </div>
            
            <div class="form-group">
                <label>Day *</label>
                <select id="shiftDay" class="form-control" required>
                    <option value="Monday">Monday</option>
                    <option value="Tuesday">Tuesday</option>
                    <option value="Wednesday">Wednesday</option>
                    <option value="Thursday">Thursday</option>
                    <option value="Friday">Friday</option>
                    <option value="Saturday">Saturday</option>
                    <option value="Sunday">Sunday</option>
                </select>
            </div>
            
            <div class="form-group">
                <label>Start Time *</label>
                <input type="time" id="shiftStart" class="form-control" value="09:00" required>
            </div>
            
            <div class="form-group">
                <label>End Time *</label>
                <input type="time" id="shiftEnd" class="form-control" value="17:00" required>
            </div>
            
            <div class="form-group">
                <label>Required Staff *</label>
                <input type="number" id="shiftStaff" class="form-control" value="2" min="1" required>
            </div>
            
            <div class="form-group">
                <label>Required Skills (comma-separated)</label>
                <input type="text" id="shiftSkills" class="form-control" placeholder="Python,Java">
            </div>
            
            <div style="display: flex; gap: 0.75rem; margin-top: 1.5rem;">
                <button class="btn btn-primary" onclick="saveShift()">
                    <i class="fas fa-save"></i> Save
                </button>
                <button class="btn btn-secondary" onclick="this.closest('[style*=fixed]').remove()">
                    Cancel
                </button>
            </div>
        </div>
    `;
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
    
    return modal;
}

function saveShift() {
    const name = document.getElementById('shiftName').value.trim();
    const day = document.getElementById('shiftDay').value;
    const startTime = document.getElementById('shiftStart').value;
    const endTime = document.getElementById('shiftEnd').value;
    const requiredStaff = document.getElementById('shiftStaff').value;
    const requiredSkills = document.getElementById('shiftSkills').value.trim();
    
    if (!name || !day || !startTime || !endTime) {
        alert('All required fields must be filled');
        return;
    }
    
    showLoading(true);
    
    fetch('/add_shift', {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            name, day, 
            start_time: startTime,
            end_time: endTime,
            required_staff: parseInt(requiredStaff),
            required_skills: requiredSkills
        }),
    })
    .then((res) => res.json())
    .then(() => {
        showLoading(false);
        document.querySelector('[style*=fixed]').remove();
        alert('Shift added successfully!');
        loadShifts();
    })
    .catch(err => {
        console.error("Error:", err);
        showLoading(false);
        alert('Failed to add shift');
    });
}

function deleteShift(id, name) {
    if (!confirm(`Delete shift "${name}"?`)) return;

    showLoading(true);

    fetch(`/delete_shift/${id}`, { method: "DELETE" })
        .then((res) => res.json())
        .then(() => {
            showLoading(false);
            alert("Shift deleted!");
            loadShifts();
        })
        .catch(err => {
            console.error("Error:", err);
            showLoading(false);
            alert("Failed to delete shift");
        });
}

function generateSchedule() {
    console.log("Generating schedule with GENETIC algorithm");
    showLoading(true);
    
    fetch('/generate_schedule/genetic')
        .then(res => res.json())
        .then(data => {
            console.log("Schedule generated:", data);
            showLoading(false);
            displayScheduleResults(data);
            displaySchedule(data.schedule_data);
            
            const scheduleTab = document.querySelector('[data-tab="schedule"]');
            if (scheduleTab) scheduleTab.click();
            
            alert(`Schedule generated successfully!\nFitness: ${data.fitness}\nViolations: ${data.violations}`);
        })
        .catch(err => {
            console.error("Error:", err);
            showLoading(false);
            alert("Failed to generate schedule. Make sure you have both employees and shifts added.");
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
    if (data.violations > 0 && data.violation_details) {
        let violationsHtml = `
            <div class="violations-box">
                <div class="violations-title">⚠️ ${data.violations} Violations</div>
                <div class="violations-list">
        `;
        data.violation_details.forEach(v => {
            violationsHtml += `<div class="violation-item">• ${v}</div>`;
        });
        violationsHtml += `</div></div>`;
        violationsList.innerHTML = violationsHtml;
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
    
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    
    for (const day of days) {
        const shifts = scheduleData[day];
        if (!shifts || shifts.length === 0) continue;
        
        const dayDiv = document.createElement('div');
        dayDiv.classList.add('day-schedule');
        
        let shiftsHtml = '<div class="shifts-container">';
        shifts.forEach(shift => {
            const isUnderstaffed = shift.assigned.length < shift.required;
            const assignedHtml = shift.assigned.length > 0
                ? shift.assigned.map(emp => `<span class="employee-name-badge">${emp}</span>`).join('')
                : '<div class="no-staff"><i class="fas fa-exclamation-circle"></i> No staff</div>';
            
            shiftsHtml += `
                <div class="shift-assignment" style="${isUnderstaffed ? 'border-color: #ef4444; border-width: 2px;' : ''}">
                    <div class="shift-name">${shift.shift}</div>
                    <div class="shift-time"><i class="fas fa-clock"></i> ${shift.time}</div>
                    <div class="assigned-employees">${assignedHtml}</div>
                    <div class="staff-count" style="${isUnderstaffed ? 'color: #ef4444; font-weight: 600;' : ''}">
                        ${shift.assigned.length}/${shift.required} staff
                        ${isUnderstaffed ? ' ⚠️' : ' ✓'}
                    </div>
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
    Promise.all([
        fetch("/get_employees").then(res => res.json()),
        fetch("/get_shifts").then(res => res.json())
    ])
    .then(([employees, shifts]) => {
        document.getElementById('statsEmployees').textContent = employees.length;
        document.getElementById('statsShifts').textContent = shifts.length;
        
        // Calculate total weekly hours
        let totalHours = 0;
        shifts.forEach(shift => {
            const start = shift.start_time.split(':');
            const end = shift.end_time.split(':');
            let hours = parseInt(end[0]) - parseInt(start[0]);
            if (hours < 0) hours += 24; // Handle overnight shifts
            totalHours += hours * shift.required_staff;
        });
        
        document.getElementById('statsWeeklyHours').textContent = `${totalHours}h`;
    })
    .catch(err => console.error("Error updating stats:", err));
}

function showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.style.display = show ? 'flex' : 'none';
    }
}

function exportPDF() {
    showLoading(true);
    
    fetch('/export_pdf')
        .then(response => {
            if (!response.ok) throw new Error('Export failed');
            return response.blob();
        })
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `schedule_${new Date().toISOString().split('T')[0]}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            showLoading(false);
            alert('PDF exported successfully!');
        })
        .catch(err => {
            console.error('Error:', err);
            showLoading(false);
            alert('Failed to export PDF. Make sure you have generated a schedule first.');
        });
}

// Make all functions globally available
window.showAddEmployeeModal = showAddEmployeeModal;
window.editEmployee = editEmployee;
window.saveEmployee = saveEmployee;
window.deleteEmployee = deleteEmployee;
window.showAddShiftModal = showAddShiftModal;
window.saveShift = saveShift;
window.deleteShift = deleteShift;
window.generateSchedule = generateSchedule;
window.exportPDF = exportPDF;