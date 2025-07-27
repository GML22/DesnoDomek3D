//----------------------------------------------------------------------------
//--------------- DEKLARACJE NAJWAŻNIEJSZYCH FUNKCJI PROJEKTU ----------------
//----------------------------------------------------------------------------

// Ustawiamy kamerę na scenie
function update_camera_zoom(_camera){

    // Sprawdzamy, czy okno jest szersze niż wyższe
    if (window.innerWidth > window.innerHeight){

        // Dopasowanie promienia zoomy głównej kamery
        _camera.radius = 300;

    } else{

        // Dopasowanie promienia zoomy głównej kamery
        _camera.radius = 550;
    }
};

// Funkcja ustawiająca główną kamerę
function setup_main_camera(_main_canvas, _scene){

    // Ustawiamy główną kamerę
    const _camera = new BABYLON.ArcRotateCamera("camera", Math.PI / 2,
        Math.PI / 3, 10, BABYLON.Vector3.Zero(), _scene);

    // Definiujemy czułość przesuwania się po obiekcie, im mniejsza wartość
    // tym większa czułość
    _camera.panningSensibility = 50;

    // Ustawiamy precyzję zoomowania, im mniejsza wartość tym większa precyzja
    _camera.wheelPrecision = 1;

    // Pozwól na używanie prawego przycisku myszy
    _camera.attachControl(_main_canvas, true);

    // Updatujemy zoom głównej kamery
    update_camera_zoom(_camera);
    
    // Zwaracamy główną kamerę
    return _camera;
};

// Funkcja blokująca pozycję y kamery
function lock_cam_ypos(_camera, fixed_y){

    // Dodajemy nasłuchiwanie na kamerę
    _camera.onAfterCheckInputsObservable.add(() => {
        
        //  Zablokuj pozycję y kamery
        _camera.position.y = fixed_y;
    });
};

// Funkcja ustawiająca kamerę typu walk
function setup_walk_camera(_scene){

    // Dodajemy nową kamerę walk
    const walk_camera = new BABYLON.UniversalCamera("walkCamera",
        new BABYLON.Vector3(200, -13, 150), _scene);
    
    // Ustawienia czułości kamery na urządzeniu mobilnym (zmniejsz wartość,
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

    // Ustawienie rotacji kamery walk_camera wokół osi Y
    walk_camera.rotation.y = -Math.PI / 1.4;

    // Ustawienie rotacji kamery walk_camera, aby patrzyła bardziej w górę
    walk_camera.rotation.x = -Math.PI / 20;

    // Dodajemy kontrolki poruszania się
    walk_camera.keysUp.push(87); // W
    walk_camera.keysDown.push(83); // S
    walk_camera.keysLeft.push(65); // A
    walk_camera.keysRight.push(68); // D

    // Blokujemy pozycję y kamery walk_camera
    lock_cam_ypos(walk_camera, walk_camera.position.y);

    // Ustawiamy pole widzenia kamery (np. 1.2 radianów, czyli około 69
    // stopni)
    walk_camera.fov = 1.2;

    // Zwracamy kamerę walk
    return walk_camera;
};

// Funkcja uruchamiająca rotację
function start_auto_rotation(_scene, _is_rotating, _trans_node, _stop_rot){

    // Zapisujemy początkowe wartości kątów kamery
    const act_camera = _scene.activeCamera;

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
            _is_rotating.value = false;

            // Ustawiamy, że użytkownik zatrzymał rotację
            _stop_rot.value = true;

            /// Usuwamy obserwatora
            act_camera.onViewMatrixChangedObservable.remove(observer);
        }
    });

    // Animacja grupowa
    _scene.registerBeforeRender(() => {

        // Sprawdzamy, czy rotacja jest włączona
        if (_is_rotating.value && _trans_node.value){

            // Obracamy węzeł _trans_node
            _trans_node.value.rotate(BABYLON.Axis.Y,
                0.01 * _scene.getAnimationRatio(), BABYLON.Space.WORLD);
        }
    });
};

// Funkcja wczytująca plik STL parteru
function load_stl_model(_scene, stl_name, camera_type, pos_y, pos_x, pos_z,
    emis_col, edge_col, calc_ord, _lm_dict, _wlm_dict){

    // Zwracamy wczytany model
    return new Promise((resolve) => {
        
        // Wczytujemy plik STL
        BABYLON.SceneLoader.ImportMesh("", "models/", stl_name, _scene,
            function (meshes){
            
            // Definiujemy mesh
            let mesh = meshes[0];
            
            // Wywołujemy odpowiedni rodzaj zmiennej w zależnosci od
            // kamery
            if (camera_type === 'walk'){

                // Przypisujemy do zmiennej walkLoadedMeshes
                _wlm_dict[`meshes${calc_ord}`] = meshes;

            }else{

                // Przypisujemy do zmiennej loadedMeshes
                _lm_dict[`meshes${calc_ord}`] = meshes;
            }

            // Ustalamy pozycję obiektu na płaszczyźnie
            mesh.position.y = pos_y;
            mesh.position.x = pos_x;
            mesh.position.z = pos_z;

            // Materiał - biały na zewnątrz
            let material = new BABYLON.StandardMaterial("whiteMaterial",
                _scene);
            
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
            
            // Zwracamy wczytany model
            resolve();
        });
    });
};

 // Funkcja inicjująca wczytywanie modeli STL
 async function initialize(_scene, cam_type, corr_pos, _lm_dict, _wlm_dict,
    _is_rotating, _trans_node, _walk_trans_node, _stop_rot){

    // Deklarujemy pustą tablicę modeli STL
    const stl_models = [];

    // Dodajemy funkcje wczytującą model STL parteru
    stl_models.push(load_stl_model(_scene, "Domek - Parter.stl", cam_type,
        -20 + corr_pos, -90, -90, new BABYLON.Color3(1, 1, 1),
        new BABYLON.Color4(0, 0, 0, 1), 1, _lm_dict, _wlm_dict))

    // Dodajemy funkcje wczytującą model STL dachu
    stl_models.push(load_stl_model(_scene, "Domek - Strop.stl", cam_type,
        5.5 + corr_pos, -72, 127, new BABYLON.Color3(1, 1, 1),
        new BABYLON.Color4(0, 0, 0, 1), 2, _lm_dict, _wlm_dict))

    // Dodajemy funkcje wczytującą model STL stropu
    stl_models.push(load_stl_model(_scene, "Domek - Dach.stl", cam_type,
        5 + corr_pos, -306, -86.5, new BABYLON.Color3(0, 0, 0),
        new BABYLON.Color4(1, 1, 1, 1), 3, _lm_dict, _wlm_dict))

    // Oczekujemy na wczytanie wszystkich modeli
    await Promise.all(stl_models);
            
    // Sprawdzamy, która zakładka jest aktywna
    if (cam_type === 'standard'){

        // Tworzymy wspólny węzeł rodzicielski
        _trans_node.value = new BABYLON.TransformNode("groupParent");
        
        // Podłączamy wszystkie meshe do wspólnego rodzica
        Object.values(_lm_dict).forEach(meshes => {
            meshes.forEach(mesh => {mesh.parent = _trans_node.value;});});

        // Ustawiamy widoczność na true
        _trans_node.value.getChildren().forEach(mesh => {

            // Ustawiamy widoczność na true
            mesh.isVisible = true;
        });

        // Rozpocznij automatyczną rotację
        start_auto_rotation(_scene, _is_rotating, _trans_node, _stop_rot);

    }else{

        // Tworzymy wspólny węzeł rodzicielski
        _walk_trans_node.value = new BABYLON.TransformNode("walkGroupParent");

        // Podłączamy wszystkie meshe do wspólnego rodzica
        Object.values(_wlm_dict).forEach(meshes => {
            meshes.forEach(mesh => {mesh.parent = _walk_trans_node.value;});});
        
        // Obróć obiekt o 15 stopni wokół osi Y
        _walk_trans_node.value.rotation.y = BABYLON.Tools.ToRadians(-15);

        // Ustawiamy widoczność na true
        _walk_trans_node.value.getChildren().forEach(mesh => {

            // Ustawiamy widoczność na true
            mesh.isVisible = true;
        });
    }
};

// Funkcja przełączająca zakładki
async function switch_tab(_main_canvas, _scene, _main_camera, _walk_camera,
    _photo_dome, tabName, _active_tab, _buttons_states, _walk_buttons_states,
    _lm_dict, _wlm_dict, _is_rotating, _trans_node, _walk_trans_node,
    _stop_rot){

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
        if (_scene.activeCamera instanceof BABYLON.UniversalCamera){
            
            // Aktywuj standardową kamerę
            _scene.activeCamera.detachControl(_main_canvas);
            _scene.activeCamera = _main_camera;
            _main_camera.attachControl(_main_canvas, true);
        }

        // Wyłącz PhotoDome
        _photo_dome.setEnabled(false);

        // Zmieniamy nazwę aktywnej zakładki
        _active_tab.value = tabName;

        // Włącz rotację, jeśli nie została zatrzymana przez użytkownika
        if (!_stop_rot.value){

            // Włącz rotację
            _is_rotating.value = true;
        }

        // Wyłącz modele walk_camera
        if (_walk_trans_node.value){

            // Wyłączamy modele walk_camera
            _walk_trans_node.value.setEnabled(false);
        }

        // Włącz modele standardowe
        if (_trans_node.value){

            // Włączamy modele standardowe
            _trans_node.value.setEnabled(true);
        }

        // Zmień stan checkboxów toggle1, toggle2, toggle3 w zależności od
        // stanu przycisków buttons_states
        for (let i = 0; i < _buttons_states.length; i++){

            // Pobierz odpowiedni przycisk toggle
            const toggle = document.getElementById(`toggle${i+1}`);

            // Jeśli przycisk jest włączony, ustaw stan na true,
            // w przeciwnym razie ustaw stan na false
            if (_buttons_states[i]){

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
        _is_rotating.value = false;

        // Wyłączamy modele standardowe
        if (_trans_node.value){

            // Wyłączamy modele standardowe
            _trans_node.value.setEnabled(false);
        }

        // Włączamy modele walk_camera
        if (_walk_trans_node.value){

            // Włączamy modele walk_camera
            _walk_trans_node.value.setEnabled(true);

        } else {

            // Inicjujemy wczytywanie modeli STL
            await initialize(_scene, tabName, -10, _lm_dict, _wlm_dict,
                _is_rotating, _trans_node, _walk_trans_node, _stop_rot);
        }

        // Aktywuj kamerę walk_camera
        if (_scene.activeCamera instanceof BABYLON.ArcRotateCamera){

            // Aktywujemy kamerę walk_camera
            _scene.activeCamera.detachControl(_main_canvas);
            _scene.activeCamera = _walk_camera;
            _walk_camera.attachControl(_main_canvas, true);
        }

        // Włącz PhotoDome
        _photo_dome.setEnabled(true);

        // Zmieniamy nazwę aktywnej zakładki
        _active_tab.value = tabName;

        // Zmień stan checkboxów toggle1, toggle2, toggle3 w zależności od
        // stanu przycisków walk_buttons_states
        for (let i = 0; i < _walk_buttons_states.length; i++){

            // Pobieramy odpowiedni przycisk toggle
            const toggle = document.getElementById(`toggle${i+1}`);

            // Jeśli przycisk jest włączony, ustaw stan na true,
            if (_walk_buttons_states[i]){

                // Ustaw stan na true
                toggle.checked = true;

            } else{
                
                // Ustaw stan na false
                toggle.checked = false;
            }
        }
    }

    // Przeniesienie fokusu na element canvas
    _main_canvas.focus();
};

// Główna funkcja tworząca scenę
export function create_main_scene(_main_canvas, _main_engine, _link_360,
    _active_tab, _buttons_states, _walk_buttons_states, _lm_dict, _wlm_dict,
    _is_rotating, _trans_node, _walk_trans_node, _stop_rot){

    // Definiujemy obiekt sceny
    const main_scene = new BABYLON.Scene(_main_engine);

    // Ustawiamy kolor tła
    main_scene.clearColor = new BABYLON.Color4(0.2, 0.2, 0.2, 1);

    // Ustawiamy głowną kamerę
    const main_camera = setup_main_camera(_main_canvas, main_scene)

    // Dodajemy nową kamerę walk
    const walk_camera = setup_walk_camera(main_scene);

    // Ustawienie tła 360° za pomocą PhotoDome
    const photo_dome = new BABYLON.PhotoDome("skyDome", _link_360,
        {resolution: 32, size: 5000}, main_scene);

    // Domyślnie wyłączamy photoDome
    photo_dome.setEnabled(false);

    // Dodajemy nasłuchiwanie klikniecia zakładki 'Widok z góry' 
    document.getElementById('tabStandard').addEventListener('click',
        () => switch_tab(_main_canvas, main_scene, main_camera,
            walk_camera, photo_dome, 'standard', _active_tab, _buttons_states,
             _walk_buttons_states, _lm_dict, _wlm_dict, _is_rotating,
             _trans_node, _walk_trans_node, _stop_rot));

    // Dodajemy nasłuchiwanie klikniecia zakładki 'Wirtualny spacer' 
    document.getElementById('tabWalk').addEventListener('click',
        () => switch_tab(_main_canvas, main_scene, main_camera, walk_camera,
            photo_dome, 'walk', _active_tab, _buttons_states,
            _walk_buttons_states, _lm_dict, _wlm_dict, _is_rotating,
            _trans_node, _walk_trans_node, _stop_rot));

    // Inicjujemy wczytywanie modeli STL
    initialize(main_scene, "standard", 0, _lm_dict, _wlm_dict,
        _is_rotating, _trans_node, _walk_trans_node, _stop_rot);

    // Nasłuchujemy zmian rozmiaru okna i aktualizujemy rozmiar silnika
    window.addEventListener("resize", () => {

        // Dopasowanie silnika Babylon do nowego rozmiaru
        _main_engine.resize();  
    });

    // Zwracamy gotową i aktywną zakładkę
    return main_scene;
};

// Funkcja inicjująca przyciski toggle
export function setup_toggle_buttons(_main_canvas, _toggle_butts, _active_tab,
    _lm_dict, _wlm_dict, _buttons_states, _walk_buttons_states){

    // Iteracja po tablicy przycisków
    _toggle_butts.forEach((butt_id, c_ind) => {

        // Pobieramy przycisk
        const button = document.getElementById(butt_id);

        // Dodajemy nasłuchiwanie wciśnięcia przycisku
        button.addEventListener('click', () => {

            // Sprawdzamy, która zakładka jest aktywna
            let c_dict;

            // Sprawdzamy, która zakładka jest aktywna
            if (_active_tab.value === 'standard'){
        
                // Przypisujemy odpowiedni słownik
                c_dict = _lm_dict;

            } else {

                // Przypisujemy odpowiedni słownik
                c_dict = _wlm_dict;
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
                if (_active_tab.value === 'standard'){

                    // Zmieniamy stan przycisku
                    _buttons_states[c_ind] = !_buttons_states[c_ind];

                } else{

                    // Zmieniamy stan przycisku
                    _walk_buttons_states[c_ind] = !_walk_buttons_states[c_ind];
                }
            }

            // Przeniesienie fokusu na element canvas
            _main_canvas.focus();
        });
    });
};