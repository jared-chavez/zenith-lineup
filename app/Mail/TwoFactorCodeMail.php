<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class TwoFactorCodeMail extends Mailable
{
    use Queueable, SerializesModels;

    public $name;
    public $email;
    public $code;
    public $ip;
    public $url;

    /**
     * Create a new message instance.
     */
    public function __construct($name, $email, $code, $ip, $url)
    {
        $this->name = $name;
        $this->email = $email;
        $this->code = $code;
        $this->ip = $ip;
        $this->url = $url;
    }

    /**
     * Build the message.
     */
    public function build()
    {
        return $this->subject('Código de verificación 2FA - Zenith Lineup')
            ->view('emails.two_factor_code')
            ->with([
                'name' => $this->name,
                'email' => $this->email,
                'code' => $this->code,
                'ip' => $this->ip,
                'url' => $this->url,
            ]);
    }
} 