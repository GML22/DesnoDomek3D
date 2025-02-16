// Definiujemy canvas i silnik
const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);

// Definiujemy zmienne globalne
let isRotating = true;
let loadedMeshes = [];
let loadedMeshes1 = [];
let loadedMeshes2 = [];
let transformNode;
let skybox; // Dodajemy zmienną dla skybox

// Główna funkcja tworząca scenę
const createScene = function (){

    // Definiujemy obiekt sceny
    const scene = new BABYLON.Scene(engine);

    // Ustawiamy kolor tła
    scene.clearColor = new BABYLON.Color4(0.2, 0.2, 0.2, 1);

    // Ustawiamy kamerę
    const camera = new BABYLON.ArcRotateCamera("camera",
    Math.PI / 2, Math.PI / 3, 10, BABYLON.Vector3.Zero(), scene);

    // Definiujemy czułość przesuwania się po obiekcie i zoomowania,
    // im mniejsza wartość tym większa czułość
    camera.panningSensibility = 50;
    camera.wheelPrecision = 1;

    // Pozwól na używanie prawego przycisku myszy
    camera.attachControl(canvas, true);
    
    // Ustawiamy kamerę na scenie
    function updateCameraZoom() {
        if (window.innerWidth > window.innerHeight){

            // Dopasowanie kamery
            camera.radius = 300;

        } else{

            // Dopasowanie kamery
            camera.radius = 550;
        }
    };

    // Funkcja uruchamiająca rotację
    const startAutoRotation = () => {
        const camera = scene.activeCamera;
        const initCS = {alpha: camera.alpha, beta: camera.beta,
            radius: camera.radius};

        // Obserwator zmian kamery
        const observer = camera.onViewMatrixChangedObservable.add(() => {
            if (Math.abs(camera.alpha - initCS.alpha) > 0.001 ||
                Math.abs(camera.beta - initCS.beta) > 0.001 ||
                Math.abs(camera.radius - initCS.radius) > 0.001) {
                isRotating = false;
                camera.onViewMatrixChangedObservable.remove(observer);
            }
        });

        // Animacja grupowa
        scene.registerBeforeRender(() => {
            if (isRotating && transformNode) {
                transformNode.rotate(
                    BABYLON.Axis.Y,
                    0.01 * scene.getAnimationRatio(),
                    BABYLON.Space.WORLD
                );
            }
        });
    };

    // Funkcj inicjująca grupową transformację
    const initGroupRotation = () => {

        // Tworzymy wspólny węzeł rodzicielski
        transformNode = new BABYLON.TransformNode("groupParent");
        
        // Podłączamy wszystkie meshe do wspólnego rodzica
        [...loadedMeshes, ...loadedMeshes1, ...loadedMeshes2].forEach(
            mesh => {mesh.parent = transformNode;});
    };

    // Funkcja inicjująca rotację wszystkich modeli
    const initialize = async () => {
        await Promise.all([
            loadFirstModel(),
            loadSecondModel(),
            loadThirdModel()
        ]);
        
        // Inicjujemy wspólną rotację wszystkich modeli
        initGroupRotation();
        startAutoRotation();
    };

    // Funkcja wczytująca plik STL parteru
    const loadFirstModel = () => {
        return new Promise((resolve) => {
            BABYLON.SceneLoader.ImportMesh("", "models/",
                    "Domek - Parter.stl", scene, function (meshes){
                
                // Definiujemy mesh
                let mesh = meshes[0];
                loadedMeshes = meshes;

                // Ustalamy pozycję obiektu na płaszczyźnie
                mesh.position.y = 0;
                mesh.position.x = -90;
                mesh.position.z = -90;

                // Materiał - biały na zewnątrz
                let material = new BABYLON.StandardMaterial(
                    "whiteMaterial", scene);
                
                // Ustawiamy kolor na pełną biel
                material.emissiveColor = new BABYLON.Color3(1, 1, 1);
                
                // Wyłączamy oświetlenie
                material.disableLighting = true; 
                
                // Ustawiamy finalny materiał
                mesh.material = material;

                //Podkreślenie krawędzi
                mesh.enableEdgesRendering();

                // Grubość linii krawędzi
                mesh.edgesWidth = 50;

                // Czarny kolor krawędzi
                mesh.edgesColor = new BABYLON.Color4(0, 0, 0, 1);
                resolve();
            });
        });
    };

    // Funkcja wczytująca plik STL stropu
    const loadSecondModel = () => {
        return new Promise((resolve) => {
            BABYLON.SceneLoader.ImportMesh("", "models/",
                    "Domek - Strop.stl", scene, function (meshes1){
                
                // Definiujemy mesh
                let mesh1 = meshes1[0];
                loadedMeshes1 = meshes1;
                
                // Ustalamy pozycję obiektu na płaszczyźnie
                mesh1.position.y = 25.5;
                mesh1.position.x = -72;
                mesh1.position.z = 127;

                // Materiał - biały na zewnątrz
                let material1 = new BABYLON.StandardMaterial(
                    "whiteMaterial", scene);
                
                // Ustawiamy kolor na pełną biel
                material1.emissiveColor = new BABYLON.Color3(1, 1, 1);
                
                // Wyłączamy oświetlenie
                material1.disableLighting = true; 
                
                // Ustawiamy finalny materiał
                mesh1.material = material1;

                //Podkreślenie krawędzi
                mesh1.enableEdgesRendering();

                // Grubość linii krawędzi
                mesh1.edgesWidth = 50;

                // Czarny kolor krawędzi
                mesh1.edgesColor = new BABYLON.Color4(0, 0, 0, 1);

                // Zwracamy obietnicę
                resolve();
            });
        });
    };

    // Funkcja wczytująca plik STL dachu
    const loadThirdModel = () => {
        return new Promise((resolve) => {
            BABYLON.SceneLoader.ImportMesh("", "models/",
                    "Domek - Dach.stl", scene, function (meshes2){
                
                // Definiujemy mesh
                let mesh2 = meshes2[0];
                loadedMeshes2 = meshes2;

                // Ustalamy pozycję obiektu na płaszczyźnie
                mesh2.position.y = 25;
                mesh2.position.x = -306;
                mesh2.position.z = -86.5;

                // Materiał - biały na zewnątrz
                let material2 = new BABYLON.StandardMaterial(
                    "whiteMaterial", scene);
                
                // Ustawiamy kolor na pełną biel
                material2.emissiveColor = new BABYLON.Color3(0, 0, 0);
                
                // Wyłączamy oświetlenie
                material2.disableLighting = true; 
                
                // Ustawiamy finalny materiał
                mesh2.material = material2;

                //Podkreślenie krawędzi
                mesh2.enableEdgesRendering();

                // Grubość linii krawędzi
                mesh2.edgesWidth = 50;

                // Czarny kolor krawędzi
                mesh2.edgesColor = new BABYLON.Color4(1, 1, 1, 1);
                resolve();
            });
        });
    };

    // Dodajemy nową kamerę UniversalCamera
    const walkCamera = new BABYLON.UniversalCamera("walkCamera",
        new BABYLON.Vector3(160, 18, 7), scene);
    walkCamera.attachControl(canvas, true, false);
    walkCamera.speed = 0.5;
    
    // Ustawienia czułości kamery na urządzeniu mobilnym (Zmniejsz wartość,
    // aby zwiększyć czułość)
    walkCamera.inputs.attached.touch.touchAngularSensibility = 10000;
    
    // Sprawdzamy, czy urządzenie jest mobilne
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    // Ustawiamy prędkość kamery na urządzeniu mobilnym
    if (isMobile) {
        walkCamera.speed = 1.0;
        
    } else {
        walkCamera.speed = 0.5;
    }

    // Dodajemy kontrolki poruszania się
    walkCamera.keysUp.push(87);
    walkCamera.keysDown.push(83);
    walkCamera.keysLeft.push(65);
    walkCamera.keysRight.push(68);

    // Ustawienie tła 360° za pomocą PhotoDome
    //new BABYLON.PhotoDome(
    //    "skyDome",
    //    "imgs/Desno.jpg", {
    //        resolution: 32,
    //        size: 2000 // Rozmiar sfery (im większy, tym bardziej panoramiczne tło)
    //    },
    //    scene
    //);

    // Funkcja blokująca pozycję y kamery
    const lockCameraYPosition = (camera, fixedY) => {
        camera.onAfterCheckInputsObservable.add(() => {
            camera.position.y = fixedY;
        });
    };

    // Dodajemy przycisk do rozpoczęcia wirtualnego spaceru
    walkButton.addEventListener('click', () => {

        // Pobieramy zoomControls
        var zoomControls = document.querySelector('.zoom-controls');

        // Sprawdzamy, czy przycisk ma tekst 'Rozpocznij wirtualny spacer'
        if (walkButton.textContent === 'Rozpocznij wirtualny spacer') {
            walkButton.textContent = 'Wróć do ogólnej kamery';

            // Wyłączamy zoomControls
            if (zoomControls) {
                zoomControls.style.opacity = '0';
                zoomControls.style.display = 'none';
            }
            
            // Sprawdzamy, czy kamera jest typu ArcRotateCamera
            if (scene.activeCamera instanceof BABYLON.ArcRotateCamera) {
                scene.activeCamera.detachControl(canvas);
                scene.activeCamera = walkCamera;
                walkCamera.attachControl(canvas, true);
                isRotating = false;

                // Resetowanie pozycji i rotacji walkCamera
                walkCamera.position = new BABYLON.Vector3(160, 18, 7);
                walkCamera.rotation = new BABYLON.Vector3(0, -Math.PI / 2, 0);

                // Obliczenie bounding box dla wszystkich meshów
                let minY = Infinity;
                let maxY = -Infinity;
                transformNode.getChildMeshes().forEach(mesh => {
                    const boundingInfo = mesh.getBoundingInfo();
                    minY = Math.min(minY,
                        boundingInfo.boundingBox.minimumWorld.y);
                    maxY = Math.max(maxY,
                        boundingInfo.boundingBox.maximumWorld.y);
                });

                // Blokujemy pozycję y kamery
                lockCameraYPosition(walkCamera, walkCamera.position.y);

                // Włączamy skybox
                skybox.setEnabled(true);

                // Przeniesienie fokusu na element canvas
                canvas.focus();
            }
        } else{
            
            // Zmiana tekstu przycisku
            walkButton.textContent = 'Rozpocznij wirtualny spacer';
            
            // Sprawdzamy, czy kamera jest typu UniversalCamera
            if (scene.activeCamera instanceof BABYLON.UniversalCamera){
                scene.activeCamera.detachControl(canvas);
                scene.activeCamera = camera;
                camera.attachControl(canvas, true);

                // Wyłączamy skybox
                skybox.setEnabled(false);

                // Przeniesienie fokusu na element canvas
                canvas.focus();
            }

            // Włączamy zoomControls
            if (zoomControls) {
                zoomControls.style.opacity = '100';
                zoomControls.style.display = 'block';
            }
        }
    });

    // Inicjujemy rotacje
    initialize();

    // Updatujemy zoom kamery
    updateCameraZoom();

    // Zwracamy gotową scenę
    return scene;
};

// Renderujemy scenę
const scene = createScene();
engine.runRenderLoop(() => scene.render());

// Nasłuchuj zmian rozmiaru okna i aktualizuj kamerę oraz silnik
window.addEventListener("resize", () => {
    engine.resize();  // Dopasowanie silnika Babylon do nowego rozmiaru
});

// Inicjalizacja przycisku dla Parteru
const toggleButton = document.getElementById('toggleButton');
toggleButton.addEventListener('click', () => {

    if (loadedMeshes.length > 0){
        const isVisible = !loadedMeshes[0].isVisible;
        
        // Zmień widoczność wszystkich części modelu
        loadedMeshes.forEach(mesh => {
            mesh.isVisible = isVisible;
        });
    }

    // Przeniesienie fokusu na element canvas
    canvas.focus();
    
});

// Inicjalizacja przycisku dla stropu
const toggleButton1 = document.getElementById('toggleButton1');
toggleButton1.addEventListener('click', () => {

    if (loadedMeshes1.length > 0) {
        const isVisible1 = !loadedMeshes1[0].isVisible;
        
        // Zmień widoczność wszystkich części modelu
        loadedMeshes1.forEach(mesh1 => {
            mesh1.isVisible = isVisible1;
        });
    }

    // Przeniesienie fokusu na element canvas
    canvas.focus();
});

// Inicjalizacja przycisku dla dachu
const toggleButton2 = document.getElementById('toggleButton2');
toggleButton2.addEventListener('click', () => {

    if (loadedMeshes2.length > 0) {
        const isVisible2 = !loadedMeshes2[0].isVisible;
        
        // Zmień widoczność wszystkich części modelu
        loadedMeshes2.forEach(mesh2 => {
            mesh2.isVisible = isVisible2;
        });
    }

    // Przeniesienie fokusu na element canvas
    canvas.focus();
    
});

// Obsługa zoomu IN
const zoomSpeed = 0.2;

document.getElementById('zoomIn').addEventListener('click', () => {
    if (scene.activeCamera instanceof BABYLON.ArcRotateCamera) {
        scene.activeCamera.radius -= scene.activeCamera.radius *
            zoomSpeed;
    }
});

// Obsługa zoomu OUT
document.getElementById('zoomOut').addEventListener('click', () => {
    if (scene.activeCamera instanceof BABYLON.ArcRotateCamera) {
        scene.activeCamera.radius += scene.activeCamera.radius *
            zoomSpeed;
    }
});