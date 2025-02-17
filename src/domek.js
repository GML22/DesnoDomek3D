// Definiujemy zmienne globalne grupujące wczytane meshe
let transformNode;
let walkTransformNode;

// Definiujemy zmienną globalną, która będzie przechowywać informację o tym,
// czy rotacja jest włączona
let isRotating = true;

// Definiujemy zmienne globalne, które będą przechowywaźć wczytane meshe
// dla kamery standardowej
let loadedMeshes = [];
let loadedMeshes1 = [];
let loadedMeshes2 = [];

// Definiujemy zmienne globalne, które będą przechowywaźć wczytane meshe
// dla kamery walk
let walkLoadedMeshes = [];
let walkLoadedMeshes1 = [];
let walkLoadedMeshes2 = [];

// Definiujemy zmienną globalną, która będzie przechowywać informację o tym,
// która zakładka jest aktywna
let activeTab = 'standard';

// Definiujemy zmienną globalną, która będzie przechowywać informację o tym,
// czy użytkownik zatrzymał rotację
let userStoppedRotation = false;

// Definiujemy tablice przechowujące stany przycisków
let buttons_states = [false, false, false];
let walk_buttons_states = [false, false, false];

// Definiujemy canvas
const canvas = document.getElementById("renderCanvas");

// Tworzymy silnik
const engine = new BABYLON.Engine(canvas, true);

// Główna funkcja tworząca scenę
const createScene = function (){

    // Definiujemy obiekt sceny
    const scene = new BABYLON.Scene(engine);

    // Ustawiamy kolor tła
    scene.clearColor = new BABYLON.Color4(0.2, 0.2, 0.2, 1);

    // Ustawiamy kamerę
    const camera = new BABYLON.ArcRotateCamera("camera", Math.PI / 2,
        Math.PI / 3, 10, BABYLON.Vector3.Zero(), scene);

    // Definiujemy czułość przesuwania się po obiekcie, im mniejsza wartość
    // tym większa czułość
    camera.panningSensibility = 50;

    // Ustawiamy precyzję zoomowania, im mniejsza wartość tym większa precyzja
    camera.wheelPrecision = 1;

    // Pozwól na używanie prawego przycisku myszy
    camera.attachControl(canvas, true);

     // Dodajemy nową kamerę UniversalCamera
     const walkCamera = new BABYLON.UniversalCamera("walkCamera",
        new BABYLON.Vector3(200, -13, 150), scene);
    
    // Ustawienia czułości kamery na urządzeniu mobilnym (Zmniejsz wartość,
    // aby zwiększyć czułość)
    walkCamera.inputs.attached.touch.touchAngularSensibility = 10000;
    
    // Sprawdzamy, czy urządzenie jest mobilne
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    // Ustawiamy prędkość kamery na urządzeniu mobilnym
    if (isMobile){

        // Ustawiamy prędkość kamery na urządzeniu mobilnym
        walkCamera.speed = 1.0;
        
    } else{
        
        // Ustawiamy prędkość kamery na urządzeniu stacjonarnym
        walkCamera.speed = 0.5;
    }

    // Ustawienie rotacji kamery walkCamera o 180 stopni wokół osi Y
    walkCamera.rotation.y = -Math.PI / 1.6;

    // Ustawienie rotacji kamery walkCamera, aby patrzyła bardziej w górę
    walkCamera.rotation.x = -Math.PI / 20;

    // Dodajemy kontrolki poruszania się
    walkCamera.keysUp.push(87); // W
    walkCamera.keysDown.push(83); // S
    walkCamera.keysLeft.push(65); // A
    walkCamera.keysRight.push(68); // D

    // Ustawienie tła 360° za pomocą PhotoDome
    const photodome = new BABYLON.PhotoDome("skyDome", "imgs/Desno.jpg",
        {resolution: 32,size: 5000}, scene);

    // Domyślnie wyłączamy PhotoDome
    photodome.setEnabled(false);
    
    // Ustawiamy kamerę na scenie
    function updateCameraZoom(){

        // Sprawdzamy, czy okno jest szersze niż wyższe
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

        // Zapisujemy początkowe wartości kątów kamery
        const act_camera = scene.activeCamera;

        // Zapisujemy początkowe wartości kątów kamery
        const initCS = {alpha: act_camera.alpha, beta: act_camera.beta,
            radius: act_camera.radius};

        // Obserwator zmian kamery
        const observer = act_camera.onViewMatrixChangedObservable.add(() => {

            // Sprawdzamy, czy kąty kamery się zmieniły
            if (Math.abs(act_camera.alpha - initCS.alpha) > 0.001 ||
                Math.abs(act_camera.beta - initCS.beta) > 0.001 ||
                Math.abs(act_camera.radius - initCS.radius) > 0.001){
                
                // Zatrzymujemy rotację
                isRotating = false;

                // Ustawiamy, że użytkownik zatrzymał rotację
                userStoppedRotation = true;

                /// Usuwamy obserwatora
                act_camera.onViewMatrixChangedObservable.remove(observer);
            }
        });

        // Animacja grupowa
        scene.registerBeforeRender(() => {

            // Sprawdzamy, czy rotacja jest włączona
            if (isRotating && transformNode){

                // Obracamy węzeł transformNode
                transformNode.rotate(BABYLON.Axis.Y,
                    0.01 * scene.getAnimationRatio(), BABYLON.Space.WORLD);
            }
        });
    };

    // Funkcja wczytująca plik STL parteru
    const loadFirstModel = (camera_type, pos_y) => {

        // Zwracamy obietnicę
        return new Promise((resolve) => {
            
            // Wczytujemy plik STL
            BABYLON.SceneLoader.ImportMesh("", "models/", "Domek - Parter.stl",
                scene, function (meshes){
                
                // Definiujemy mesh
                let mesh = meshes[0];
                
                // Wywołujemy odpowiedni rodzaj zmiennej w zależnosci od
                // kamery
                if (camera_type === 'walk'){

                    // Przypisujemy do zmiennej walkLoadedMeshes
                    walkLoadedMeshes = meshes;
                }else{

                    // Przypisujemy do zmiennej loadedMeshes
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

                // Ustawiamy widoczność na false
                mesh.isVisible = false;
                
                // Zwracamy obietnicę
                resolve();
            });
        });
    };

    // Funkcja wczytująca plik STL stropu
    const loadSecondModel = (camera_type, pos_y) => {

        // Zwracamy obietnicę
        return new Promise((resolve) => {
            
            // Wczytujemy plik STL
            BABYLON.SceneLoader.ImportMesh("", "models/", "Domek - Strop.stl",
                scene, function (meshes1){
                
                // Definiujemy mesh
                let mesh1 = meshes1[0];
                
                // Wywołujemy odpowiedni rodzaj zmiennej w zależnosci od
                // kamery
                if (camera_type === 'walk'){

                    // Przypisujemy do zmiennej walkLoadedMeshes1
                    walkLoadedMeshes1 = meshes1;
                }else{

                    // Przypisujemy do zmiennej loadedMeshes1
                    loadedMeshes1 = meshes1;
                }
                
                // Ustalamy pozycję obiektu na płaszczyźnie
                mesh1.position.y = pos_y - 20;
                mesh1.position.x = -72;
                mesh1.position.z = 127;

                // Materiał - biały na zewnątrz
                let material1 = new BABYLON.StandardMaterial("whiteMaterial",
                    scene);
                
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

                // Ustawiamy widoczność na false
                mesh1.isVisible = false;

                // Zwracamy obietnicę
                resolve();
            });
        });
    };

    // Funkcja wczytująca plik STL dachu
    const loadThirdModel = (camera_type, pos_y) => {

        // Zwracamy obietnicę
        return new Promise((resolve) => {
            
            // Wczytujemy plik STL
            BABYLON.SceneLoader.ImportMesh("", "models/", "Domek - Dach.stl",
                scene, function (meshes2){
                
                // Definiujemy mesh
                let mesh2 = meshes2[0];
                
                // Wywołujemy odpowiedni rodzaj zmiennej w zależnosci od
                // kamery
                if (camera_type === 'walk'){

                    // Przypisujemy do zmiennej walkLoadedMeshes2
                    walkLoadedMeshes2 = meshes2;

                }else{

                    // Przypisujemy do zmiennej loadedMeshes2
                    loadedMeshes2 = meshes2;
                }

                // Ustalamy pozycję obiektu na płaszczyźnie
                mesh2.position.y = pos_y - 20;
                mesh2.position.x = -306;
                mesh2.position.z = -86.5;

                // Materiał - biały na zewnątrz
                let material2 = new BABYLON.StandardMaterial("whiteMaterial",
                    scene);
                
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

                // Ustawiamy widoczność na false
                mesh2.isVisible = false;
                
                // Zwracamy obietnicę
                resolve();
            });
        });
    };

    // Funkcja blokująca pozycję y kamery
    const lockCameraYPosition = (camera, fixedY) => {

        // Dodajemy nasłuchiwanie na kamerę
        camera.onAfterCheckInputsObservable.add(() => {
            
            //  Zablokuj pozycję y kamery
            camera.position.y = fixedY;
        });
    };

    // Funkcja przełączająca zakładki
    const switchTab = async (tabName) => {

        // Zmieniamy klasy zakładek
        document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.remove('active');
        });

        // Dodajemy klasę aktywnej zakładki
        document.getElementById(`tab${tabName.charAt(0).toUpperCase() +
            tabName.slice(1)}`).classList.add('active');
        
        // Zmieniamy kamery w zależności od wybranej zakładki
        if (tabName === 'standard'){

            // Aktywuj standardową kamerę
            if (scene.activeCamera instanceof BABYLON.UniversalCamera){
                
                // Aktywuj standardową kamerę
                scene.activeCamera.detachControl(canvas);
                scene.activeCamera = camera;
                camera.attachControl(canvas, true);
            }

            // Wyłącz PhotoDome
            photodome.setEnabled(false);

            // Zmieniamy nazwę aktywnej zakładki
            activeTab = 'standard';

            // Włącz rotację, jeśli nie została zatrzymana przez użytkownika
            if (!userStoppedRotation){

                // Włącz rotację
                isRotating = true;
            }

            // Wyłącz modele walkCamera
            if (walkTransformNode){

                // Wyłączamy modele walkCamera
                walkTransformNode.setEnabled(false);
            }

            // Włącz modele standardowe
            if (transformNode){

                // Włączamy modele standardowe
                transformNode.setEnabled(true);
            }

            // Zmień stan checkboxów toggle1, toggle2, toggle3 w zależności od
            // stanu przycisków buttons_states
            for (let i = 0; i < buttons_states.length; i++){

                // Pobierz odpowiedni przycisk toggle
                const toggle = document.getElementById(`toggle${i+1}`);

                // Jeśli przycisk jest włączony, ustaw stan na true,
                // w przeciwnym razie ustaw stan na false
                if (buttons_states[i]){

                    // Ustaw stan na true
                    toggle.checked = true;

                } else{

                    // Ustaw stan na false
                    toggle.checked = false;
                }
            }

        // Jeśli wybrano zakładkę walk
        } else if (tabName === 'walk'){

            // Wyłączamy rotację
            isRotating = false;

            // Wyłączamy modele standardowe
            if (transformNode){

                // Wyłączamy modele standardowe
                transformNode.setEnabled(false);
            }

            // Włączamy modele walkCamera
            if (walkTransformNode){

                // Włączamy modele walkCamera
                walkTransformNode.setEnabled(true);

            } else {

                // Inicjujemy grupę modeli dla walkCamera
                await initializeWalk();
            }

            // Aktywuj kamerę walkCamera
            if (scene.activeCamera instanceof BABYLON.ArcRotateCamera){

                // Aktywujemy kamerę walkCamera
                scene.activeCamera.detachControl(canvas);
                scene.activeCamera = walkCamera;
                walkCamera.attachControl(canvas, true);
            }

            // Włącz PhotoDome
            photodome.setEnabled(true);

            // Zmieniamy nazwę aktywnej zakładki
            activeTab = 'walk';

            // Zmień stan checkboxów toggle1, toggle2, toggle3 w zależności od
            // stanu przycisków walk_buttons_states
            for (let i = 0; i < walk_buttons_states.length; i++){

                // Pobieramy odpowiedni przycisk toggle
                const toggle = document.getElementById(`toggle${i+1}`);

                // Jeśli przycisk jest włączony, ustaw stan na true,
                if (walk_buttons_states[i]){

                    // Ustaw stan na true
                    toggle.checked = true;

                } else{
                    
                    // Ustaw stan na false
                    toggle.checked = false;
                }
            }
        }

        // Przeniesienie fokusu na element canvas
        canvas.focus();
    };

    // Funkcja inicjująca rotację wszystkich modeli dla standardowej kamery
    const initialize = async () => {

        // Wczytujemy wszystkie modele po kolei
        await Promise.all([loadFirstModel("standard", 0), loadSecondModel(
            "standard", 25.5),loadThirdModel("standard", 25)]);
        
        // Tworzymy wspólny węzeł rodzicielski
        transformNode = new BABYLON.TransformNode("groupParent");
        
        // Podłączamy wszystkie meshe do wspólnego rodzica
        [...loadedMeshes, ...loadedMeshes1, ...loadedMeshes2].forEach(
            mesh => {mesh.parent = transformNode;});

        // Ustawiamy widoczność na true
        transformNode.getChildren().forEach(mesh => {

            // Ustawiamy widoczność na true
            mesh.isVisible = true;
        });

        // Rozpocznij automatyczną rotację
        startAutoRotation();
    };

    // Funkcja inicjująca rotację wszystkich modeli dla walkCamera
    const initializeWalk = async () => {

        // Wczytujemy wszystkie modele po kolei
        await Promise.all([loadFirstModel("walk", -10), loadSecondModel(
            "walk", 15.5), loadThirdModel("walk", 15)]);

        // Tworzymy wspólny węzeł rodzicielski
        walkTransformNode = new BABYLON.TransformNode("walkGroupParent");

        // Podłączamy wszystkie meshe do wspólnego rodzica
        [...walkLoadedMeshes, ...walkLoadedMeshes1,
            ...walkLoadedMeshes2].forEach(mesh => {
                mesh.parent = walkTransformNode;});
        
        // Obróć obiekt o 30 stopni wokół osi Y
        walkTransformNode.rotation.y = BABYLON.Tools.ToRadians(15);

        // Ustawiamy widoczność na true
        walkTransformNode.getChildren().forEach(mesh => {

            // Ustawiamy widoczność na true
            mesh.isVisible = true;
        });
    };

    // Dodajemy nasłuchiwanie na zakładki standard
    document.getElementById('tabStandard').addEventListener('click',
        () => switchTab('standard'));

    // Dodajemy nasłuchiwanie na zakładki walk
    document.getElementById('tabWalk').addEventListener('click',
        () => switchTab('walk'));

    // Inicjujemy rotacje
    initialize();

    // Updatujemy zoom kamery
    updateCameraZoom();

    // Blokujemy pozycję y kamery walkCamera
    lockCameraYPosition(walkCamera, walkCamera.position.y);

    // Zwracamy gotową scenę
    return scene;
};

// Tworzmy scenę
const scene = createScene();

// Renderujemy sce
engine.runRenderLoop(() => scene.render());

// Nasłuchuj zmian rozmiaru okna i aktualizuj kamerę oraz silnik
window.addEventListener("resize", () => {

    // Dopasowanie silnika Babylon do nowego rozmiaru
    engine.resize();  
});

// Inicjalizacja przycisku dla Parteru
const toggleButton = document.getElementById('toggleButton');

// Dodajemy nasłuchiwanie wciśniecia przycisku
toggleButton.addEventListener('click', () => {

    // Sprawdzamy, czy wczytano jakieś modele
    if (loadedMeshes.length > 0  && activeTab === 'standard'){

        // Zmieniamy widoczność wszystkich części modelu
        const isVisible = !loadedMeshes[0].isVisible;
        
        // Zmień widoczność wszystkich części modelu
        loadedMeshes.forEach(mesh => {

            // Zmień widoczność wszystkich części modelu
            mesh.isVisible = isVisible;
        });

        // Zmieniamy stan przycisku
        buttons_states[2] = !buttons_states[2];
    }

    // Sprawdzamy, czy wczytano jakieś modele
    if (walkLoadedMeshes.length > 0 && activeTab === 'walk'){
        
        // Zmieniamy widoczność wszystkich części modelu
        const isVisible2 = !walkLoadedMeshes[0].isVisible;
        
        // Zmień widoczność wszystkich części modelu
        walkLoadedMeshes.forEach(mesh2 => {

            // Zmień widoczność wszystkich części modelu
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

// Dodajemy nasłuchiwanie wciśniecia przycisku
toggleButton1.addEventListener('click', () => {

    // Sprawdzamy, czy wczytano jakieś modele
    if (loadedMeshes1.length > 0  && activeTab === 'standard'){

        // Zmieniamy widoczność wszystkich części modelu
        const isVisible1 = !loadedMeshes1[0].isVisible;
        
        // Zmień widoczność wszystkich części modelu
        loadedMeshes1.forEach(mesh1 => {

            // Zmień widoczność wszystkich części modelu
            mesh1.isVisible = isVisible1;
        });

        // Zmieniamy stan przycisku
        buttons_states[1] = !buttons_states[1];
    }

    // Sprawdzamy, czy wczytano jakieś modele
    if (walkLoadedMeshes1.length > 0 && activeTab === 'walk'){

        // Zmieniamy widoczność wszystkich części modelu
        const isVisible2 = !walkLoadedMeshes1[0].isVisible;
        
        // Zmień widoczność wszystkich części modelu
        walkLoadedMeshes1.forEach(mesh2 => {

            // Zmień widoczność wszystkich części modelu
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

// Dodajemy nasłuchiwanie wciśniecia przycisku
toggleButton2.addEventListener('click', () => {

    // Sprawdzamy, czy wczytano jakieś modele
    if (loadedMeshes2.length > 0 && activeTab === 'standard'){

        // Zmieniamy widoczność wszystkich części modelu
        const isVisible2 = !loadedMeshes2[0].isVisible;
        
        // Zmień widoczność wszystkich części modelu
        loadedMeshes2.forEach(mesh2 => {

            // Zmień widoczność wszystkich części modelu
            mesh2.isVisible = isVisible2;
        });

        // Zmieniamy stan przycisku
        buttons_states[0] = !buttons_states[0];
    }

    // Sprawdzamy, czy wczytano jakieś modele
    if (walkLoadedMeshes2.length > 0 && activeTab === 'walk'){

        // Zmieniamy widoczność wszystkich części modelu
        const isVisible2 = !walkLoadedMeshes2[0].isVisible;
        
        // Zmień widoczność wszystkich części modelu
        walkLoadedMeshes2.forEach(mesh2 => {

            // Zmień widoczność wszystkich części modelu
            mesh2.isVisible = isVisible2;
        });

        // Zmieniamy stan przycisku
        walk_buttons_states[0] = !walk_buttons_states[0];
    }

    // Przeniesienie fokusu na element canvas
    canvas.focus();
});