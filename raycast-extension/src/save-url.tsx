import { showToast, Toast, getSelectedText, showHUD } from "@raycast/api";
import { runAppleScript } from "@raycast/utils";

const API_URL = "http://localhost:3001";

async function getCurrentBrowserTab() {
  const script = `
    tell application "System Events"
      set frontApp to name of first application process whose frontmost is true
    end tell
    
    if frontApp is "Google Chrome" then
      tell application "Google Chrome"
        if (count of windows) > 0 then
          set currentTab to active tab of front window
          return (URL of currentTab) & "|||" & (title of currentTab)
        end if
      end tell
    else if frontApp is "Safari" then
      tell application "Safari"
        if (count of windows) > 0 then
          set currentTab to current tab of front window
          return (URL of currentTab) & "|||" & (name of currentTab)
        end if
      end tell
    else if frontApp is "Arc" then
      tell application "Arc"
        if (count of windows) > 0 then
          set currentTab to active tab of front window
          return (URL of currentTab) & "|||" & (title of currentTab)
        end if
      end tell
    end if
    
    return "No supported browser found"
  `;
  
  try {
    const result = await runAppleScript(script);
    if (result === "No supported browser found") {
      throw new Error("No supported browser (Chrome, Safari, Arc) is currently active");
    }
    
    const [url, title] = result.split("|||");
    return { url: url.trim(), title: title.trim() };
  } catch (error) {
    throw new Error(`Failed to get browser tab: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function saveToUniversalPocket(url: string, title: string, selectedText?: string) {
  try {
    const response = await fetch(`${API_URL}/api/save`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url,
        title,
        content: selectedText,
        source: "raycast"
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    throw new Error(`Failed to save to Universal Pocket: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export default async function Command() {
  try {
    await showToast({
      style: Toast.Style.Animated,
      title: "Getting current tab...",
    });

    // Get current browser tab
    const { url, title } = await getCurrentBrowserTab();
    
    // Try to get selected text (optional)
    let selectedText: string | undefined;
    try {
      selectedText = await getSelectedText();
    } catch {
      // Selected text is optional, continue without it
    }

    await showToast({
      style: Toast.Style.Animated,
      title: "Saving to Universal Pocket...",
    });

    // Save to Universal Pocket
    await saveToUniversalPocket(url, title, selectedText);

    await showHUD("✅ Saved to Universal Pocket");
  } catch (error) {
    await showToast({
      style: Toast.Style.Failure,
      title: "Failed to save",
      message: error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
}