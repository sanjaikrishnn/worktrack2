-- WorkTrack Sample Seed Data (PostgreSQL)

INSERT INTO users (id, emp_id, name, email, password_hash, salt, role, department, designation, hourly_rate, active) VALUES
('usr_emp_001', 'EMP001', 'John Doe', 'john.doe@worktrack.com', 'a1b2c3d4e5f6', 'salt123', 'employee', 'IT / Engineering', 'Senior Developer', 300.00, true),
('usr_emp_002', 'EMP002', 'Jane Smith', 'jane.smith@worktrack.com', 'a1b2c3d4e5f6', 'salt123', 'employee', 'IT / Engineering', 'Backend Engineer', 300.00, true),
('usr_emp_003', 'EMP003', 'Alex Kumar', 'alex.kumar@worktrack.com', 'a1b2c3d4e5f6', 'salt123', 'employee', 'IT / Frontend', 'Frontend Engineer', 300.00, true),
('usr_emp_004', 'EMP004', 'Priya Sharma', 'priya.sharma@worktrack.com', 'a1b2c3d4e5f6', 'salt123', 'employee', 'IT / Engineering', 'Full Stack Engineer', 300.00, true),
('usr_emp_005', 'EMP005', 'Rahul Verma', 'rahul.verma@worktrack.com', 'a1b2c3d4e5f6', 'salt123', 'employee', 'IT / Mobile', 'Mobile Developer', 300.00, true),
('usr_emp_006', 'EMP006', 'Neha Singh', 'neha.singh@worktrack.com', 'a1b2c3d4e5f6', 'salt123', 'employee', 'IT / Quality', 'Software Engineer', 300.00, true),
('usr_tst_001', 'TST001', 'Sarah Tester', 'tester@worktrack.com', 'a1b2c3d4e5f6', 'salt123', 'tester', 'QA & Testing', 'Senior QA Engineer', 280.00, true),
('usr_mgr_001', 'MGR001', 'Michael Scott', 'manager@worktrack.com', 'a1b2c3d4e5f6', 'salt123', 'manager', 'Management', 'Engineering Manager', 500.00, true),
('usr_adm_001', 'ADM001', 'Admin Director', 'admin@worktrack.com', 'a1b2c3d4e5f6', 'salt123', 'admin', 'Executive Administration', 'System Administrator', 600.00, true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO tasks (id, task_id, title, description, module_id, module_name, assigned_to_user_id, original_delivery_user_id, deadline, progress, status, qa_status) VALUES
('tsk_001', 'T-001', 'Login Authentication & Validation', 'Implement secure login, session verification and error handling.', 'mod_login', 'Login Module', 'usr_emp_001', 'usr_emp_001', '2025-10-12', 100, 'completed', 'Pass'),
('tsk_002', 'T-002', 'Payment Gateway Integration', 'Implement payment integration with gateway API.', 'mod_payment', 'Payment Gateway', 'usr_emp_001', 'usr_emp_002', '2025-10-15', 60, 'reopened', 'Fail'),
('tsk_003', 'T-003', 'UI Enhancement', 'Responsive layout for mobile viewport.', 'mod_ui', 'UI Enhancement', 'usr_emp_001', 'usr_emp_001', '2025-10-18', 100, 'completed', 'Pass'),
('tsk_004', 'T-004', 'Reporting Dashboard Engine', 'CSV exports and aggregation charts.', 'mod_reporting', 'Reporting', 'usr_emp_003', 'usr_emp_003', '2025-10-20', 100, 'completed', 'Pass'),
('tsk_005', 'TASK-012', 'Special Character Password Validation', 'Login fails when special characters are used.', 'mod_login', 'Login Module', 'usr_emp_001', 'usr_emp_001', '2025-10-18', 60, 'reopened', 'Fail')
ON CONFLICT (id) DO NOTHING;

INSERT INTO bug_reports (id, bug_id, title, description, severity, task_id, module_name, reported_by_user_id, status, assigned_to_user_id, original_deliverer_user_id, correction_deadline) VALUES
('bug_001', 'BUG-001', 'Login validation error', 'Login fails with invalid credentials.', 'High', 'tsk_002', 'Payment Gateway', 'usr_tst_001', 'in_progress', 'usr_emp_001', 'usr_emp_002', '2025-10-16'),
('bug_002', 'BUG-002', 'Data mismatch in weekly summary', 'Weekly summary totals show mismatch.', 'Medium', 'tsk_004', 'Dashboard', 'usr_tst_001', 'in_progress', 'usr_emp_003', 'usr_emp_003', '2025-10-18'),
('bug_003', 'BUG-003', 'Timeout on exporting high-volume reports', 'Export to CSV fails when rows > 5000.', 'High', 'tsk_004', 'Reporting', 'usr_tst_001', 'ready_for_review', 'usr_emp_004', 'usr_emp_004', '2025-10-15'),
('bug_004', 'BUG-004', 'Login validation error', 'Login fails when special characters are used in password field.', 'High', 'tsk_005', 'Login Module', 'usr_tst_001', 'assigned', 'usr_emp_001', 'usr_emp_001', '2025-10-18')
ON CONFLICT (id) DO NOTHING;

INSERT INTO corrective_time_entries (id, bug_id, task_id, module_name, employee_id, hours_spent, hours_display, hourly_rate, calculated_cost, proposed_deduction, status, entry_date) VALUES
('cte_001', 'BUG-004', 'TASK-012', 'Login Module', 'usr_emp_001', 2.6, '2h 36m', 300.00, 780.00, 780.00, 'approved', '16 Oct 2025'),
('cte_002', 'BUG-002', 'TASK-008', 'Dashboard', 'usr_emp_001', 2.9, '2h 54m', 300.00, 870.00, 870.00, 'pending', '12 Oct 2025'),
('cte_003', 'BUG-001', 'T-002', 'Payment Gateway', 'usr_emp_001', 3.0, '3h 00m', 300.00, 900.00, 900.00, 'approved', '15 Oct 2025'),
('cte_004', 'BUG-002', 'T-004', 'Dashboard', 'usr_emp_003', 8.25, '8h 15m', 300.00, 2475.00, 2475.00, 'pending', '14 Oct 2025'),
('cte_005', 'BUG-003', 'T-005', 'Reports', 'usr_emp_004', 12.33, '12h 20m', 300.00, 3700.00, 3700.00, 'approved', '15 Oct 2025'),
('cte_006', 'BUG-005', 'T-006', 'Profile', 'usr_emp_005', 6.75, '6h 45m', 300.00, 2025.00, 2025.00, 'pending', '12 Oct 2025'),
('cte_007', 'BUG-006', 'T-007', 'Login Module', 'usr_emp_006', 9.66, '9h 40m', 300.00, 2900.00, 2900.00, 'approved', '11 Oct 2025')
ON CONFLICT (id) DO NOTHING;
