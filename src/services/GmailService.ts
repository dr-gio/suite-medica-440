/**
 * GmailService — Sends emails directly via Gmail API using OAuth2 (no backend needed).
 */

const GMAIL_SEND_SCOPE = 'https://www.googleapis.com/auth/gmail.send';

let cachedToken: string | null = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let tokenClient: any = null;

function loadGsiScript(): Promise<void> {
    return new Promise((resolve) => {
        if (document.getElementById('gsi-script') || (window as any).google?.accounts) {
            resolve();
            return;
        }
        const s = document.createElement('script');
        s.id = 'gsi-script';
        s.src = 'https://accounts.google.com/gsi/client';
        s.async = true;
        s.defer = true;
        s.onload = () => resolve();
        document.head.appendChild(s);
    });
}

async function getAccessToken(clientId: string): Promise<string> {
    if (cachedToken) return cachedToken;

    await loadGsiScript();

    return new Promise((resolve, reject) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const g = (window as any).google;
        tokenClient = g.accounts.oauth2.initTokenClient({
            client_id: clientId,
            scope: GMAIL_SEND_SCOPE,
            callback: (resp: any) => {
                if (resp.error) { reject(new Error(resp.error)); return; }
                cachedToken = resp.access_token;
                setTimeout(() => { cachedToken = null; }, (resp.expires_in - 60) * 1000);
                resolve(resp.access_token);
            },
        });
        tokenClient.requestAccessToken({ prompt: '' });
    });
}

function encodeBase64Url(str: string): string {
    return btoa(unescape(encodeURIComponent(str)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

function blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const b64 = (reader.result as string).split(',')[1];
            resolve(b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''));
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

interface SendEmailOptions {
    clientId: string;
    to: string;
    subject: string;
    bodyHtml: string;
    pdfBlob?: Blob;
    pdfFilename?: string;
}

export async function sendGmailWithAttachment(opts: SendEmailOptions): Promise<void> {
    const { clientId, to, subject, bodyHtml, pdfBlob, pdfFilename } = opts;

    const accessToken = await getAccessToken(clientId);

    const boundary = `boundary_${Date.now()}`;

    let raw: string;

    if (pdfBlob && pdfFilename) {
        const pdfB64 = await blobToBase64(pdfBlob);

        raw = [
            `To: ${to}`,
            `Subject: =?utf-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`,
            'MIME-Version: 1.0',
            `Content-Type: multipart/mixed; boundary="${boundary}"`,
            '',
            `--${boundary}`,
            'Content-Type: text/html; charset="utf-8"',
            'Content-Transfer-Encoding: base64',
            '',
            encodeBase64Url(bodyHtml),
            '',
            `--${boundary}`,
            `Content-Type: application/pdf; name="${pdfFilename}"`,
            'Content-Transfer-Encoding: base64',
            `Content-Disposition: attachment; filename="${pdfFilename}"`,
            '',
            pdfB64,
            '',
            `--${boundary}--`,
        ].join('\r\n');
    } else {
        raw = [
            `To: ${to}`,
            `Subject: =?utf-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`,
            'MIME-Version: 1.0',
            'Content-Type: text/html; charset="utf-8"',
            'Content-Transfer-Encoding: base64',
            '',
            encodeBase64Url(bodyHtml),
        ].join('\r\n');
    }

    const encodedRaw = encodeBase64Url(raw);

    const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ raw: encodedRaw }),
    });

    if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.error?.message || 'Error enviando el correo');
    }
}

export function clearGmailToken() {
    cachedToken = null;
}
