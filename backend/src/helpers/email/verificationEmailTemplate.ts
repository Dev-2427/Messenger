export default function getVerificationEmailHtml(name: string, code: string) {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charSet="UTF-8" />
    <title>Email verification</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f5f6fa;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
    <table width="100%" border="0" cellPadding="0" cellSpacing="0" style="padding:30px 0;">
      <tr>
        <td align="center">
          <table width="500" border="0" cellPadding="0" cellSpacing="0" style="background-color:#ffffff;border-radius:10px;padding:25px;box-shadow:0 5px 15px rgba(0,0,0,0.08);">
            <tr>
              <td align="center" style="text-align:center;">
                <div style="font-size:14px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#4f46e5;margin-bottom:8px;">
                  Messenger
                </div>

                <h1 style="color:#1e1e2f;font-size:20px;margin:0 0 12px 0;">
                  Verify your email
                </h1>

                <p style="font-size:14px;line-height:1.6;color:#333;margin:0;">
                  Hi <b>${name}</b>,<br /><br />
                  Thanks for signing up for <b>Messenger</b>!<br />
                  Use the verification code below to confirm your email address:
                </p>

                <p style="margin:22px 0 6px 0;font-size:12px;text-transform:uppercase;letter-spacing:0.12em;color:#888;">
                  Your verification code
                </p>

                <div style="margin:0 auto 18px auto;padding:15px 20px;font-size:22px;font-weight:bold;letter-spacing:5px;background-color:#f0f2f5;border-radius:8px;display:inline-block;color:#4f46e5;">
                  ${code}
                </div>

                <p style="font-size:13px;color:#777;margin:10px 0 0 0;">
                  This code will expire in 10 minutes. If you didn’t request this, you can safely ignore this email.
                </p>

                <hr style="margin:20px 0 12px 0;border:none;border-top:1px solid #eee;" />

                <p style="font-size:11px;color:#aaa;margin:0;">
                  © ${new Date().getFullYear()} Messenger App<br />
                  All rights reserved.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
