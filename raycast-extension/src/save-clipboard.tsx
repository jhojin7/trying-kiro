import { Clipboard, showToast, Toast, showHUD } from "@raycast/api";

const API_URL = "http://localhost:3001";

async function saveClipboardContent(content: string) {
  try {
    const response = await fetch(`${API_URL}/api/raycast/save-clipboard`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content,
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    throw new Error(`Failed to save clipboard: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export default async function Command() {
  try {
    await showToast({
      style: Toast.Style.Animated,
      title: "Reading clipboard...",
    });

    // Get clipboard content
    const clipboardContent = await Clipboard.readText();
    
    if (!clipboardContent || clipboardContent.trim() === "") {
      await showToast({
        style: Toast.Style.Failure,
        title: "Clipboard is empty",
        message: "Copy some text to your clipboard first",
      });
      return;
    }

    await showToast({
      style: Toast.Style.Animated,
      title: "Saving to Universal Pocket...",
    });

    // Save clipboard content to Universal Pocket
    await saveClipboardContent(clipboardContent);

    await showHUD("✅ Clipboard saved to Universal Pocket");
  } catch (error) {
    await showToast({
      style: Toast.Style.Failure,
      title: "Failed to save clipboard",
      message: error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
}