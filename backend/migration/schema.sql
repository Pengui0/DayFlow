-- ==============================================================================
-- MIGRATION: fix role escalation, column-restrict self-updates, keep updated_at fresh
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Stop trusting client-supplied role at signup — always insert as 'employee'
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    emp_code TEXT;
    user_name TEXT;
BEGIN
    emp_code := COALESCE(NEW.raw_user_meta_data->>'employee_id', 'EMP-' || UPPER(SUBSTRING(NEW.id::text, 1, 8)));
    user_name := COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1));

    INSERT INTO public.employees (id, employee_id, email, full_name, role)
    VALUES (NEW.id, emp_code, NEW.email, user_name, 'employee');
    -- role is hardcoded — promote to admin only via a separate, admin-authorized path
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- existing trigger on_auth_user_created already points at this function, no change needed there

-- ------------------------------------------------------------------------------
-- 2. Employees: only phone / address / profile_picture_url are self-editable
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.enforce_employee_self_update()
RETURNS TRIGGER AS $$
BEGIN
    IF public.is_admin(auth.uid()) THEN
        RETURN NEW;  -- admins are unrestricted, enforced below at the row level
    END IF;

    IF NEW.id IS DISTINCT FROM OLD.id
       OR NEW.employee_id IS DISTINCT FROM OLD.employee_id
       OR NEW.email IS DISTINCT FROM OLD.email
       OR NEW.full_name IS DISTINCT FROM OLD.full_name
       OR NEW.role IS DISTINCT FROM OLD.role
       OR NEW.job_title IS DISTINCT FROM OLD.job_title THEN
        RAISE EXCEPTION 'Only phone, address, and profile_picture_url are self-editable';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS enforce_employee_self_update_trigger ON public.employees;
CREATE TRIGGER enforce_employee_self_update_trigger
    BEFORE UPDATE ON public.employees
    FOR EACH ROW EXECUTE FUNCTION public.enforce_employee_self_update();

-- column enforcement now lives in the trigger, so the policy just needs to gate row ownership
DROP POLICY IF EXISTS "Employees can update limited personal fields" ON public.employees;
CREATE POLICY "Employees can update own row"
ON public.employees FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- ------------------------------------------------------------------------------
-- 3. Attendance: employees can only set check_out on their own row
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.enforce_employee_attendance_update()
RETURNS TRIGGER AS $$
BEGIN
    IF public.is_admin(auth.uid()) THEN
        RETURN NEW;
    END IF;

    IF NEW.employee_id IS DISTINCT FROM OLD.employee_id
       OR NEW.date IS DISTINCT FROM OLD.date
       OR NEW.check_in IS DISTINCT FROM OLD.check_in
       OR NEW.status IS DISTINCT FROM OLD.status THEN
        RAISE EXCEPTION 'You can only set check_out on your own attendance record';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS enforce_employee_attendance_update_trigger ON public.attendance;
CREATE TRIGGER enforce_employee_attendance_update_trigger
    BEFORE UPDATE ON public.attendance
    FOR EACH ROW EXECUTE FUNCTION public.enforce_employee_attendance_update();

-- ------------------------------------------------------------------------------
-- 4. Keep updated_at current on employees, leave_requests, payroll
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at_employees ON public.employees;
CREATE TRIGGER set_updated_at_employees
    BEFORE UPDATE ON public.employees
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_leave_requests ON public.leave_requests;
CREATE TRIGGER set_updated_at_leave_requests
    BEFORE UPDATE ON public.leave_requests
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_payroll ON public.payroll;
CREATE TRIGGER set_updated_at_payroll
    BEFORE UPDATE ON public.payroll
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

    