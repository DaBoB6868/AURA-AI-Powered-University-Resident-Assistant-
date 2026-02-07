import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Resend } from 'resend';

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

    // Send email to RA via Resend
    const raEmail = body.raEmail;
    const resendKey = process.env.RESEND_API_KEY;
    let emailSent = false;

    if (raEmail && resendKey) {
      try {
        const resend = new Resend(resendKey);
        await resend.emails.send({
          from: 'UGA Dorm RA Bot <onboarding@resend.dev>',
          to: raEmail,
          subject: `Appointment Request from ${body.studentName || 'A Resident'}`,
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
                  <tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Student Email</td><td style="padding: 8px; border-bottom: 1px solid #eee;"><a href="mailto:${body.studentEmail || ''}">${body.studentEmail || 'N/A'}</a></td></tr>
                  <tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Preferred Time</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${body.preferredTime || 'Not specified'}</td></tr>
                  <tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Location</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${body.raDorm || 'N/A'}, Floor ${body.raFloor || '?'}</td></tr>
                  <tr><td style="padding: 8px; font-weight: bold;">Reason</td><td style="padding: 8px;">${body.reason || 'No reason provided'}</td></tr>
                </table>
                <p style="color: #666; font-size: 14px;">Please reply to the student at <a href="mailto:${body.studentEmail || ''}">${body.studentEmail || ''}</a> to confirm or reschedule.</p>
                <p style="color: #999; font-size: 12px; margin-top: 20px;">— Sent automatically by UGA Dorm RA Bot</p>
              </div>
            </div>
          `,
        });
        emailSent = true;
        console.log('Email sent to RA:', raEmail);
      } catch (emailErr: any) {
        console.error('Resend email error:', emailErr?.message || emailErr);
      }
    }

    return NextResponse.json({
      ok: true,
      message: emailSent
        ? 'Request saved & email sent to your RA!'
        : 'Request saved! (Email notification could not be sent — your RA will be notified another way.)',
      id: entry.id,
      emailSent,
    });
  } catch (err) {
    console.error('Schedule POST error:', err);
    return NextResponse.json({ ok: false, error: 'Invalid request' }, { status: 400 });
  }
}
