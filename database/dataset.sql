-- WorkTrack PostgreSQL dataset (authoritative user dataset)
-- Target: PostgreSQL 14+

BEGIN;

TRUNCATE TABLE
    audit_logs,
    notifications,
    corrective_time_entries,
    fix_submissions,
    work_sessions,
    bug_reports,
    task_status_history,
    tasks,
    modules,
    projects,
    users
RESTART IDENTITY CASCADE;

-- ---------------------------------------------------------------------------
-- Employees / authentication
-- ---------------------------------------------------------------------------
INSERT INTO users
(id, emp_id, name, email, password_hash, salt, role, department, designation, hourly_rate, avatar_url, active, created_at)
VALUES
('usr_emp_001','EMP001','John Doe','john.doe@worktrack.com',
 '019eecdea241bc95211b60f982b3a02d0dd31aede67277b3de3d7ee4876a8249575a044f472d4662ba631dcc9fa1cbcd97bb682dfd0eb03fda92f60f3139b606',
 'worktrack_demo_salt_2026','employee','IT / Engineering','Senior Developer',300.00,
 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',TRUE,'2026-01-10 09:00:00+05:30'),
('usr_emp_002','EMP002','Jane Smith','jane.smith@worktrack.com',
 '019eecdea241bc95211b60f982b3a02d0dd31aede67277b3de3d7ee4876a8249575a044f472d4662ba631dcc9fa1cbcd97bb682dfd0eb03fda92f60f3139b606',
 'worktrack_demo_salt_2026','employee','IT / Engineering','Backend Engineer',300.00,
 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',TRUE,'2026-01-15 09:00:00+05:30'),
('usr_emp_003','EMP003','Alex Kumar','alex.kumar@worktrack.com',
 '019eecdea241bc95211b60f982b3a02d0dd31aede67277b3de3d7ee4876a8249575a044f472d4662ba631dcc9fa1cbcd97bb682dfd0eb03fda92f60f3139b606',
 'worktrack_demo_salt_2026','employee','IT / Frontend','Frontend Engineer',300.00,
 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',TRUE,'2026-02-01 09:00:00+05:30'),
('usr_emp_004','EMP004','Priya Sharma','priya.sharma@worktrack.com',
 '019eecdea241bc95211b60f982b3a02d0dd31aede67277b3de3d7ee4876a8249575a044f472d4662ba631dcc9fa1cbcd97bb682dfd0eb03fda92f60f3139b606',
 'worktrack_demo_salt_2026','employee','IT / Engineering','Full Stack Engineer',300.00,
 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',TRUE,'2026-02-15 09:00:00+05:30'),
('usr_emp_005','EMP005','Rahul Verma','rahul.verma@worktrack.com',
 '019eecdea241bc95211b60f982b3a02d0dd31aede67277b3de3d7ee4876a8249575a044f472d4662ba631dcc9fa1cbcd97bb682dfd0eb03fda92f60f3139b606',
 'worktrack_demo_salt_2026','employee','IT / Mobile','Mobile Developer',300.00,
 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',TRUE,'2026-03-01 09:00:00+05:30'),
('usr_emp_006','EMP006','Neha Singh','neha.singh@worktrack.com',
 '019eecdea241bc95211b60f982b3a02d0dd31aede67277b3de3d7ee4876a8249575a044f472d4662ba631dcc9fa1cbcd97bb682dfd0eb03fda92f60f3139b606',
 'worktrack_demo_salt_2026','employee','IT / Quality','Software Engineer',300.00,
 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',TRUE,'2026-03-10 09:00:00+05:30'),
('usr_tst_001','TST001','Sarah Tester','tester@worktrack.com',
 '019eecdea241bc95211b60f982b3a02d0dd31aede67277b3de3d7ee4876a8249575a044f472d4662ba631dcc9fa1cbcd97bb682dfd0eb03fda92f60f3139b606',
 'worktrack_demo_salt_2026','tester','QA & Testing','Senior QA Engineer',280.00,
 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200',TRUE,'2026-01-05 09:00:00+05:30'),
('usr_mgr_001','MGR001','Michael Scott','manager@worktrack.com',
 '019eecdea241bc95211b60f982b3a02d0dd31aede67277b3de3d7ee4876a8249575a044f472d4662ba631dcc9fa1cbcd97bb682dfd0eb03fda92f60f3139b606',
 'worktrack_demo_salt_2026','manager','Management','Engineering Manager',500.00,
 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',TRUE,'2026-01-01 09:00:00+05:30'),
('usr_adm_001','ADM001','Admin Director','admin@worktrack.com',
 '019eecdea241bc95211b60f982b3a02d0dd31aede67277b3de3d7ee4876a8249575a044f472d4662ba631dcc9fa1cbcd97bb682dfd0eb03fda92f60f3139b606',
 'worktrack_demo_salt_2026','admin','Executive Administration','System Administrator',600.00,
 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200',TRUE,'2026-01-01 09:00:00+05:30');

INSERT INTO projects (id, name, description) VALUES
('prj_worktrack','WorkTrack Platform','Task tracking, QA defects, rework timers and payroll review.'),
('prj_billing','Billing Portal','Payment processing and reporting.');

INSERT INTO modules (id, project_id, name, description) VALUES
('mod_login','prj_worktrack','Login Module','Authentication and validation.'),
('mod_payment','prj_billing','Payment Gateway','Payment API, webhooks and refunds.'),
('mod_ui','prj_worktrack','UI Enhancement','Responsive layout and navigation.'),
('mod_reporting','prj_worktrack','Reporting','CSV export and charts.'),
('mod_dash','prj_worktrack','Dashboard','Weekly summary widgets.'),
('mod_profile','prj_worktrack','Employee Profile','Profile and settings.');

-- ---------------------------------------------------------------------------
-- Tasks (assignment, deadline, status)
-- ---------------------------------------------------------------------------
INSERT INTO tasks
(id, task_id, title, description, module_id, module_name, assigned_to_user_id, original_delivery_user_id, created_by_user_id,
 deadline, progress, status, submission_file, submission_notes, submitted_at, qa_status, qa_verified_at, qa_verified_by_user_id, qa_defect_reason, created_at, updated_at)
VALUES
('tsk_001','T-001','Login Authentication & Validation','Secure login, session checks and error handling.',
 'mod_login','Login Module','usr_emp_001','usr_emp_001','usr_mgr_001',
 '2026-10-12',100,'completed','login_v1.0.zip','JWT validation delivered.','2026-10-10 14:30:00+05:30','Pass','2026-10-10 15:00:00+05:30','usr_tst_001',NULL,'2026-10-01 09:00:00+05:30','2026-10-10 14:30:00+05:30'),
('tsk_002','T-002','Payment Gateway Integration','Gateway API, webhook verification and refund callback.',
 'mod_payment','Payment Gateway','usr_emp_001','usr_emp_002','usr_mgr_001',
 '2026-10-22',60,'in_progress',NULL,'Webhook checks in progress.',NULL,'Fail','2026-10-11 16:00:00+05:30','usr_tst_001','Payment webhook callback fails on timeout and invalid currency parsing.','2026-10-02 10:00:00+05:30','2026-10-11 16:00:00+05:30'),
('tsk_003','T-003','UI Enhancement & Responsive Layout','Mobile layout and navigation drawer.',
 'mod_ui','UI Enhancement','usr_emp_001','usr_emp_001','usr_mgr_001',
 '2026-10-24',20,'in_progress',NULL,NULL,NULL,'Pass','2026-10-12 11:20:00+05:30','usr_tst_001',NULL,'2026-10-05 11:00:00+05:30','2026-10-12 09:00:00+05:30'),
('tsk_004','T-004','Reporting Dashboard Engine','CSV exports and aggregation charts.',
 'mod_reporting','Reporting','usr_emp_003','usr_emp_003','usr_mgr_001',
 '2026-10-25',0,'pending',NULL,NULL,NULL,'Pass','2026-10-12 17:30:00+05:30','usr_tst_001',NULL,'2026-10-08 09:00:00+05:30','2026-10-08 09:00:00+05:30'),
('tsk_005','TASK-012','Special Character Password Validation','Login fails when the password contains symbols.',
 'mod_login','Login Module','usr_emp_001','usr_emp_001','usr_mgr_001',
 '2026-10-18',60,'reopened',NULL,'Reopened after QA defect BUG-004.',NULL,'Fail','2026-10-16 08:30:00+05:30','usr_tst_001','Special character regex triggers uncaught exception on auth API.','2026-10-01 09:00:00+05:30','2026-10-16 11:24:00+05:30'),
('tsk_006','TASK-008','Analytics Dashboard Widgets','Monthly summary charts.',
 'mod_dash','Dashboard','usr_emp_004','usr_emp_004','usr_mgr_001',
 '2026-10-14',100,'completed','dash_widgets_v2.zip','Widgets verified.','2026-10-13 17:00:00+05:30','Pass','2026-10-13 18:00:00+05:30','usr_tst_001',NULL,'2026-10-02 09:00:00+05:30','2026-10-13 17:00:00+05:30'),
('tsk_007','T-006','Employee Profile API','Profile get/update endpoints.',
 'mod_profile','Employee Profile','usr_emp_005','usr_emp_005','usr_mgr_001',
 '2026-10-10',40,'overdue',NULL,'Deadline missed pending defect fix.',NULL,'Pending',NULL,NULL,NULL,'2026-09-28 09:00:00+05:30','2026-10-16 09:00:00+05:30'),
('tsk_008','T-007','Login Rate Limit','Throttle repeated failed logins.',
 'mod_login','Login Module','usr_emp_006','usr_emp_006','usr_mgr_001',
 '2026-10-20',100,'completed','rate_limit_fix.zip','Fix delivered.','2026-10-11 16:00:00+05:30','Pass','2026-10-11 16:30:00+05:30','usr_tst_001',NULL,'2026-10-03 09:00:00+05:30','2026-10-11 16:00:00+05:30');

INSERT INTO task_status_history (id, task_id, previous_status, new_status, changed_by_user_id, comment, "timestamp") VALUES
('hist_001','tsk_001','in_progress','completed','usr_emp_001','Deliverable login_v1.0.zip submitted.','2026-10-10 14:30:00+05:30'),
('hist_002','tsk_005','completed','reopened','usr_tst_001','Reopened due to BUG-004.','2026-10-16 09:15:00+05:30'),
('hist_003','tsk_007','in_progress','overdue','usr_mgr_001','Deadline passed.','2026-10-11 00:00:00+05:30'),
('hist_004','tsk_006','in_progress','completed','usr_emp_004','Dashboard widgets submitted.','2026-10-13 17:00:00+05:30');

-- ---------------------------------------------------------------------------
-- Bug reports
-- ---------------------------------------------------------------------------
INSERT INTO bug_reports
(id, bug_id, title, description, steps_to_reproduce, expected_result, actual_result, severity,
 evidence_url, evidence_name, task_id, module_id, module_name, reported_by_user_id, reported_at, status,
 assigned_to_user_id, original_deliverer_user_id, correction_deadline, manager_notes, assigned_at, assigned_by_user_id)
VALUES
('bug_001','BUG-001','Login validation error on invalid credentials',
 'Failed login does not show a clear error.',
 '1. Open login  2. Enter invalid password  3. Submit',
 'Show invalid-credentials message.','Silent failure or unclear error.','High',
 '/uploads/error-screenshot.png','error-screenshot.png','tsk_002','mod_payment','Payment Gateway',
 'usr_tst_001','2026-10-11 10:15:00+05:30','in_progress',
 'usr_emp_001','usr_emp_002','2026-10-20','Fix validation messaging.','2026-10-11 14:00:00+05:30','usr_mgr_001'),
('bug_002','BUG-002','Weekly summary total mismatch',
 'Weekly totals disagree with detail rows.',
 '1. Open dashboard  2. Open weekly summary  3. Compare totals',
 'Summary matches rows.','Inactive rows omitted from total.','Medium',
 NULL,NULL,'tsk_004','mod_dash','Dashboard',
 'usr_tst_001','2026-10-12 11:00:00+05:30','in_progress',
 'usr_emp_003','usr_emp_003','2026-10-22','Check cache and empty-state query.','2026-10-12 15:00:00+05:30','usr_mgr_001'),
('bug_003','BUG-003','CSV export timeout',
 'Export fails for more than 5000 rows.',
 '1. Reports  2. 90-day range  3. Export CSV',
 'File downloads.','HTTP 504 timeout.','High',
 '/uploads/export-timeout.log','export-timeout.log','tsk_004','mod_reporting','Reporting',
 'usr_tst_001','2026-10-13 09:30:00+05:30','ready_for_review',
 'usr_emp_004','usr_emp_004','2026-10-20','Stream the file instead of buffering.','2026-10-13 10:00:00+05:30','usr_mgr_001'),
('bug_004','BUG-004','Special character password rejected',
 'Valid passwords with symbols are rejected.',
 '1. Valid user  2. Password with @#$  3. Login',
 'Login succeeds.','Validation error.','High',
 '/uploads/error-screenshot.png','error-screenshot.png','tsk_005','mod_login','Login Module',
 'usr_tst_001','2026-10-16 09:00:00+05:30','assigned',
 'usr_emp_001','usr_emp_001','2026-10-18','Keep validation strict but allow symbols.','2026-10-16 09:30:00+05:30','usr_mgr_001'),
('bug_005','BUG-005','Profile save fails on empty optional field',
 'Saving profile fails if phone is blank.',
 '1. Open profile  2. Clear phone  3. Save',
 'Optional field can be empty.','500 error.','Medium',
 NULL,NULL,'tsk_007','mod_profile','Employee Profile',
 'usr_tst_001','2026-10-14 10:00:00+05:30','reported',
 NULL,'usr_emp_005','2026-10-21',NULL,NULL,NULL),
('bug_006','BUG-006','Rate limiter blocks valid retry',
 'After one failed login, a correct password is blocked.',
 '1. Wrong password  2. Correct password immediately',
 'Second attempt allowed.','Request blocked.','Low',
 NULL,NULL,'tsk_008','mod_login','Login Module',
 'usr_tst_001','2026-10-11 17:00:00+05:30','approved',
 'usr_emp_006','usr_emp_006','2026-10-15','Fix verified.','2026-10-11 17:30:00+05:30','usr_mgr_001');

-- ---------------------------------------------------------------------------
-- Work timers (start / pause / accumulated duration)
-- ---------------------------------------------------------------------------
INSERT INTO work_sessions
(id, bug_id, employee_id, started_at, accumulated_seconds, is_running, last_heartbeat_at, updated_at)
VALUES
('ws_001','BUG-004','usr_emp_001','2026-10-16 11:24:00+05:30',9360,FALSE,'2026-10-16 14:00:00+05:30','2026-10-16 14:00:00+05:30'),
('ws_002','BUG-001','usr_emp_001','2026-10-15 10:00:00+05:30',10800,FALSE,'2026-10-15 13:00:00+05:30','2026-10-15 13:00:00+05:30'),
('ws_003','BUG-003','usr_emp_004','2026-10-15 09:00:00+05:30',17400,FALSE,'2026-10-15 13:50:00+05:30','2026-10-15 13:50:00+05:30');

-- ---------------------------------------------------------------------------
-- Fix submissions + manager review (approvals)
-- ---------------------------------------------------------------------------
INSERT INTO fix_submissions
(id, bug_id, task_id, employee_id, fix_description, progress_percentage, status, fix_file, notes,
 time_spent_seconds, submitted_at, reviewed_by_user_id, review_notes, reviewed_at)
VALUES
('fix_001','BUG-001','tsk_002','usr_emp_001','Added credential error-state reset and validation messages.',60,'submitted','fix_v1.1.zip','Awaiting manager review.',10800,'2026-10-15 16:30:00+05:30',NULL,NULL,NULL),
('fix_003','BUG-003','tsk_004','usr_emp_004','Streamed CSV in batches to avoid timeout.',100,'submitted','csv_stream_fix.zip','Ready for verification.',17400,'2026-10-15 17:15:00+05:30',NULL,NULL,NULL),
('fix_004','BUG-004','tsk_005','usr_emp_001','Allow symbols in password; added regression tests.',60,'changes_requested',NULL,'Need more unicode coverage.',9360,'2026-10-16 14:00:00+05:30','usr_mgr_001','Add unicode and emoji test cases.','2026-10-16 15:10:00+05:30'),
('fix_006','BUG-006','tsk_008','usr_emp_006','Reset limiter after a successful login.',100,'approved','rate_limit_fix.zip','QA passed.',7200,'2026-10-12 11:00:00+05:30','usr_mgr_001','Approved.','2026-10-12 16:00:00+05:30');

-- ---------------------------------------------------------------------------
-- Corrective hours + payroll preview
-- hours * hourly_rate = calculated_cost; proposed_deduction follows approval
-- ---------------------------------------------------------------------------
INSERT INTO corrective_time_entries
(id, bug_id, task_id, module_name, employee_id, hours_spent, hours_display, hourly_rate,
 calculated_cost, proposed_deduction, status, exemption_reason, entry_date, approved_by_user_id, approved_at)
VALUES
('cte_001','BUG-004','TASK-012','Login Module','usr_emp_001',2.60,'2h 36m',300.00,780.00,780.00,'approved',NULL,'16 Oct 2026','usr_mgr_001','2026-10-16 15:00:00+05:30'),
('cte_002','BUG-001','T-002','Payment Gateway','usr_emp_001',3.00,'3h 00m',300.00,900.00,900.00,'approved',NULL,'15 Oct 2026','usr_mgr_001','2026-10-15 18:00:00+05:30'),
('cte_003','BUG-002','T-004','Dashboard','usr_emp_003',8.25,'8h 15m',300.00,2475.00,2475.00,'pending',NULL,'14 Oct 2026',NULL,NULL),
('cte_004','BUG-003','T-004','Reporting','usr_emp_004',12.33,'12h 20m',300.00,3700.00,3700.00,'approved',NULL,'15 Oct 2026','usr_mgr_001','2026-10-15 18:30:00+05:30'),
('cte_005','BUG-005','T-006','Employee Profile','usr_emp_005',6.75,'6h 45m',300.00,2025.00,0.00,'exempted','Root cause is API contract, not engineer error.','12 Oct 2026','usr_mgr_001','2026-10-16 12:30:00+05:30'),
('cte_006','BUG-006','T-007','Login Module','usr_emp_006',2.00,'2h 00m',300.00,600.00,0.00,'rejected','Duplicate of an already approved login rework.','11 Oct 2026','usr_mgr_001','2026-10-12 10:00:00+05:30');

-- ---------------------------------------------------------------------------
-- Notifications
-- ---------------------------------------------------------------------------
INSERT INTO notifications (id, user_id, title, message, type, read, link, created_at) VALUES
('ntf_001','usr_emp_001','Bug assigned','BUG-004 assigned to you. Deadline 18 Oct 2026.','assignment',FALSE,'/bug-fixing/BUG-004','2026-10-16 09:30:00+05:30'),
('ntf_002','usr_emp_001','Correction deadline updated','BUG-001 deadline changed to 20 Oct 2026.','deadline',TRUE,'/bug-fixing/BUG-001','2026-10-14 11:00:00+05:30'),
('ntf_003','usr_mgr_001','Fix submitted for review','Priya Sharma submitted a fix for BUG-003.','fix_submitted',FALSE,'/manager/progress','2026-10-15 17:15:00+05:30'),
('ntf_004','usr_emp_001','Changes requested','Manager requested more tests on BUG-004.','changes_requested',FALSE,'/bug-fixing/BUG-004','2026-10-16 15:10:00+05:30'),
('ntf_005','usr_emp_006','Fix approved','Your fix for BUG-006 was approved.','fix_approved',TRUE,'/salary-rework','2026-10-12 16:00:00+05:30'),
('ntf_006','usr_emp_005','Rework exempted','BUG-005 hours were exempted from payroll deduction.','payroll_update',FALSE,'/salary-rework','2026-10-16 12:30:00+05:30'),
('ntf_007','usr_mgr_001','New bug reported','Sarah Tester reported BUG-005 on Employee Profile.','bug_reported',FALSE,'/manager/bug-review/BUG-005','2026-10-14 10:00:00+05:30');

-- ---------------------------------------------------------------------------
-- Audit logs (who changed what, when)
-- ---------------------------------------------------------------------------
INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, details, "timestamp") VALUES
('aud_001','usr_mgr_001','Michael Scott','CREATE_TASK','task','T-002','Created T-002 and assigned it to John Doe.','2026-10-02 10:00:00+05:30'),
('aud_002','usr_tst_001','Sarah Tester','REPORT_BUG','bug','BUG-004','Reported special-character login defect on TASK-012.','2026-10-16 09:00:00+05:30'),
('aud_003','usr_mgr_001','Michael Scott','ASSIGN_BUG','bug','BUG-004','Assigned BUG-004 to John Doe. Deadline 18 Oct 2026.','2026-10-16 09:30:00+05:30'),
('aud_004','usr_emp_001','John Doe','START_TIMER','work_session','BUG-004','Started corrective timer after rework authentication.','2026-10-16 11:24:00+05:30'),
('aud_005','usr_emp_004','Priya Sharma','SUBMIT_FIX','fix_submission','BUG-003','Submitted CSV stream fix. Time 12h 20m, cost ₹3700.','2026-10-15 17:15:00+05:30'),
('aud_006','usr_mgr_001','Michael Scott','REQUEST_CHANGES','bug','BUG-004','Requested extra unicode tests.','2026-10-16 15:10:00+05:30'),
('aud_007','usr_mgr_001','Michael Scott','APPROVE_FIX','bug','BUG-006','Approved Neha Singh fix.','2026-10-12 16:00:00+05:30'),
('aud_008','usr_mgr_001','Michael Scott','PAYROLL_EXEMPT','corrective_time','cte_005','Exempted Rahul Verma hours for BUG-005.','2026-10-16 12:30:00+05:30');

COMMIT;
