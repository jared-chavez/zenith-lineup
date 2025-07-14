<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TwoFactorCodeNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public $code;

    public function __construct($code)
    {
        $this->code = $code;
    }

    public function via($notifiable)
    {
        return ['mail'];
    }

    public function toMail($notifiable)
    {
        return (new MailMessage)
            ->subject('Tu código de verificación 2FA')
            ->greeting('Hola ' . $notifiable->name . ',')
            ->line('Tu código de verificación es:')
            ->line("**{$this->code}**")
            ->line('Este código expirará en 10 minutos.')
            ->line('Si no solicitaste este código, puedes ignorar este mensaje.');
    }
} 