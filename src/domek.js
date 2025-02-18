// Definiujemy zmienne globalne grupujące wczytane meshe
let trans_node;
let walk_trans_node;

// Definiujemy zmienną globalną, która będzie przechowywać informację o tym,
// czy rotacja jest włączona
let is_rotating = true;

// Definiujemy słownik, który będzie przechowywaźć wczytane meshe dla kamery
// standardowej
let lm_dict = {};

// Definiujemy słownik, który będzie przechowywaźć wczytane meshe dla kamery
// walk
let wlm_dict = {};

// Tablica z identyfikatorami przycisków
const toggle_butts = ['toggle_butt1', 'toggle_butt2', 'toggle_butt3'];

// Definiujemy zmienną globalną, która będzie przechowywać informację o tym,
// która zakładka jest aktywna
let active_tab = 'standard';

// Definiujemy zmienną globalną, która będzie przechowywać informację o tym,
// czy użytkownik zatrzymał rotację
let stop_rot = false;

// Definiujemy tablice przechowujące stany przycisków
let buttons_states = [false, false, false];
let walk_buttons_states = [false, false, false];

// Definiujemy canvas
const canvas = document.getElementById("render_canvas");

// Tworzymy silnik
const engine = new BABYLON.Engine(canvas, true);

// Główna funkcja tworząca scenę
const create_scene = function (){

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
     const walk_camera = new BABYLON.UniversalCamera("walkCamera",
        new BABYLON.Vector3(200, -13, 150), scene);
    
    // Ustawienia czułości kamery na urządzeniu mobilnym (Zmniejsz wartość,
    // aby zwiększyć czułość)
    walk_camera.inputs.attached.touch.touchAngularSensibility = 10000;
    
    // Sprawdzamy, czy urządzenie jest mobilne
    const is_mobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    // Ustawiamy prędkość kamery na urządzeniu mobilnym
    if (is_mobile){

        // Ustawiamy prędkość kamery na urządzeniu mobilnym
        walk_camera.speed = 1.0;
        
    } else{
        
        // Ustawiamy prędkość kamery na urządzeniu stacjonarnym
        walk_camera.speed = 0.5;
    }

    // Ustawienie rotacji kamery walk_camera o 180 stopni wokół osi Y
    walk_camera.rotation.y = -Math.PI / 1.6;

    // Ustawienie rotacji kamery walk_camera, aby patrzyła bardziej w górę
    walk_camera.rotation.x = -Math.PI / 20;

    // Dodajemy kontrolki poruszania się
    walk_camera.keysUp.push(87); // W
    walk_camera.keysDown.push(83); // S
    walk_camera.keysLeft.push(65); // A
    walk_camera.keysRight.push(68); // D

    // Ustawienie tła 360° za pomocą PhotoDome
    const photodome = new BABYLON.PhotoDome("skyDome", "imgs/Desno.jpg",
        {resolution: 32,size: 5000}, scene);

    // Domyślnie wyłączamy PhotoDome
    photodome.setEnabled(false);
    
    // Ustawiamy kamerę na scenie
    function update_camera_zoom(){

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
    const start_auto_rotation = () => {

        // Zapisujemy początkowe wartości kątów kamery
        const act_camera = scene.activeCamera;

        // Zapisujemy początkowe wartości kątów kamery
        const init_cs = {alpha: act_camera.alpha, beta: act_camera.beta,
            radius: act_camera.radius};

        // Obserwator zmian kamery
        const observer = act_camera.onViewMatrixChangedObservable.add(() => {

            // Sprawdzamy, czy kąty kamery się zmieniły
            if (Math.abs(act_camera.alpha - init_cs.alpha) > 0.001 ||
                Math.abs(act_camera.beta - init_cs.beta) > 0.001 ||
                Math.abs(act_camera.radius - init_cs.radius) > 0.001){
                
                // Zatrzymujemy rotację
                is_rotating = false;

                // Ustawiamy, że użytkownik zatrzymał rotację
                stop_rot = true;

                /// Usuwamy obserwatora
                act_camera.onViewMatrixChangedObservable.remove(observer);
            }
        });

        // Animacja grupowa
        scene.registerBeforeRender(() => {

            // Sprawdzamy, czy rotacja jest włączona
            if (is_rotating && trans_node){

                // Obracamy węzeł trans_node
                trans_node.rotate(BABYLON.Axis.Y,
                    0.01 * scene.getAnimationRatio(), BABYLON.Space.WORLD);
            }
        });
    };

    // Funkcja wczytująca plik STL parteru
    const load_stl_model = (stl_name, camera_type, pos_y, pos_x, pos_z,
        emis_col, edge_col, calc_ord) => {

        // Zwracamy obietnicę
        return new Promise((resolve) => {
            
            // Wczytujemy plik STL
            BABYLON.SceneLoader.ImportMesh("", "models/", stl_name, scene,
                function (meshes){
                
                // Definiujemy mesh
                let mesh = meshes[0];
                
                // Wywołujemy odpowiedni rodzaj zmiennej w zależnosci od
                // kamery
                if (camera_type === 'walk'){

                    // Przypisujemy do zmiennej walkLoadedMeshes
                    wlm_dict[`meshes${calc_ord}`] = meshes;

                }else{

                    // Przypisujemy do zmiennej loadedMeshes
                    lm_dict[`meshes${calc_ord}`] = meshes;
                }

                // Ustalamy pozycję obiektu na płaszczyźnie
                mesh.position.y = pos_y;
                mesh.position.x = pos_x;
                mesh.position.z = pos_z;

                // Materiał - biały na zewnątrz
                let material = new BABYLON.StandardMaterial("whiteMaterial",
                    scene);
                
                // Ustawiamy kolor na pełną biel
                material.emissiveColor = emis_col;
                
                // Wyłączamy oświetlenie
                material.disableLighting = true; 
                
                // Ustawiamy finalny materiał
                mesh.material = material;

                //Podkreślenie krawędzi
                mesh.enableEdgesRendering();

                // Grubość linii krawędzi
                mesh.edgesWidth = 50;

                // Czarny kolor krawędzi
                mesh.edgesColor = edge_col;

                // Ustawiamy widoczność na false
                mesh.isVisible = false;
                
                // Zwracamy obietnicę
                resolve();
            });
        });
    };

    // Funkcja blokująca pozycję y kamery
    const lock_cam_ypos = (camera, fixedY) => {

        // Dodajemy nasłuchiwanie na kamerę
        camera.onAfterCheckInputsObservable.add(() => {
            
            //  Zablokuj pozycję y kamery
            camera.position.y = fixedY;
        });
    };

    // Funkcja przełączająca zakładki
    const switch_tab = async (tabName) => {

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
            active_tab = tabName;

            // Włącz rotację, jeśli nie została zatrzymana przez użytkownika
            if (!stop_rot){

                // Włącz rotację
                is_rotating = true;
            }

            // Wyłącz modele walk_camera
            if (walk_trans_node){

                // Wyłączamy modele walk_camera
                walk_trans_node.setEnabled(false);
            }

            // Włącz modele standardowe
            if (trans_node){

                // Włączamy modele standardowe
                trans_node.setEnabled(true);
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
            is_rotating = false;

            // Wyłączamy modele standardowe
            if (trans_node){

                // Wyłączamy modele standardowe
                trans_node.setEnabled(false);
            }

            // Włączamy modele walk_camera
            if (walk_trans_node){

                // Włączamy modele walk_camera
                walk_trans_node.setEnabled(true);

            } else {

                // Inicjujemy grupę modeli dla walk_camera
                await initialize(tabName, -10);
            }

            // Aktywuj kamerę walk_camera
            if (scene.activeCamera instanceof BABYLON.ArcRotateCamera){

                // Aktywujemy kamerę walk_camera
                scene.activeCamera.detachControl(canvas);
                scene.activeCamera = walk_camera;
                walk_camera.attachControl(canvas, true);
            }

            // Włącz PhotoDome
            photodome.setEnabled(true);

            // Zmieniamy nazwę aktywnej zakładki
            active_tab = tabName;

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

    // Funkcja inicjująca modele STL
    const initialize = async (cam_type, corr_pos) => {

        // Wczytujemy wszystkie modele po kolei
        await Promise.all([
            load_stl_model("Domek - Parter.stl", cam_type, -20 + corr_pos,
            -90, -90, new BABYLON.Color3(1, 1, 1), new BABYLON.Color4(0, 0, 0,
            1), 1),
            load_stl_model("Domek - Strop.stl", cam_type, 5.5 + corr_pos, -72,
            127, new BABYLON.Color3(1, 1, 1), new BABYLON.Color4(0, 0, 0, 1),
            2),
            load_stl_model("Domek - Dach.stl", cam_type, 5 + corr_pos, -306,
            -86.5,new BABYLON.Color3(0, 0, 0), new BABYLON.Color4(1, 1, 1, 1),
             3)]);
                
        // Sprawdzamy, która zakładka jest aktywna
        if (cam_type === 'standard'){

            // Tworzymy wspólny węzeł rodzicielski
            trans_node = new BABYLON.TransformNode("groupParent");
            
            // Podłączamy wszystkie meshe do wspólnego rodzica
            Object.values(lm_dict).forEach(meshes => {
                meshes.forEach(mesh => {mesh.parent = trans_node;});});

            // Ustawiamy widoczność na true
            trans_node.getChildren().forEach(mesh => {

                // Ustawiamy widoczność na true
                mesh.isVisible = true;
            });

            // Rozpocznij automatyczną rotację
            start_auto_rotation();

        }else{

            // Tworzymy wspólny węzeł rodzicielski
            walk_trans_node = new BABYLON.TransformNode("walkGroupParent");

            // Podłączamy wszystkie meshe do wspólnego rodzica
            Object.values(wlm_dict).forEach(meshes => {
                meshes.forEach(mesh => {mesh.parent = walk_trans_node;});});
            
            // Obróć obiekt o 15 stopni wokół osi Y
            walk_trans_node.rotation.y = BABYLON.Tools.ToRadians(15);

            // Ustawiamy widoczność na true
            walk_trans_node.getChildren().forEach(mesh => {

                // Ustawiamy widoczność na true
                mesh.isVisible = true;
            });
        }
    };

    // Dodajemy nasłuchiwanie na zakładki standard
    document.getElementById('tabStandard').addEventListener('click',
        () => switch_tab('standard'));

    // Dodajemy nasłuchiwanie na zakładki walk
    document.getElementById('tabWalk').addEventListener('click',
        () => switch_tab('walk'));

    // Inicjujemy rotacje
    initialize("standard", 0);

    // Updatujemy zoom kamery
    update_camera_zoom();

    // Blokujemy pozycję y kamery walk_camera
    lock_cam_ypos(walk_camera, walk_camera.position.y);

    // Zwracamy gotową scenę
    return scene;
};

// Tworzmy scenę
const scene = create_scene();

// Renderujemy sce
engine.runRenderLoop(() => scene.render());

// Nasłuchuj zmian rozmiaru okna i aktualizuj kamerę oraz silnik
window.addEventListener("resize", () => {

    // Dopasowanie silnika Babylon do nowego rozmiaru
    engine.resize();  
});

// Iteracja po tablicy przycisków
toggle_butts.forEach((butt_id, c_ind) => {

    // Pobieramy przycisk
    const button = document.getElementById(butt_id);

    // Dodajemy nasłuchiwanie wciśnięcia przycisku
    button.addEventListener('click', () => {

        // Sprawdzamy, która zakładka jest aktywna
        let c_dict;

        // Sprawdzamy, która zakładka jest aktywna
        if (active_tab === 'standard'){
    
            // Przypisujemy odpowiedni słownik
            c_dict = lm_dict;

        } else {

            // Przypisujemy odpowiedni słownik
            c_dict = wlm_dict;
        }

        // Sprawdzamy, czy wczytano jakieś modele
        if (c_dict[`meshes${c_ind + 1}`].length > 0){

            // Zmieniamy widoczność wszystkich części modelu
            const isVisible = !c_dict[`meshes${c_ind + 1}`][0].isVisible;

            // Zmień widoczność wszystkich części modelu
            c_dict[`meshes${c_ind + 1}`].forEach(mesh => {
                mesh.isVisible = isVisible;
            });

            // Zmieniamy stan przycisku
            if (active_tab === 'standard'){

                // Zmieniamy stan przycisku
                buttons_states[c_ind] = !buttons_states[c_ind];

            } else{

                // Zmieniamy stan przycisku
                walk_buttons_states[c_ind] = !walk_buttons_states[c_ind];
            }
        }

        // Przeniesienie fokusu na element canvas
        canvas.focus();
    });
});