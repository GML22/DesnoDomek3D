// Definiujemy zmienne globalne
let isRotating = true;
let loadedMeshes = [];
let loadedMeshes1 = [];
let loadedMeshes2 = [];
let transformNode;
let walkLoadedMeshes = [];
let walkLoadedMeshes1 = [];
let walkLoadedMeshes2 = [];
let walkTransformNode;
let activeTab = 'standard';
let buttons_states = [false, false, false];
let walk_buttons_states = [false, false, false];
let userStoppedRotation = false;

// Definiujemy canvas i silnik
const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);

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

     // Dodajemy nową kamerę UniversalCamera
     const walkCamera = new BABYLON.UniversalCamera("walkCamera",
        new BABYLON.Vector3(200, -13, 150), scene);
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

    // Ustawienie rotacji kamery walkCamera o 180 stopni wokół osi Y
    walkCamera.rotation.y = -Math.PI / 1.6;

    // Ustawienie rotacji kamery walkCamera, aby patrzyła bardziej w górę
    walkCamera.rotation.x = -Math.PI / 20;

    // Dodajemy kontrolki poruszania się
    walkCamera.keysUp.push(87);
    walkCamera.keysDown.push(83);
    walkCamera.keysLeft.push(65);
    walkCamera.keysRight.push(68);

    // Ustawienie tła 360° za pomocą PhotoDome
    const photodome = new BABYLON.PhotoDome(
        "skyDome",
        "imgs/Desno.jpg", {
            resolution: 32,
            size: 5000
        },
        scene
    );

    // Domyślnie wyłączamy PhotoDome
    photodome.setEnabled(false);
    
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
        const act_camera = scene.activeCamera;
        const initCS = {alpha: act_camera.alpha, beta: act_camera.beta,
            radius: act_camera.radius};

        // Obserwator zmian kamery
        const observer = act_camera.onViewMatrixChangedObservable.add(() => {
            if (Math.abs(act_camera.alpha - initCS.alpha) > 0.001 ||
                Math.abs(act_camera.beta - initCS.beta) > 0.001 ||
                Math.abs(act_camera.radius - initCS.radius) > 0.001) {
                isRotating = false;
                userStoppedRotation = true;
                act_camera.onViewMatrixChangedObservable.remove(observer);
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

    // Funkcja wczytująca plik STL parteru
    const loadFirstModel = (camera_type, pos_y) => {
        return new Promise((resolve) => {
            BABYLON.SceneLoader.ImportMesh("", "models/",
                    "Domek - Parter.stl", scene, function (meshes){
                
                // Definiujemy mesh
                let mesh = meshes[0];
                
                // Wywołujemy odpowiedni rodzaj zmiennej w zależnosci od
                // kamery
                if (camera_type === 'walk'){
                    walkLoadedMeshes = meshes;
                }else{
                    loadedMeshes = meshes;
                }

                // Ustalamy pozycję obiektu na płaszczyźnie
                mesh.position.y = pos_y - 20;
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
    const loadSecondModel = (camera_type, pos_y) => {
        return new Promise((resolve) => {
            BABYLON.SceneLoader.ImportMesh("", "models/",
                    "Domek - Strop.stl", scene, function (meshes1){
                
                // Definiujemy mesh
                let mesh1 = meshes1[0];
                
                // Wywołujemy odpowiedni rodzaj zmiennej w zależnosci od
                // kamery
                if (camera_type === 'walk'){
                    walkLoadedMeshes1 = meshes1;
                }else{
                    loadedMeshes1 = meshes1;
                }
                
                // Ustalamy pozycję obiektu na płaszczyźnie
                mesh1.position.y = pos_y - 20;
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
    const loadThirdModel = (camera_type, pos_y) => {
        return new Promise((resolve) => {
            BABYLON.SceneLoader.ImportMesh("", "models/",
                    "Domek - Dach.stl", scene, function (meshes2){
                
                // Definiujemy mesh
                let mesh2 = meshes2[0];
                
                // Wywołujemy odpowiedni rodzaj zmiennej w zależnosci od
                // kamery
                if (camera_type === 'walk'){
                    walkLoadedMeshes2 = meshes2;

                }else{
                    loadedMeshes2 = meshes2;
                }

                // Ustalamy pozycję obiektu na płaszczyźnie
                mesh2.position.y = pos_y - 20;
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

    // Funkcja blokująca pozycję y kamery
    const lockCameraYPosition = (camera, fixedY) => {
        camera.onAfterCheckInputsObservable.add(() => {
            camera.position.y = fixedY;
        });
    };

    // Funkcja przełączająca zakładki
    const switchTab = (tabName) => {

        // Zmieniamy klasy zakładek
        document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.remove('active');
        });

        // Dodajemy klasę aktywnej zakładki
        document.getElementById(`tab${tabName.charAt(0).toUpperCase() +
            tabName.slice(1)}`).classList.add('active');
        
        // Zmieniamy kamery w zależności od wybranej zakładki
        if (tabName === 'standard') {
            // Aktywuj standardową kamerę
            if (scene.activeCamera instanceof BABYLON.UniversalCamera) {
                scene.activeCamera.detachControl(canvas);
                scene.activeCamera = camera;
                camera.attachControl(canvas, true);
            }

            // Wyłącz PhotoDome
            photodome.setEnabled(false);

            // Zmieniamy nazwę aktywnej zakładki
            activeTab = 'standard';

            // Włącz rotację, jeśli nie została zatrzymana przez użytkownika
            if (!userStoppedRotation) {
                isRotating = true;
            }

            // Wyłącz modele walkCamera
            if (walkTransformNode) {
                walkTransformNode.setEnabled(false);
            }

            // Włącz modele standardowe
            if (transformNode) {
                transformNode.setEnabled(true);
            }

            // Zmień stan checkboxów toggle1, toggle2, toggle3 w zależności od
            // stanu przycisków buttons_states
            for (let i = 0; i < buttons_states.length; i++) {
                const toggle = document.getElementById(`toggle${i+1}`);
                if (buttons_states[i]) {
                    toggle.checked = true;
                } else {
                    toggle.checked = false;
                }
            }

        // Jeśli wybrano zakładkę walk
        } else if (tabName === 'walk') {

            // Aktywuj kamerę walkCamera
            if (scene.activeCamera instanceof BABYLON.ArcRotateCamera) {
                scene.activeCamera.detachControl(canvas);
                scene.activeCamera = walkCamera;
                walkCamera.attachControl(canvas, true);
            }

            // Blokujemy pozycję y kamery
            lockCameraYPosition(walkCamera, walkCamera.position.y);

            // Włącz PhotoDome
            photodome.setEnabled(true);

            // Zmieniamy nazwę aktywnej zakładki
            activeTab = 'walk';

            // Wyłącz rotację
            isRotating = false;

            // Wyłącz modele standardowe
            if (transformNode) {
                transformNode.setEnabled(false);
            }

            // Włącz modele walkCamera
            if (walkTransformNode) {
                walkTransformNode.setEnabled(true);
            } else {
                // Inicjujemy rotację modeli dla walkCamera, jeśli jeszcze
                // nie zostały wczytane
                initializeWalk();
            }

            // Zmień stan checkboxów toggle1, toggle2, toggle3 w zależności od
            // stanu przycisków walk_buttons_states
            for (let i = 0; i < walk_buttons_states.length; i++) {
                const toggle = document.getElementById(`toggle${i+1}`);
                if (walk_buttons_states[i]) {
                    toggle.checked = true;
                } else {
                    toggle.checked = false;
                }
            }
        }

        // Przeniesienie fokusu na element canvas
        canvas.focus();
    };

    // Funkcja inicjująca rotację wszystkich modeli dla standardowej kamery
    const initialize = async () => {
        await Promise.all([
            loadFirstModel("standard", 0),
            loadSecondModel("standard", 25.5),
            loadThirdModel("standard", 25)
        ]);
        
        // Inicjujemy wspólną rotację wszystkich modeli
        initGroup();
        startAutoRotation();
    };

    // Funkcja inicjująca rotację wszystkich modeli dla walkCamera
    const initializeWalk = async () => {
        await Promise.all([
            loadFirstModel("walk", -10),
            loadSecondModel("walk", 15.5),
            loadThirdModel("walk", 15)
        ]);

        // Inicjujemy wspólną rotację wszystkich modeli
        initWalkGroup();
    };

    // Dodajemy nasłuchiwanie na zakładki
    document.getElementById('tabStandard').addEventListener(
        'click', () => switchTab('standard'));
    document.getElementById('tabWalk').addEventListener(
        'click', () => switchTab('walk'));

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

    // Dopasowanie silnika Babylon do nowego rozmiaru
    engine.resize();  
});

// Funkcj inicjująca grupową transformację
const initGroup = () => {

    // Tworzymy wspólny węzeł rodzicielski
    transformNode = new BABYLON.TransformNode("groupParent");
    
    // Podłączamy wszystkie meshe do wspólnego rodzica
    [...loadedMeshes, ...loadedMeshes1, ...loadedMeshes2].forEach(
        mesh => {mesh.parent = transformNode;});
};

// Funkcja inicjująca grupową transformację dla walkCamera
const initWalkGroup = () => {

    // Tworzymy wspólny węzeł rodzicielski
    walkTransformNode = new BABYLON.TransformNode("walkGroupParent");

    // Podłączamy wszystkie meshe do wspólnego rodzica
    [...walkLoadedMeshes, ...walkLoadedMeshes1,
        ...walkLoadedMeshes2].forEach(mesh => {
            mesh.parent = walkTransformNode;});
    
    // Obróć obiekt o 30 stopni wokół osi Y
    walkTransformNode.rotation.y = BABYLON.Tools.ToRadians(15);
};

// Inicjalizacja przycisku dla Parteru
const toggleButton = document.getElementById('toggleButton');
toggleButton.addEventListener('click', () => {

    if (loadedMeshes.length > 0  && activeTab === 'standard'){
        const isVisible = !loadedMeshes[0].isVisible;
        
        // Zmień widoczność wszystkich części modelu
        loadedMeshes.forEach(mesh => {
            mesh.isVisible = isVisible;
        });

        // Zmieniamy stan przycisku
        buttons_states[2] = !buttons_states[2];
    }

    if (walkLoadedMeshes.length > 0 && activeTab === 'walk') {
        const isVisible2 = !walkLoadedMeshes[0].isVisible;
        
        // Zmień widoczność wszystkich części modelu
        walkLoadedMeshes.forEach(mesh2 => {
            mesh2.isVisible = isVisible2;
        });

        // Zmieniamy stan przycisku
        walk_buttons_states[2] = !walk_buttons_states[2];
    }

    // Przeniesienie fokusu na element canvas
    canvas.focus();
    
});

// Inicjalizacja przycisku dla stropu
const toggleButton1 = document.getElementById('toggleButton1');
toggleButton1.addEventListener('click', () => {

    if (loadedMeshes1.length > 0  && activeTab === 'standard') {
        const isVisible1 = !loadedMeshes1[0].isVisible;
        
        // Zmień widoczność wszystkich części modelu
        loadedMeshes1.forEach(mesh1 => {
            mesh1.isVisible = isVisible1;
        });

        // Zmieniamy stan przycisku
        buttons_states[1] = !buttons_states[1];
    }

    if (walkLoadedMeshes1.length > 0 && activeTab === 'walk') {
        const isVisible2 = !walkLoadedMeshes1[0].isVisible;
        
        // Zmień widoczność wszystkich części modelu
        walkLoadedMeshes1.forEach(mesh2 => {
            mesh2.isVisible = isVisible2;
        });

        // Zmieniamy stan przycisku
        walk_buttons_states[1] = !walk_buttons_states[1];
    }

    // Przeniesienie fokusu na element canvas
    canvas.focus();
});

// Inicjalizacja przycisku dla dachu
const toggleButton2 = document.getElementById('toggleButton2');
toggleButton2.addEventListener('click', () => {

    if (loadedMeshes2.length > 0 && activeTab === 'standard') {
        const isVisible2 = !loadedMeshes2[0].isVisible;
        
        // Zmień widoczność wszystkich części modelu
        loadedMeshes2.forEach(mesh2 => {
            mesh2.isVisible = isVisible2;
        });

        // Zmieniamy stan przycisku
        buttons_states[0] = !buttons_states[0];
    }

    if (walkLoadedMeshes2.length > 0 && activeTab === 'walk') {
        const isVisible2 = !walkLoadedMeshes2[0].isVisible;
        
        // Zmień widoczność wszystkich części modelu
        walkLoadedMeshes2.forEach(mesh2 => {
            mesh2.isVisible = isVisible2;
        });

        // Zmieniamy stan przycisku
        walk_buttons_states[0] = !walk_buttons_states[0];
    }

    // Przeniesienie fokusu na element canvas
    canvas.focus();
});