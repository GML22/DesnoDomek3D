//----------------------------------------------------------------------------
//--------------------------- GŁÓWNY KOD PROJEKTU ----------------------------
//----------------------------------------------------------------------------

// Importowanie potrzebnych funkcji
import {create_main_scene,  setup_toggle_buttons} from './domek_func.js';

// Główna funkcja projektu
function main(){

    //------------------------------------------------------------------------
    //----------------- 1. DEKLARACJA PODSTAWOWYCH ZMIENNYCH -----------------
    //------------------------------------------------------------------------

    // Ustalamy sciezke do zdjecia 360
    let link_360 = "360img.jpg";

    // Definiujemy słownik, który będzie przechowywaźć wczytane meshe dla
    // kamery standardowej
    let lm_dict = {};

    // Definiujemy słownik, który będzie przechowywaźć wczytane meshe dla
    // kamery walk
    let wlm_dict = {};

    // Definiujemy zmienną, która będzie przechowywać informację o tym, czy
    // użytkownik zatrzymał rotację
    let stop_rot = {value: false};

    // Definiujemy zmienną, która będzie przechowywać informację o tym,
    // czy rotacja jest włączona
    let is_rotating = {value: true};

    // Definiujemy zmienną, która będzie przechowywać informację o tym, która
    // zakładka jest aktywna
    let active_tab = {value: 'standard'};

    // Definiujemy zmienne grupujące wczytane meshe
    let trans_node = {value: undefined};
    let walk_trans_node  = {value: undefined};

    // Definiujemy tablice przechowujące stany przycisków
    let buttons_states = [false, false, false];
    let walk_buttons_states = [false, false, false];

    // Tworzymy tablicę z identyfikatorami przycisków
    let toggle_butts = ['toggle_butt1', 'toggle_butt2', 'toggle_butt3'];

    //------------------------------------------------------------------------
    //---------------- 2. WYWOŁANIE FUNKCJI TWORZĄCYCH SCENĘ -----------------
    //------------------------------------------------------------------------

    // Definiujemy canvas
    const main_canvas = document.getElementById("render_canvas");

    // Tworzymy silnik
    const main_engine = new BABYLON.Engine(main_canvas, true);

    // Tworzmy scenę
    const fin_scene = create_main_scene(main_canvas, main_engine, link_360,
        active_tab, buttons_states, walk_buttons_states, lm_dict, wlm_dict,
        is_rotating, trans_node, walk_trans_node, stop_rot);

    // Renderujemy główną scenę
    main_engine.runRenderLoop(() => fin_scene.render());

    // Inicjujemy przyciski kontrulujące obiekty STL
    setup_toggle_buttons(main_canvas, toggle_butts, active_tab, lm_dict,
        wlm_dict, buttons_states, walk_buttons_states)

    //------------------------------------------------------------------------
    //------------------------------------------------------------------------
    //------------------------------------------------------------------------
};

// Wywołanie funkcji main
main();