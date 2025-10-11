# 🧠 AI Employee Shift Scheduler

Enterprise-grade employee shift scheduling system powered by Genetic Algorithm optimization. Efficiently manage employee schedules while respecting constraints like days off, maximum hours, and staffing requirements.

## ✨ Features

- 🧠 **Genetic Algorithm Optimization** - Uses evolutionary principles for intelligent schedule generation
- 👥 **Employee Management** - Track employee skills, availability, and constraints
- 📅 **Smart Shift Scheduling** - Define shifts with required staff and time slots
- 🚫 **Days Off Support** - Respects employee unavailable days and time-off requests
- ⏰ **Max Hours Enforcement** - Ensures employees don't exceed weekly hour limits
- 📊 **Real-time Statistics** - Monitor employee count, shifts, and weekly hours
- 📄 **PDF Export** - Generate professional schedule reports
- 💾 **SQLite Database** - Persistent data storage with automatic initialization
- 🎨 **Modern UI** - Clean, responsive interface with real-time updates
- ⚡ **Constraint Satisfaction** - Highlights violations and optimization opportunities

## 🖼️ Screenshots

### Dashboard
Beautiful, modern interface for managing employees and shifts.

### Schedule Generation
AI-powered scheduling with fitness scores and violation tracking.

### PDF Export
Professional reports ready for distribution.

## 🚀 Quick Start

### Prerequisites

- Python 3.10 or higher
- pip (Python package manager)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/palakadsul/EMPLOYEE-SCHEDULER.git
cd EMPLOYEE-SCHEDULER
```

2. **Install dependencies**
```bash
pip install -r requirements.txt
```

3. **Run the application**
```bash
python app.py
```

4. **Open in browser**
```
http://127.0.0.1:5001
```

## 📦 Dependencies

- **Flask 3.0.0** - Web framework
- **ReportLab 4.0.7** - PDF generation
- **Werkzeug 3.0.1** - WSGI utilities
- **SQLite3** - Database (included with Python)

## 🎯 How to Use

### 1. Add Employees

1. Navigate to the **Employees** tab
2. Click **"Add Employee"**
3. Fill in details:
   - Name (required)
   - Role (required)
   - Skills (comma-separated, e.g., "Python,Java,Leadership")
   - Max Hours Per Week (default: 40)
   - Days Off (comma-separated, e.g., "Saturday,Sunday")
4. Click **Save**

### 2. Create Shifts

1. Navigate to the **Shifts** tab
2. Click **"Add Shift"**
3. Define shift details:
   - Shift Name (e.g., "Morning Shift")
   - Day of the week
   - Start Time and End Time
   - Required Staff count
   - Required Skills (optional)
4. Click **Save**

### 3. Generate Schedule

1. Click **"Generate Schedule"** in the header
2. The Genetic Algorithm will:
   - Assign employees to shifts
   - Respect days off and max hours
   - Optimize for constraint satisfaction
   - Display fitness score and violations
3. View results in the **Schedule** tab

### 4. Export PDF

1. After generating a schedule
2. Click **"Export PDF"** in the Actions sidebar
3. Download professional schedule report

## 🧬 Genetic Algorithm

The scheduler uses a Genetic Algorithm that:

- **Respects Constraints:**
  - Employee unavailable days (days off)
  - Maximum hours per week per employee
  - Required staff per shift
  - Skill requirements (if specified)

- **Optimization Goals:**
  - Minimize understaffed shifts
  - Balance workload across employees
  - Maximize constraint satisfaction
  - Provide high fitness scores (85-100%)

- **Performance:**
  - Fast generation (typically < 1 second)
  - Scales with employee and shift count
  - Real-time violation detection

## 📊 Database Schema

### Tables

**employees**
```sql
- id: INTEGER PRIMARY KEY
- name: TEXT NOT NULL
- role: TEXT NOT NULL
- skills: TEXT
- max_hours_per_week: INTEGER (default: 40)
- unavailable_days: TEXT (comma-separated)
```

**shifts**
```sql
- id: INTEGER PRIMARY KEY
- name: TEXT NOT NULL
- day: TEXT NOT NULL
- start_time: TEXT NOT NULL
- end_time: TEXT NOT NULL
- required_staff: INTEGER NOT NULL
- required_skills: TEXT
```

**schedules**
```sql
- id: INTEGER PRIMARY KEY
- created_at: TIMESTAMP
- algorithm: TEXT
- fitness: TEXT
- execution_time: TEXT
- violations: INTEGER
```

**schedule_assignments**
```sql
- id: INTEGER PRIMARY KEY
- schedule_id: INTEGER (FK)
- shift_id: INTEGER (FK)
- employee_id: INTEGER (FK)
```

## Configuration

### Change Port

Edit `app.py` (last line):
```python
app.run(debug=True, port=5002)  # Change 5001 to your preferred port
```

### Sample Data

The application includes 8 sample employees and 10 sample shifts on first run. To disable:

Comment out the sample data section in `app.py` → `init_db()` function.

## 📁 Project Structure

```
EMPLOYEE-SCHEDULER/
├── app.py                  # Flask backend with database logic
├── requirements.txt        # Python dependencies
├── index.html             # Frontend (standalone HTML with embedded CSS/JS)
├── scheduler.db           # SQLite database (auto-generated)
└── README.md              # This file
```

## 🔧 Troubleshooting

### Port Already in Use

```bash
# Kill process using port 5001
kill -9 $(lsof -ti:5001)

# Or use a different port in app.py
```

### Database Issues

```bash
# Delete and regenerate database
rm scheduler.db
python app.py
```

### Missing Dependencies

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request



## Acknowledgments

- Genetic Algorithm inspiration from optimization research
- Flask framework for rapid development
- ReportLab for PDF generation
- Font Awesome for beautiful icons

## Future Enhancements

- [ ] Multi-week scheduling
- [ ] Employee preference weighting
- [ ] Email notifications
- [ ] Calendar integration (Google Calendar, Outlook)
- [ ] Mobile app
- [ ] Advanced analytics dashboard
- [ ] Shift swap requests
- [ ] Time-off request management
- [ ] Multiple algorithm comparison
- [ ] Custom constraint rules
