let _baseUrl = '';

export function setBaseUrl(url) {
  _baseUrl = url.replace(/\/$/, '');
}

export async function streamChat(messages, onChunk, onDone, onError) {
  const controller = new AbortController();

  try {
    const response = await fetch(`${_baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data: ')) continue;

        try {
          const data = JSON.parse(trimmed.slice(6));

          if (data.type === 'content') {
            onChunk(data.text);
          } else if (data.type === 'done') {
            onDone();
          } else if (data.type === 'error') {
            onError(data.message);
          }
        } catch {
          // Skip malformed JSON
        }
      }
    }
  } catch (error) {
    if (error.name !== 'AbortError') {
      onError(error.message || 'Failed to connect to the server.');
    }
  }

  return controller;
}
