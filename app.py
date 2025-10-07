from flask import Flask, render_template, jsonify, request
import sqlite3
import os
import random
import time

app = Flask(__name__)
DB_PATH = "employees.db"

def init_db():
    if not os.path.exists(DB_PATH):
        with sqlite3.connect(DB_PATH) as conn:
            conn.execute("""
                CREATE TABLE employees (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    role TEXT NOT NULL
                )
            """)
            
            sample_employees = [
                ("Sarah Johnson", "Senior Consultant"),
                ("Michael Chen", "Manager"),
                ("Emily Rodriguez", "Analyst"),
                ("David Kim", "Associate Consultant"),
                ("Lisa Anderson", "Senior Manager"),
                ("James Wilson", "Consultant"),
                ("Maria Garcia", "Senior Analyst"),
                ("Robert Taylor", "Partner")
            ]
            
            conn.executemany("INSERT INTO employees (name, role) VALUES (?, ?)", sample_employees)
            conn.commit()
            print("✓ Database initialized with 8 sample employees")

def get_all_employees():
    with sqlite3.connect(DB_PATH) as conn:
        conn.row_factory = sqlite3.Row
        rows = conn.execute("SELECT * FROM employees ORDER BY id").fetchall()
        return [dict(row) for row in rows]

def add_employee_to_db(name, role):
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute("INSERT INTO employees (name, role) VALUES (?, ?)", (name, role))
        conn.commit()

def delete_employee_from_db(employee_id):
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute("DELETE FROM employees WHERE id = ?", (employee_id,))
        conn.commit()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/get_employees')
def get_employees():
    try:
        employees = get_all_employees()
        return jsonify(employees)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/add_employee', methods=['POST'])
def add_employee():
    data = request.get_json()
    if not data or 'name' not in data or 'role' not in data:
        return jsonify({'error': 'Invalid data'}), 400
    
    try:
        add_employee_to_db(data['name'], data['role'])
        return jsonify({'message': 'Employee added successfully'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/delete_employee/<int:employee_id>', methods=['DELETE'])
def delete_employee(employee_id):
    try:
        delete_employee_from_db(employee_id)
        return jsonify({'message': 'Employee deleted successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/generate_schedule/<algorithm>')
def generate_schedule(algorithm):
    try:
        start_time = time.time()
        time.sleep(0.5)
        
        employees = get_all_employees()
        employee_names = [emp['name'] for emp in employees]
        
        schedule = {
            'algorithm': algorithm.upper(),
            'fitness': f'{random.randint(85, 99)}%',
            'time': f'{time.time() - start_time:.2f}s',
            'violations': random.randint(0, 2),
            'employee_count': len(employees),
            'schedule_data': {
                'Monday': [
                    {'shift': 'Morning Shift', 'time': '9:00 AM - 5:00 PM', 
                     'assigned': random.sample(employee_names, min(3, len(employee_names)))},
                    {'shift': 'Evening Shift', 'time': '5:00 PM - 1:00 AM', 
                     'assigned': random.sample(employee_names, min(2, len(employee_names)))}
                ],
                'Tuesday': [
                    {'shift': 'Morning Shift', 'time': '9:00 AM - 5:00 PM', 
                     'assigned': random.sample(employee_names, min(3, len(employee_names)))},
                    {'shift': 'Evening Shift', 'time': '5:00 PM - 1:00 AM', 
                     'assigned': random.sample(employee_names, min(2, len(employee_names)))}
                ],
                'Wednesday': [
                    {'shift': 'Morning Shift', 'time': '9:00 AM - 5:00 PM', 
                     'assigned': random.sample(employee_names, min(3, len(employee_names)))},
                    {'shift': 'Evening Shift', 'time': '5:00 PM - 1:00 AM', 
                     'assigned': random.sample(employee_names, min(2, len(employee_names)))}
                ],
                'Thursday': [
                    {'shift': 'Morning Shift', 'time': '9:00 AM - 5:00 PM', 
                     'assigned': random.sample(employee_names, min(3, len(employee_names)))},
                    {'shift': 'Evening Shift', 'time': '5:00 PM - 1:00 AM', 
                     'assigned': random.sample(employee_names, min(2, len(employee_names)))}
                ],
                'Friday': [
                    {'shift': 'Morning Shift', 'time': '9:00 AM - 5:00 PM', 
                     'assigned': random.sample(employee_names, min(3, len(employee_names)))},
                    {'shift': 'Evening Shift', 'time': '5:00 PM - 1:00 AM', 
                     'assigned': random.sample(employee_names, min(2, len(employee_names)))}
                ]
            }
        }
        
        return jsonify(schedule)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    init_db()
    print("\n" + "="*60)
    print("🚀 AI Employee Shift Scheduler - Running")
    print("="*60)
    print(f"📊 Database: {DB_PATH}")
    print(f"🌐 Open browser: http://127.0.0.1:5001")
    print("="*60 + "\n")
    app.run(debug=True, port=5001)