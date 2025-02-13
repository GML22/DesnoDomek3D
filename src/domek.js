// Definiujemy canvas i silnik
const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);

// Definiujemy zmienne globalne
let isRotating = true;
let loadedMeshes = [];
let loadedMeshes1 = [];
let loadedMeshes2 = [];
let transformNode;

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
                mesh1.position.x = -61.5;
                mesh1.position.z = 129.75;

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
    updateCameraZoom(); // Aktualizacja zoomu kamery
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