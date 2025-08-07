export async function sendTradeInEmail(
  to: string,
  tradeInId: string,
  name: string
): Promise<void> {
  const apiUrl = process.env.EMAIL_API_URL;
  const apiKey = process.env.EMAIL_API_KEY;
  const from = process.env.EMAIL_FROM;

  const subject = 'Trade-in Confirmation';
  const text = `Hi ${name},\n\nThank you for trusting us with your device. Your trade-in ID is ${tradeInId}.\n\nBest regards,\nTrade-In Team`;

  if (!apiUrl || !apiKey || !from) {
    console.log(`Email not configured. Would send to ${to}: ${subject} - ${text}`);
    return;
  }

  try {
    await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ to, from, subject, text }),
    });
  } catch (error) {
    console.error('Failed to send trade-in confirmation email:', error);
  }
}
