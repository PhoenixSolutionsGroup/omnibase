CREATE OR REPLACE FUNCTION notify_state_change()
RETURNS trigger AS $$
DECLARE
  notification json;
BEGIN
  -- Build notification payload with table name, row ID, and full row data
  notification = json_build_object(
    'table', TG_TABLE_NAME,
    'id', NEW.id,
    'row', row_to_json(NEW),
    'operation', TG_OP,
    'timestamp', extract(epoch from now())
  );

  -- Send notification on the 'state_changes' channel
  PERFORM pg_notify('state_changes', notification::text);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Example: Create a trigger on a specific table
-- Uncomment and modify this for your tables, or create similar triggers elsewhere
/*
CREATE TRIGGER state_changes_trigger
AFTER INSERT OR UPDATE OR DELETE ON your_table_name
FOR EACH ROW EXECUTE FUNCTION notify_state_change();
*/