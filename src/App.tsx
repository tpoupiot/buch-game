import { useRef, useState } from "react";
import { IRefPhaserGame, PhaserGame } from "./PhaserGame";

function ControlKey({
    keyName,
    description,
}: {
    keyName: string;
    description: string;
}) {
    return (
        <li className="mb-1.5 font-geist font-medium flex items-center gap-[3px]">
            <strong className="font-tiny5 font-medium text-white uppercase p-[4px_6px_4px_7px] border border-white leading-none">
                {keyName}
            </strong>
            - {description}
        </li>
    );
}

function ActionButton({
    onClick,
    text,
    color = "#ee6644",
}: {
    onClick: () => void;
    text: string;
    color?: string;
}) {
    return (
        <div className="flex w-full h-fit relative mb-4 group">
            <button
                onClick={onClick}
                style={{ backgroundColor: color }}
                className="w-full p-2.5 text-[#fff7ef] border-none cursor-pointer transition-all duration-200 font-tiny5 uppercase z-10 group-hover:translate-y-[5px]"
            >
                {text}
            </button>
            <div
                style={{ backgroundColor: color }}
                className="brightness-[0.85] w-full h-full absolute top-2.5 left-0 z-0"
            ></div>
        </div>
    );
}

function ItemSlot() {
    return <div className="w-[50px] h-[50px] bg-[#E5DED7]"></div>;
}

function App() {
    const phaserRef = useRef<IRefPhaserGame | null>(null);
    const [gameStarted, setGameStarted] = useState(false);
    const [isPlaying, setIsPlaying] = useState(true);

    const currentScene = (scene: Phaser.Scene) => {};

    return (
        <div className="w-screen h-screen box-border overflow-hidden bg-gradient-to-b from-[#fff7ef] from-60% to-[#ee6644] to-60% text-black animate-[fadeIn_2s_ease-in-out]">
            {gameStarted ? (
                <PhaserGame ref={phaserRef} currentActiveScene={currentScene} />
            ) : (
                <div className="p-3">
                    <div className="flex mb-5">
                        <h1 className="font-tiny5 font-medium text-6xl uppercase tracking-[-0.03em] m-0 leading-[0.64]">
                            Buchgame
                        </h1>
                        <p className="font-geist font-medium text-lg m-0 leading-[0.8]">
                            v0.0.3
                        </p>
                    </div>

                    <div className="grid gap-3 mb-5 [grid-template-columns:repeat(2,430px)]">
                        <div className="bg-[#FAF2EB] p-2.5 flex flex-col gap-4">
                            <div className="">
                                <div className="w-full flex justify-between relative">
                                    <div className="flex flex-col items-center gap-2.5">
                                        <ItemSlot /> <ItemSlot /> <ItemSlot />
                                    </div>
                                    <div
                                        className={`object-contain w-[100px] h-[100px] m-2.5 [image-rendering:pixelated] self-center ${
                                            isPlaying &&
                                            "animation-character-walk"
                                        } character-walk`}
                                        draggable="false"
                                    />
                                    <button
                                        className="absolute right-[60px] w-[30px] h-[30px] bg-[#E5DED7] text-black/87 border-none cursor-pointer font-tiny5 uppercase z-10 hover:brightness-[0.85]"
                                        onClick={() =>
                                            setIsPlaying((prev) => !prev)
                                        }
                                    >
                                        {isPlaying ? "||" : ">"}
                                    </button>

                                    <div className="flex flex-col items-center gap-2.5">
                                        <ItemSlot />
                                        <ItemSlot />
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <div className="w-full">
                                    <div className="flex justify-between">
                                        <span className="font-tiny5 font-medium">
                                            VIE
                                        </span>
                                        <span className="font-tiny5 font-medium">
                                            100
                                        </span>
                                    </div>
                                    <div className="w-full h-[10px] bg-[#E5DED7] overflow-hidden">
                                        <div
                                            className="h-full bg-[#45c373] transition-all duration-500 ease-in-out"
                                            style={{ width: "100%" }}
                                        ></div>
                                    </div>
                                </div>
                                <div className="w-full">
                                    <div className="flex justify-between">
                                        <span className="font-tiny5 font-medium">
                                            LVL
                                        </span>
                                        <span className="font-tiny5 font-medium">
                                            1
                                        </span>
                                    </div>
                                    <div className="w-full h-[10px] bg-[#E5DED7] overflow-hidden">
                                        <div
                                            className="h-full bg-[#EE6644] transition-all duration-500 ease-in-out"
                                            style={{ width: "0%" }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <span className="font-tiny5 font-medium">
                                    INVENTAIRE
                                </span>
                                <div className="grid grid-cols-7 gap-2.5 w-fit">
                                    <ItemSlot /> <ItemSlot /> <ItemSlot />
                                    <ItemSlot /> <ItemSlot /> <ItemSlot />
                                    <ItemSlot /> <ItemSlot /> <ItemSlot />
                                    <ItemSlot /> <ItemSlot /> <ItemSlot />
                                    <ItemSlot /> <ItemSlot /> <ItemSlot />
                                    <ItemSlot /> <ItemSlot /> <ItemSlot />
                                    <ItemSlot /> <ItemSlot /> <ItemSlot />
                                </div>
                            </div>
                        </div>
                        <div>
                            <ActionButton
                                onClick={() => setGameStarted(true)}
                                text="Jouer"
                            />
                            <ActionButton
                                onClick={() => {}}
                                text="Paramètres"
                                color="#888888"
                            />
                        </div>
                    </div>

                    <div></div>

                    <div className="absolute top-[calc(60%+20px)] left-5 text-white/87 text-sm font-geist">
                        <details className="group">
                            <summary className="cursor-pointer font-medium text-white mb-5 font-tiny5 uppercase marker:content-['+_'] group-open:marker:content-['-_']">
                                Contrôles du jeu
                            </summary>
                            <ul className="m-0 pl-5 list-none">
                                <ControlKey
                                    keyName="Z"
                                    description="Déplacement vers le haut"
                                />
                                <ControlKey
                                    keyName="Q"
                                    description="Déplacement vers la gauche"
                                />
                                <ControlKey
                                    keyName="S"
                                    description="Déplacement vers le bas"
                                />
                                <ControlKey
                                    keyName="D"
                                    description="Déplacement vers la droite"
                                />
                                <ControlKey
                                    keyName="Espace"
                                    description="Action / Couper l'arbre le plus proche"
                                />
                                <ControlKey
                                    keyName="A"
                                    description="Afficher le rayon d'action"
                                />
                                <ControlKey
                                    keyName="E"
                                    description="Lancer l'épée vers le curseur"
                                />
                            </ul>
                        </details>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;
