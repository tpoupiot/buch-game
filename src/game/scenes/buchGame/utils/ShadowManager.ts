import { Game } from "../Game";
import { AdvancedTreeShadow } from "../entities/AdvancedTreeShadow";

export class ShadowManager {
    private scene: Game;
    private shadows: AdvancedTreeShadow[] = [];
    private currentTime: number = 0;
    private dayDuration: number = 60000; // 1 minute = 1 jour complet
    private isNight: boolean = false;

    constructor(scene: Game) {
        this.scene = scene;
        this.startDayNightCycle();
    }

    addShadow(shadow: AdvancedTreeShadow) {
        this.shadows.push(shadow);
    }

    removeShadow(shadow: AdvancedTreeShadow) {
        const index = this.shadows.indexOf(shadow);
        if (index > -1) {
            this.shadows.splice(index, 1);
        }
    }

    private startDayNightCycle() {
        // Timer pour le cycle jour/nuit
        this.scene.time.addEvent({
            delay: 100, // Mise à jour toutes les 100ms
            callback: this.updateDayNightCycle,
            callbackScope: this,
            loop: true,
        });
    }

    private updateDayNightCycle() {
        this.currentTime += 100;

        // Calculer la progression du jour (0 = minuit, 0.5 = midi, 1 = minuit)
        const dayProgress =
            (this.currentTime % this.dayDuration) / this.dayDuration;

        // Calculer l'angle du soleil (0° = est, 90° = sud, 180° = ouest, 270° = nord)
        const sunAngle = dayProgress * 360;

        // Calculer la hauteur du soleil (0 = horizon, 1 = zénith)
        const sunHeight = Math.sin(dayProgress * Math.PI);

        // Déterminer si c'est la nuit
        const wasNight = this.isNight;
        this.isNight = sunHeight < 0.1;

        // Mettre à jour toutes les ombres
        this.shadows.forEach((shadow) => {
            shadow.setSunPosition(sunAngle, Math.max(0.1, sunHeight));

            // Changer le mode nuit si nécessaire
            if (wasNight !== this.isNight) {
                shadow.setNightMode(this.isNight);
            }
        });
    }

    // Méthode pour forcer un moment de la journée
    setTimeOfDay(progress: number) {
        this.currentTime = progress * this.dayDuration;
        this.updateDayNightCycle();
    }

    // Méthode pour accélérer le cycle jour/nuit
    setDayDuration(duration: number) {
        this.dayDuration = duration;
    }

    // Méthode pour obtenir l'heure actuelle (0-24)
    getCurrentHour(): number {
        const dayProgress =
            (this.currentTime % this.dayDuration) / this.dayDuration;
        return dayProgress * 24;
    }

    // Méthode pour obtenir si c'est la nuit
    isNightTime(): boolean {
        return this.isNight;
    }

    // Méthode pour créer un effet de tempête (ombres plus sombres et mouvement)
    setStormMode(enabled: boolean) {
        this.shadows.forEach((shadow) => {
            if (enabled) {
                // Mode tempête : ombres plus sombres et mouvement aléatoire
                shadow.setNightMode(true);
            } else {
                // Retour au mode normal
                shadow.setNightMode(false);
            }
        });
    }
}
