import { Component, DestroyRef, ElementRef, HostListener, OnInit, computed, inject, signal } from '@angular/core';

import { CocinaStore } from '../../application/cocina.store';
import { AjustesService } from '../../../../shared/services/ajustes.service';

@Component({
  selector: 'app-pantalla-cocina',
  imports: [],
  providers: [CocinaStore],
  templateUrl: './pantalla-page.html',
  styleUrl: './pantalla-page.scss',
})
export class PantallaCocina implements OnInit {
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly destroyRef = inject(DestroyRef);
  readonly cocinaStore = inject(CocinaStore);
  private readonly ajustesService = inject(AjustesService);

  readonly enPreparacion = this.cocinaStore.enPreparacion;
  readonly listos = this.cocinaStore.listos;
  readonly pantallaCompleta = signal(false);
  readonly negocio = this.ajustesService.ajustes;

  readonly ultimoListoNumero = computed(() => {
    const items = this.listos();
    return items.length > 0 ? items[items.length - 1].numero : null;
  });

  ngOnInit(): void {
    const intervalId = setInterval(() => void this.cocinaStore.sincronizar(), 5000);
    this.destroyRef.onDestroy(() => clearInterval(intervalId));
  }

  toggleFullscreen(): void {
    if (!document.fullscreenElement) {
      this.elementRef.nativeElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }

  @HostListener('document:fullscreenchange')
  onFullscreenChange(): void {
    this.pantallaCompleta.set(!!document.fullscreenElement);
  }
}
