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

  // ✅ Debug logs before sending
  console.log('[DEBUG] Email API URL:', apiUrl);
  console.log('[DEBUG] Email API Key:', apiKey ? 'Loaded' : 'Missing');
  console.log('[DEBUG] Email FROM:', from);
  console.log('[DEBUG] Sending to:', to);
  console.log('[DEBUG] Subject:', subject);
  console.log('[DEBUG] Text:', text);

  if (!apiUrl || !apiKey || !from) {
    console.log(`Email not configured. Would send to ${to}: ${subject} - ${text}`);
    return;
  }

  const form = new URLSearchParams();
  form.append('from', from);
  form.append('to', to);
  form.append('subject', subject);
  form.append('text', text);

  try {
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`api:${apiKey}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: form.toString(),
    });

    const resText = await res.text();

    // ✅ Log Mailgun response
    console.log('[DEBUG] Mailgun response status:', res.status);
    console.log('[DEBUG] Mailgun response body:', resText);

    if (!res.ok) {
      console.error('[MAILGUN ERROR]', resText);
    }
  } catch (error) {
    console.error('Failed to send trade-in confirmation email:', error);
  }
}
