import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import nodemailer from 'nodemailer';

const DATA_DIR = path.join(process.cwd(), 'backend', 'data');
const SCHEDULE_FILE = path.join(DATA_DIR, 'schedules.json');

function ensureDataFile() {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    if (!fs.existsSync(SCHEDULE_FILE)) fs.writeFileSync(SCHEDULE_FILE, JSON.stringify([]));
  } catch (e) {
    console.error('Failed to ensure data file:', e);
  }
}

// Gmail SMTP transporter
function createTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    ensureDataFile();

    // Persist to file
    const raw = fs.readFileSync(SCHEDULE_FILE, 'utf-8');
    const arr = JSON.parse(raw || '[]');
    const entry = {
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      ...body,
    };
    arr.push(entry);
    fs.writeFileSync(SCHEDULE_FILE, JSON.stringify(arr, null, 2));
    console.log('Persisted schedule request:', entry);

    // Send email via Gmail SMTP
    const raEmail = body.raEmail;
    const studentEmail = body.studentEmail;
    const gmailUser = process.env.GMAIL_USER;
    const gmailPass = process.env.GMAIL_APP_PASSWORD;
    let emailSent = false;
    let emailError = '';

    if (gmailUser && gmailPass && (raEmail || studentEmail)) {
      try {
        const transporter = createTransporter();

        // Build recipient list
        const recipients: string[] = [];
        if (raEmail) recipients.push(raEmail);
        if (studentEmail && studentEmail !== raEmail) recipients.push(studentEmail);

        console.log('Sending email to:', recipients);

        await transporter.sendMail({
          from: `UGA Dorm RA Bot <${gmailUser}>`,
          to: recipients.join(', '),
          subject: `Appointment Request: ${body.studentName || 'A Resident'} → ${body.raName || 'RA'}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: #BA0C2F; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
                <h2 style="margin: 0;">📋 New Appointment Request</h2>
                <p style="margin: 4px 0 0; opacity: 0.9;">UGA Dorm RA Bot</p>
              </div>
              <div style="padding: 24px; background: #f9f9f9; border: 1px solid #eee; border-radius: 0 0 8px 8px;">
                <p>Hi <strong>${body.raName || 'RA'}</strong>,</p>
                <p>A resident has requested to meet with you:</p>
                <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
                  <tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold; width: 140px;">Student Name</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${body.studentName || 'N/A'}</td></tr>
                  <tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Student Email</td><td style="padding: 8px; border-bottom: 1px solid #eee;"><a href="mailto:${studentEmail || ''}">${studentEmail || 'N/A'}</a></td></tr>
                  <tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Preferred Time</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${body.preferredTime || 'Not specified'}</td></tr>
                  <tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Location</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${body.raDorm || 'N/A'}, Floor ${body.raFloor || '?'}</td></tr>
                  <tr><td style="padding: 8px; font-weight: bold;">Reason</td><td style="padding: 8px;">${body.reason || 'No reason provided'}</td></tr>
                </table>
                <p style="color: #666; font-size: 14px;">Please reply to the student at <a href="mailto:${studentEmail || ''}">${studentEmail || ''}</a> to confirm or reschedule.</p>
                <p style="color: #999; font-size: 12px; margin-top: 20px;">— Sent automatically by UGA Dorm RA Bot</p>
              </div>
            </div>
          `,
        });

        emailSent = true;
        console.log('Email sent successfully to:', recipients);
      } catch (emailErr: any) {
        emailError = emailErr?.message || JSON.stringify(emailErr);
        console.error('Gmail SMTP error:', emailError);
      }
    } else {
      emailError = !gmailUser || !gmailPass ? 'Gmail credentials not configured' : 'No recipient email provided';
      console.warn('Email skipped:', emailError);
    }

    return NextResponse.json({
      ok: true,
      message: emailSent
        ? 'Request saved & email sent to your RA!'
        : `Request saved, but email failed: ${emailError}`,
      id: entry.id,
      emailSent,
    });
  } catch (err) {
    console.error('Schedule POST error:', err);
    return NextResponse.json({ ok: false, error: 'Invalid request' }, { status: 400 });
  }
}
