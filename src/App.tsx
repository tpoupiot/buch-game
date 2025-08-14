import { useRef, useState } from "react";
import { IRefPhaserGame, PhaserGame } from "./PhaserGame";

function App() {
    const phaserRef = useRef<IRefPhaserGame | null>(null);
    const [gameStarted, setGameStarted] = useState(false);

    const currentScene = (scene: Phaser.Scene) => {};

    return (
        <div id="app">
            {/* <PhaserGame ref={phaserRef} currentActiveScene={currentScene} /> */}
            {gameStarted ? (
                <PhaserGame ref={phaserRef} currentActiveScene={currentScene} />
            ) : (
                <div className="menu">
                    <div className="title">
                        <h1>Buchgame</h1>
                        <p>v0.0.2</p>
                    </div>
                    <div className="button">
                        <button
                            onClick={() => {
                                setGameStarted(true);
                            }}
                        >
                            Jouer
                        </button>
                        <div className="shadow"></div>
                    </div>
                    <div className="controls-info">
                        <details>
                            <summary>Contrôles du jeu</summary>
                            <ul>
                                <li>
                                    <strong>Z</strong> - Déplacement vers le
                                    haut
                                </li>
                                <li>
                                    <strong>Q</strong> - Déplacement vers la
                                    gauche
                                </li>
                                <li>
                                    <strong>S</strong> - Déplacement vers le bas
                                </li>
                                <li>
                                    <strong>D</strong> - Déplacement vers la
                                    droite
                                </li>
                                <li>
                                    <strong>Espace</strong> - Action / Couper
                                    l'arbre le plus proche
                                </li>
                                <li>
                                    <strong>A</strong> - Afficher le rayon
                                    d'action
                                </li>
                                <li>
                                    <strong>E</strong> - Lancer l'épée vers le
                                    curseur
                                </li>
                            </ul>
                        </details>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;
