-- ==============================================================================
-- SEED DATA: Test users for local/dev testing
-- Admin: admin@dayflow.com / Admin@12345
-- Employee: john@dayflow.com / Employee@12345
--
-- NOTE: handle_new_user() trigger did not fire for these manually-inserted
-- auth.users rows (only fires reliably via supabase.auth.sign_up()), so
-- public.employees rows are inserted manually below as a workaround.
-- ==============================================================================

-- 1. Create a Test Admin user
INSERT INTO auth.users (
  id, instance_id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, role, aud,
  confirmation_token, email_change, email_change_token_new, email_change_token_current,
  phone_change, phone_change_token, reauthentication_token
) VALUES (
  'a0000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'admin@dayflow.com',
  crypt('Admin@12345', gen_salt('bf')),
  now(),
  '{"full_name": "HR Manager", "employee_id": "ADM-001", "role": "admin"}'::jsonb,
  'authenticated',
  'authenticated',
  '', '', '', '', '', '', ''
);

-- 2. Create a Test Employee user
INSERT INTO auth.users (
  id, instance_id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, role, aud,
  confirmation_token, email_change, email_change_token_new, email_change_token_current,
  phone_change, phone_change_token, reauthentication_token
) VALUES (
  'e0000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'john@dayflow.com',
  crypt('Employee@12345', gen_salt('bf')),
  now(),
  '{"full_name": "John Doe", "employee_id": "EMP-101", "role": "employee"}'::jsonb,
  'authenticated',
  'authenticated',
  '', '', '', '', '', '', ''
);

-- 3. Manually insert into public.employees
-- (trigger did not fire for direct auth.users inserts — see note above)
INSERT INTO public.employees (id, employee_id, email, full_name, role)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'ADM-001',
  'admin@dayflow.com',
  'HR Manager',
  'admin'
);

INSERT INTO public.employees (id, employee_id, email, full_name, role)
VALUES (
  'e0000000-0000-0000-0000-000000000001',
  'EMP-101',
  'john@dayflow.com',
  'John Doe',
  'employee'
);

-- 4. Add Payroll for John Doe (Admin action)
INSERT INTO public.payroll (employee_id, month, year, basic_salary, allowances, deductions)
VALUES ('e0000000-0000-0000-0000-000000000001', 8, 2026, 50000.00, 5000.00, 2000.00);
