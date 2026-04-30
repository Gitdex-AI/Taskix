export class TelegramClient {
  constructor(private readonly botToken: string) {}

  async sendMessage(chatId: number, text: string): Promise<void> {
    if (!this.botToken) return;
    const chunks = chunkText(text, 3900);
    for (const chunk of chunks) {
      await fetch(`https://api.telegram.org/bot${this.botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text: chunk })
      });
    }
  }

  async setWebhook(webhookUrl: string, secretToken?: string): Promise<unknown> {
    if (!this.botToken) throw new Error("Missing Telegram bot token");
    const response = await fetch(`https://api.telegram.org/bot${this.botToken}/setWebhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: webhookUrl, ...(secretToken ? { secret_token: secretToken } : {}) })
    });
    if (!response.ok) throw new Error(`Telegram setWebhook failed: ${response.status} ${await response.text()}`);
    return response.json();
  }
}

function chunkText(text: string, size: number): string[] {
  const chunks: string[] = [];
  for (let index = 0; index < text.length; index += size) chunks.push(text.slice(index, index + size));
  return chunks.length ? chunks : [""];
}
