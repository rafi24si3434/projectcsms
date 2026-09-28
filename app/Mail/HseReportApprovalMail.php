<?php

namespace App\Mail;

use App\Models\HseReport;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class HseReportApprovalMail extends Mailable
{
    use Queueable, SerializesModels;

    public HseReport $report;
    public string $approveUrl;
    public string $rejectUrl;

    /**
     * Create a new message instance.
     */
    public function __construct(HseReport $report)
    {
        $this->report = $report;
        $this->approveUrl = url("/hse-report/approve/{$report->id}/{$report->approval_token}");
        $this->rejectUrl = url("/hse-report/reject/{$report->id}/{$report->approval_token}");
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $fromName = !empty($this->report->submitter_name)
            ? $this->report->submitter_name . ' (PT BESMINDO HSE)'
            : (config('mail.from.name') ?: 'PT BESMINDO MATERI SEWATAMA');

        $fromAddress = config('mail.from.address', 'tatiavierzararizky@gmail.com');

        $replyToList = [];
        if (!empty($this->report->submitter_email)) {
            $replyToList[] = new Address(
                $this->report->submitter_email,
                $this->report->submitter_name ?: 'Submitter HSE'
            );
        }

        return new Envelope(
            from: new Address($fromAddress, $fromName),
            replyTo: $replyToList,
            subject: "[APPROVAL REQUIRED] Laporan HSE {$this->report->rig_no} - Periode {$this->report->period} ({$this->report->year})" . (!empty($this->report->submitter_name) ? " - Diinput oleh: {$this->report->submitter_name}" : ""),
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.hse_approval',
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
