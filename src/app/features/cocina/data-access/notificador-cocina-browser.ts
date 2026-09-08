import { Injectable } from '@angular/core';

import { NotificadorCocina } from '../domain/notificador-cocina';

@Injectable()
export class NotificadorCocinaBrowser implements NotificadorCocina {
  notificarNuevoPedido(): void {
    const AudioContextClass = window.AudioContext;
    if (!AudioContextClass) return;

    const context = new AudioContextClass();
    void context.resume().then(() => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, context.currentTime);
      gain.gain.setValueAtTime(0.0001, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.18, context.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.32);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + 0.34);
      oscillator.addEventListener('ended', () => void context.close());
    }).catch(() => void context.close());
  }
}
