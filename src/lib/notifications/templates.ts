import { NotificationTemplateData, ReminderType } from './types';

export class NotificationTemplates {
  /**
   * Generates WhatsApp message text according to Meta Business guidelines.
   */
  static renderWhatsApp(data: NotificationTemplateData): string {
    const { vendorName, companyName, documentName, expiryDate, portalUrl, timing } = data;

    switch (timing) {
      case '30_days':
        return (
          `Hello ${vendorName},\n\n` +
          `This is a compliance reminder from ${companyName}.\n\n` +
          `Your ${documentName} is due to expire on ${expiryDate} (in 30 days).\n\n` +
          `Please submit the renewed document before the expiry date to maintain continuous compliance.\n\n` +
          `Upload securely here: ${portalUrl}\n\n` +
          `Regards,\n` +
          `${companyName}\n` +
          `ADYK ZUOG • COMPLIANCE, SIMPLIFIED.`
        );

      case '15_days':
        return (
          `Hello ${vendorName},\n\n` +
          `This is an important compliance alert from ${companyName}.\n\n` +
          `Your ${documentName} is due to expire in 15 days on ${expiryDate}.\n\n` +
          `Please upload the renewed certificate promptly to prevent supply-chain audit flags.\n\n` +
          `Upload portal: ${portalUrl}\n\n` +
          `Regards,\n` +
          `${companyName}\n` +
          `ADYK ZUOG`
        );

      case '7_days':
        return (
          `Hello ${vendorName},\n\n` +
          `Action Required: Your ${documentName} for ${companyName} expires in 7 days (${expiryDate}).\n\n` +
          `Please upload the renewed statutory document immediately to avoid supplier approval hold.\n\n` +
          `Immediate Upload: ${portalUrl}\n\n` +
          `Regards,\n` +
          `${companyName}\n` +
          `ADYK ZUOG Compliance Desk`
        );

      case '1_day':
        return (
          `Hello ${vendorName},\n\n` +
          `FINAL NOTICE: Your ${documentName} for ${companyName} expires TOMORROW (${expiryDate}).\n\n` +
          `Please upload your renewed certificate today to prevent automated vendor status suspension.\n\n` +
          `Upload Link: ${portalUrl}\n\n` +
          `Regards,\n` +
          `${companyName}\n` +
          `ADYK ZUOG`
        );

      case 'expired':
      default:
        return (
          `Hello ${vendorName},\n\n` +
          `NOTICE OF NON-COMPLIANCE: Your ${documentName} for ${companyName} expired on ${expiryDate}.\n\n` +
          `Please submit the updated document at the earliest to restore active compliance status.\n\n` +
          `Submit Replacement: ${portalUrl}\n\n` +
          `Regards,\n` +
          `${companyName}\n` +
          `ADYK ZUOG Compliance Desk`
        );
    }
  }

  /**
   * Generates email subject line.
   */
  static renderEmailSubject(data: NotificationTemplateData): string {
    const { companyName, documentName, timing } = data;
    switch (timing) {
      case '30_days':
        return `[Compliance Notice] 30-Day Expiry Reminder: ${documentName} — ${companyName}`;
      case '15_days':
        return `[Action Required] 15-Day Validity Alert: ${documentName} — ${companyName}`;
      case '7_days':
        return `[URGENT] 7 Days Left: ${documentName} Expiry — ${companyName}`;
      case '1_day':
        return `[FINAL NOTICE] Document Expires Tomorrow: ${documentName} — ${companyName}`;
      case 'expired':
      default:
        return `[NON-COMPLIANCE ALERT] Document Expired: ${documentName} — ${companyName}`;
    }
  }

  /**
   * Generates email HTML body.
   */
  static renderEmailHtml(data: NotificationTemplateData): string {
    const { vendorName, companyName, documentName, documentNumber, expiryDate, portalUrl, timing, daysRemaining } = data;

    const isExpired = timing === 'expired' || daysRemaining <= 0;
    const accentColor = isExpired ? '#DC2626' : daysRemaining <= 7 ? '#D97706' : '#0B1E3B';
    const statusBadge = isExpired ? 'EXPIRED' : daysRemaining === 1 ? 'EXPIRES TOMORROW' : `${daysRemaining} DAYS REMAINING`;

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ADYK ZUOG Compliance Notification</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F8FAFC; margin: 0; padding: 24px; color: #0F172A;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center">
        <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #FFFFFF; border-radius: 8px; border: 1px solid #E2E8F0; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
          <!-- Header -->
          <tr>
            <td style="background-color: #0B1E3B; padding: 24px 32px; border-bottom: 3px solid #00A878;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <div style="color: #FFFFFF; font-size: 20px; font-weight: bold; letter-spacing: -0.5px;">ADYK ZUOG</div>
                    <div style="color: #00A878; font-size: 11px; font-weight: 600; letter-spacing: 1px; margin-top: 2px;">COMPLIANCE, SIMPLIFIED.</div>
                  </td>
                  <td align="right">
                    <span style="background-color: rgba(255,255,255,0.12); color: #FFFFFF; font-size: 11px; font-weight: 600; padding: 4px 10px; border-radius: 4px; text-transform: uppercase;">
                      ${statusBadge}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 32px;">
              <p style="font-size: 15px; line-height: 1.5; margin: 0 0 16px 0;">Hello <strong>${vendorName}</strong>,</p>
              
              <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 24px 0;">
                This is an official statutory compliance notice from <strong>${companyName}</strong>. A mandatory certificate registered to your vendor account requires your attention.
              </p>

              <!-- Certificate Details Card -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F1F5F9; border-radius: 6px; border-left: 4px solid ${accentColor}; margin-bottom: 28px;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <table width="100%" border="0" cellspacing="0" cellpadding="4" style="font-size: 13px;">
                      <tr>
                        <td width="35%" style="color: #64748B; font-weight: 500;">Document:</td>
                        <td style="color: #0F172A; font-weight: 700;">${documentName}</td>
                      </tr>
                      ${documentNumber ? `
                      <tr>
                        <td style="color: #64748B; font-weight: 500;">Certificate No:</td>
                        <td style="color: #0F172A; font-mono; font-weight: 600;">${documentNumber}</td>
                      </tr>` : ''}
                      <tr>
                        <td style="color: #64748B; font-weight: 500;">Expiry Date:</td>
                        <td style="color: ${accentColor}; font-weight: 700;">${expiryDate}</td>
                      </tr>
                      <tr>
                        <td style="color: #64748B; font-weight: 500;">Required Action:</td>
                        <td style="color: #0F172A;">Submit renewed/valid document copy</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 28px;">
                <tr>
                  <td align="center">
                    <a href="${portalUrl}" target="_blank" style="display: inline-block; background-color: #0B1E3B; color: #FFFFFF; font-size: 14px; font-weight: 600; text-decoration: none; padding: 12px 28px; border-radius: 6px; box-shadow: 0 2px 4px rgba(11,30,59,0.2);">
                      Upload Renewed Document &rarr;
                    </a>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top: 10px;">
                    <span style="font-size: 11px; color: #94A3B8;">No password required. Upload directly from your mobile or PC.</span>
                  </td>
                </tr>
              </table>

              <p style="font-size: 13px; line-height: 1.5; color: #64748B; margin: 0 0 8px 0;">
                If you have already submitted the renewed certificate or believe this is in error, please disregard this notice or contact the compliance officer at <strong>${companyName}</strong>.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #F8FAFC; padding: 20px 32px; border-top: 1px solid #E2E8F0; font-size: 11px; color: #94A3B8; text-align: center; line-height: 1.6;">
              <div>This message was sent via <strong>ADYK ZUOG</strong> on behalf of <strong>${companyName}</strong>.</div>
              <div style="margin-top: 4px;">Build &amp; Develop : Rejiesh Ashwanth V &bull; ADYK Multi Venture Company</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();
  }
}
