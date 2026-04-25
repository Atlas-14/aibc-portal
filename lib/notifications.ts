import { Resend } from "resend";

const getResend = () => new Resend(process.env.RESEND_API_KEY);
const FROM = "AIBC <onboarding@resend.dev>";
const DEFAULT_PORTAL_URL = "https://portal.aibusinesscenters.com";
const DEFAULT_DOCUMENTS_URL = `${DEFAULT_PORTAL_URL}/dashboard/documents`;

export function getBusinessAddress(unitNumber?: string | null) {
  return unitNumber
    ? `125 N 9th Street, Unit ${unitNumber}, Frederick, OK 73542`
    : "125 N 9th Street, Frederick, OK 73542";
}

export async function sendDocumentUploadedEmail(params: {
  clientEmail: string;
  clientName: string;
  documentName: string;
  category: string;
  portalUrl?: string;
}) {
  return getResend().emails.send({
    from: FROM,
    to: [params.clientEmail],
    subject: `New document available: ${params.documentName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #040d1a; padding: 32px; border-radius: 12px;">
          <h1 style="color: #36EAEA; font-size: 24px; margin-bottom: 8px;">New Document Available</h1>
          <p style="color: #E6E9ED; margin-bottom: 24px;">Hi ${params.clientName},</p>
          <p style="color: #E6E9ED; margin-bottom: 16px;">
            A new document has been added to your AIBC portal:
          </p>
          <div style="background: rgba(54,234,234,0.1); border: 1px solid rgba(54,234,234,0.3); border-radius: 8px; padding: 16px; margin-bottom: 24px;">
            <p style="color: white; font-weight: bold; margin: 0;">${params.documentName}</p>
            <p style="color: #36EAEA; font-size: 12px; margin: 4px 0 0 0;">${params.category}</p>
          </div>
          <a href="${params.portalUrl || DEFAULT_DOCUMENTS_URL}" 
             style="background: #36EAEA; color: #040d1a; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
            View in Portal →
          </a>
          <p style="color: #E6E9ED; margin-top: 24px; font-size: 12px;">
            AI Business Centers · 125 N 9th Street, Frederick, OK 73542<br>
            <a href="mailto:atlas@aibusinesscenters.com" style="color: #36EAEA;">atlas@aibusinesscenters.com</a>
          </p>
        </div>
      </div>
    `,
  });
}

export async function sendWelcomeEmail(params: {
  clientEmail: string;
  clientName: string;
  businessName?: string;
  businessAddress: string;
}) {
  return getResend().emails.send({
    from: FROM,
    to: [params.clientEmail],
    subject: "Welcome to AI Business Centers - Action Required",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #040d1a; padding: 32px; border-radius: 12px;">
          <h1 style="color: #36EAEA; font-size: 24px; margin-bottom: 8px;">Welcome to AIBC</h1>
          <p style="color: #E6E9ED; margin-bottom: 16px;">Hi ${params.clientName},</p>
          <p style="color: #E6E9ED; margin-bottom: 16px;">
            Your AI Business Centers account is active. Your business address is:
          </p>
          <div style="background: rgba(54,234,234,0.1); border: 1px solid rgba(54,234,234,0.3); border-radius: 8px; padding: 16px; margin-bottom: 24px;">
            <p style="color: white; font-weight: bold; margin: 0;">${params.businessName || params.clientName}</p>
            <p style="color: #E6E9ED; margin: 4px 0 0 0;">${params.businessAddress}</p>
          </div>
          <p style="color: #E6E9ED; margin-bottom: 16px;">
            <strong style="color: white;">Next step - Action Required:</strong><br>
            Log into your portal and complete your USPS Form 1583 compliance. This is required to legally receive mail at your business address.
          </p>
          <a href="${DEFAULT_PORTAL_URL}" 
             style="background: #36EAEA; color: #040d1a; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block; margin-bottom: 24px;">
            Log Into Your Portal →
          </a>
          <p style="color: #E6E9ED; font-size: 14px;">
            Questions? Email us at <a href="mailto:atlas@aibusinesscenters.com" style="color: #36EAEA;">atlas@aibusinesscenters.com</a>
          </p>
          <p style="color: #E6E9ED; margin-top: 24px; font-size: 12px;">
            AI Business Centers · 125 N 9th Street, Frederick, OK 73542
          </p>
        </div>
      </div>
    `,
  });
}

export async function sendAccountActivatedEmail(params: {
  clientEmail: string;
  clientName: string;
}) {
  return getResend().emails.send({
    from: FROM,
    to: [params.clientEmail],
    subject: "Your AIBC account is active",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #040d1a; padding: 32px; border-radius: 12px;">
          <h1 style="color: #36EAEA; font-size: 24px; margin-bottom: 8px;">Account Activated</h1>
          <p style="color: #E6E9ED; margin-bottom: 16px;">Hi ${params.clientName}, your account is now fully active.</p>
          <a href="${DEFAULT_PORTAL_URL}" 
             style="background: #36EAEA; color: #040d1a; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
            Access Your Portal →
          </a>
        </div>
      </div>
    `,
  });
}
