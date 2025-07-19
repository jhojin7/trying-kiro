import { ActionPanel, Action, Form, showToast, Toast, showHUD, popToRoot } from "@raycast/api";
import { useState } from "react";

const API_URL = "http://localhost:3001";

interface FormValues {
  note: string;
  title?: string;
}

async function saveQuickNote(note: string, title?: string) {
  try {
    const response = await fetch(`${API_URL}/api/raycast/quick-note`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        note,
        title,
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    throw new Error(`Failed to save note: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export default function Command() {
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(values: FormValues) {
    if (!values.note.trim()) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Note content is required",
      });
      return;
    }

    setIsLoading(true);

    try {
      await showToast({
        style: Toast.Style.Animated,
        title: "Saving note...",
      });

      await saveQuickNote(values.note, values.title);

      await showHUD("✅ Note saved to Universal Pocket");
      await popToRoot();
    } catch (error) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Failed to save note",
        message: error instanceof Error ? error.message : "Unknown error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form
      isLoading={isLoading}
      actions={
        <ActionPanel>
          <Action.SubmitForm
            title="Save Note"
            onSubmit={handleSubmit}
          />
        </ActionPanel>
      }
    >
      <Form.TextArea
        id="note"
        title="Note Content"
        placeholder="Enter your note here..."
        storeValue={true}
      />
      <Form.TextField
        id="title"
        title="Title (Optional)"
        placeholder="Optional title for your note"
        storeValue={true}
      />
    </Form>
  );
}