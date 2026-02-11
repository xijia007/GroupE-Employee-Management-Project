import { Button, Space } from "antd";
import { useCallback, useState } from "react";

export default function SectionButton({
  editing: editingProp,
  onEditingChange,
  onEdit,
  onSave,
  onCancel,
}) {
  const [editingState, setEditingState] = useState(false);
  const editing = editingProp ?? editingState;

  const setEditing = useCallback(
    (next) => {
      setEditingState(next);
      onEditingChange?.(next);
    },
    [onEditingChange],
  );

  const handleEdit = useCallback(() => {
    onEdit?.();
    setEditing(true);
  }, [onEdit, setEditing]);

  const handleSave = useCallback(async () => {
    try {
      await onSave?.();
      setEditing(false);
    } catch {
      // keep editing mode if save fails
    }
  }, [onSave, setEditing]);

  const handleCancel = useCallback(() => {
    onCancel?.();
    setEditing(false);
  }, [onCancel, setEditing]);

  return (
    <div style={{ textAlign: "center", marginTop: 24 }}>
      {!editing ? (
        <Button type="primary" onClick={handleEdit}>
          Edit
        </Button>
      ) : (
        <Space>
          <Button type="primary" onClick={handleSave}>
            Save
          </Button>
          <Button onClick={handleCancel}>Cancel</Button>
        </Space>
      )}
    </div>
  );
}
