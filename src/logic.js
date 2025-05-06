var sw_msgs = '';

if ('serviceWorker' in navigator) {
  // Delay registration until after the page has loaded, to ensure that our
  // precaching requests don't degrade the first visit experience.
  // See https://developers.google.com/web/fundamentals/instant-and-offline/service-worker/registration
  window.addEventListener('load', function() {
    // Your service-worker.js *must* be located at the top-level directory relative to your site.
    // It won't be able to control pages unless it's located at the same level or higher than them.
    // *Don't* register service worker file in, e.g., a scripts/ sub-directory!
    // See https://github.com/slightlyoff/ServiceWorker/issues/468
    navigator.serviceWorker.register('/sw.js').then(function(reg) {
      // updatefound is fired if service-worker.js changes.
      reg.onupdatefound = function() {
        // The updatefound event implies that reg.installing is set; see
        // https://w3c.github.io/ServiceWorker/#service-worker-registration-updatefound-event
        let installingWorker = reg.installing;

        installingWorker.onstatechange = function() {
          switch (installingWorker.state) {
            case 'installed':
              if (navigator.serviceWorker.controller) {
                // At this point, the old content will have been purged and the fresh content will
                // have been added to the cache.
                // It's the perfect time to display a "New content is available; please refresh."
                // message in the page's interface.
                sw_msgs = 'A new version is available.<br/>Refresh the page to update.';
              } else {
                // At this point, everything has been precached.
                // It's the perfect time to display a "Content is cached for offline use." message.
                sw_msgs = 'Content is cached for offline use';
              }
              try {
                get_screen().getElementById("msgs").textContent = sw_msgs;
                sw_msgs = '';
              } catch (e) {}
              break;

            case 'redundant':
              console.error('The installing service worker became redundant.');
              break;
          }
        };
      };
    }).catch(function(e) {
      console.error('Error during service worker registration:', e);
    });
  });
}

const clickEvnt = "click";

var myInterval = 0;
var N = 1;
var cfg;
var stats;
var vis_delays = [];
var letter_delays = [];
var vis_wrong = 0; // incorrect click
var vis_misses = 0; // missed clicks
var letter_wrong = 0;
var letter_misses = 0;
var vis_hits = 0;
var letter_hits = 0;
var d_prime = 0;

function compareDates(a, b) {
    return a.getDate() === b.getDate()
        && a.getMonth() === b.getMonth()
        && a.getFullYear() === b.getFullYear();
}

function isToday(d) {
    return compareDates(new Date(d), new Date());
}

function cloner(e) {
    let newone = e.cloneNode(true);
    e.parentNode.replaceChild(newone, e);
    return newone;
}

function setToggleState(e, state) {
    e.getElementsByTagName('rect')[0].setAttribute('fill', (state)   ? '#99ccff' : 'grey');
    e.getElementsByTagName('circle')[0].setAttribute('fill', (state) ? '#226699' : 'grey');
    e.getElementsByTagName('circle')[0].setAttribute('cx', (state)   ? '10' : '-10');
}

function replaceEventListener(e, evt, action) {
    let elm = cloner(e);
    elm.addEventListener(evt, action, Modernizr.passiveeventlisteners ? {passive: true}: false);
}

function get_screen() {
    return document.getElementById('thescreen').contentWindow.document;
}

function get_menu() {
    return document.getElementById('themenu').contentWindow.document;
}

function get_n_games() {
    let games = stats['games'];
    let gamecount = 0;
    for (let i=games.length-1; i>-1; i--) {
        if (isToday(games[i]['time'])) {
            gamecount += 1;
        } else { break; } // assumes stats array is sorted.
    }
    return gamecount;
}

function gameKeypress(e) {
    const keyChar = String.fromCharCode(e.keyCode || e.which);
    console.log(`Received keypress ${keyChar}`);
    if (keyChar === "a") {
        eyeButtonPress();
    } else if (keyChar === ";") {
        soundButtonPress();
    }
}

function init_home() {
    document.getElementById('#play').style.display = 'block';
    replaceEventListener(get_screen().getElementById("#gear"), clickEvnt, function(e)  { window.history.pushState({'page':'config'}, '', '');  goto_config();});
    replaceEventListener(get_screen().getElementById("#help"), clickEvnt, function(e)  { window.history.pushState({'page':'help'},   '', '');  goto_help();});
    replaceEventListener(get_screen().getElementById("#graph"), clickEvnt, function(e) { window.history.pushState({'page':'stats'},  '', '');  goto_stats();});
    document.getElementById("title").textContent = `N = ${N}`;
    document.getElementById("ngames").textContent = `${get_n_games()} / 20 Today`;
    get_screen().getElementById("msgs").textContent = sw_msgs;
    sw_msgs = '';
}

function goto_home() {
    hide_menu();
    if (myInterval > 0)
        clearInterval(myInterval);
    if(! document.getElementById('thescreen').contentWindow.location.href.endsWith('./screens/home.html')) {
        document.getElementById('thescreen').contentWindow.location.replace('./screens/home.html');
        document.getElementById('thescreen').onload = function (e) { init_home(); }
    } else {
        if (document.getElementById('thescreen').contentWindow.document.readyState == 'complete')
            init_home();
        else
            document.getElementById('thescreen').onload = function (e) { init_home(); }
    }
}

function goto_help() {
    hide_menu();
    document.getElementById('#play').style.display = 'none';
    document.getElementById('thescreen').contentWindow.location.replace('/screens/help.html');
    document.getElementById('thescreen').onload = function (e) {
        replaceEventListener(get_screen().getElementById("#back"), clickEvnt, function(e) { window.history.back(); });
    }
}

function goto_game(callback) {
    hide_menu();
    window.addEventListener("keypress", gameKeypress);
    document.getElementById('#play').style.display = 'none';
    document.getElementById('thescreen').contentWindow.location.replace('/screens/game.html');
    document.getElementById('thescreen').onload = function (e) {
        get_screen().getElementById("title").textContent = `N = ${N}`;
        replaceEventListener(get_screen().getElementById("vis_button"), clickEvnt, function(e) {  eyeButtonPress();});
        replaceEventListener(get_screen().getElementById("letter_button"), clickEvnt, function(e) { soundButtonPress();});
        replaceEventListener(get_screen().getElementById("#back"), clickEvnt, function(e) {
            window.history.back();
        });

        // Prime the audio engine before actually starting game play
        primeAudioEngine().then(callback);
    }
}

function goto_score() {
    hide_menu();
    document.getElementById('#play').style.display = 'none';
    document.getElementById('thescreen').contentWindow.location.replace('./screens/score.html');
    document.getElementById('thescreen').onload = function (e) {
        replaceEventListener(get_screen().getElementById("#back"), clickEvnt, function(e) {  window.history.back(); });
        replaceEventListener(get_screen().getElementById("#play"), clickEvnt, function(e) {  startGame(true); });

        get_screen().getElementById("vis_hits").textContent      = ""+vis_hits;
        get_screen().getElementById("vis_misses").textContent    = ""+vis_misses;
        get_screen().getElementById("vis_wrong").textContent     = ""+vis_wrong;
        get_screen().getElementById("letter_hits").textContent   = ""+letter_hits;
        get_screen().getElementById("letter_misses").textContent = ""+letter_misses;
        get_screen().getElementById("letter_wrong").textContent  = ""+letter_wrong;

        if (d_prime > 0.85) {
            get_screen().getElementById("title").style.color = 'green';
            get_screen().getElementById("level").style.fill = 'green';
        } else if (d_prime < 0.7) {
            get_screen().getElementById("title").style.color = 'red';
            get_screen().getElementById("level").style.fill = 'red';
        } else {
            get_screen().getElementById("title").style.color = 'black';
            get_screen().getElementById("level").style.fill = 'black';
        }

        get_screen().getElementById("title").textContent = `d' = ${Math.round(d_prime*100)}%`;
        get_screen().getElementById("level").textContent = `N = ${N}`;
        get_screen().getElementById("ngames").textContent = `${get_n_games()} / 20 Today`;

        let twitter_text = encodeURIComponent(`I made it to N=${N}!`);
        let twitter_link = encodeURIComponent('https://dual-n-back.io/');
        get_screen().getElementById('twitter_share').setAttribute('href',
            `https://twitter.com/intent/tweet/?text=${twitter_text}&url=${twitter_link}`);
    }
}

function goto_stats() {
    hide_menu();
    document.getElementById('#play').style.display = 'none';
    document.getElementById('thescreen').contentWindow.location.replace('./screens/stats.html');
    document.getElementById('thescreen').onload = function (e) {
        replaceEventListener(get_screen().getElementById("#back"), clickEvnt, function(e) { window.history.back(); });
    }
}

function goto_config() {
    document.getElementById('themenu').contentWindow.location.replace('./screens/config.html');
    document.getElementById('themenu').onload = function (e) {
        replaceEventListener(get_menu().getElementById("#download_stats"), clickEvnt,   downloadStats);
        replaceEventListener(get_menu().getElementById("#level_down"), clickEvnt,       level_down);
        replaceEventListener(get_menu().getElementById("#level_up"), clickEvnt,         level_up);
        replaceEventListener(get_menu().getElementById("#clear_storage"), clickEvnt,    clearStorageButtonClick);
        replaceEventListener(get_menu().getElementById("#upload_stats"), "change",      uploadConfig);
        replaceEventListener(get_menu().getElementById("#back"), clickEvnt,             go_back);
        replaceEventListener(get_menu().getElementById("reset_n"), clickEvnt,           toggle_reset_n);
        setToggleState(get_menu().getElementById("reset_n"), cfg["reset_n"]);
        get_menu().getElementById("#level_num").innerText = `${N}`;
        show_menu();
    }
}

function show_menu() {
    document.getElementById('shader').style.opacity = '0.5';
    document.getElementById('themenu').style.width = '60%';
}

function hide_menu() {
    document.getElementById('shader').style.opacity = '0';
    document.getElementById('themenu').style.width = '0';
    window.removeEventListener("keypress", gameKeypress);
}

function toggle_reset_n() {
    cfg["reset_n"] = !cfg["reset_n"];
    setToggleState(get_menu().getElementById("reset_n"), cfg["reset_n"]);
    localStorage.setItem('config', JSON.stringify(cfg));
}

function downloadStats() {
    let elm = cloner(get_menu().getElementById('#download_stats'));
    elm.style.webkitAnimationPlayState = 'running';
    elm.style.animationPlayState = 'running';

    let backups = { "N": N, "stats": stats };
    let blob = new Blob([JSON.stringify(backups)], {type: "text"});
    let element = get_screen().createElement('a');
    element.setAttribute('href', URL.createObjectURL(blob));
    element.setAttribute('download', "N-Back_Stats"+(new Date()).toJSON()+".json");
    element.style.display = 'none';
    get_screen().body.appendChild(element);
    element.click();
    get_screen().body.removeChild(element);
}

function uploadConfig(event) {
    if (window.File && window.FileReader && window.FileList && window.Blob) {
        let f = event.target.files[0];
        if (f) {
            let r = new FileReader();
            r.addEventListener("load", function(event) {
                let asjson = JSON.parse(event.target.result);
                stats = asjson["stats"];
                N = asjson["N"];
                localStorage.setItem("stats", JSON.stringify(stats));
                localStorage.setItem("N", N);
            });
            r.readAsText(f);
        }
    } else {
        alert('This functionality not supported by your browser.');
    }
}

function doClearStorage() {
    try {
        localStorage.removeItem("stats");
        localStorage.removeItem('config');
    } catch(err) {}
    cfg = { "reset_n": false };
    stats = { "games": [] };
    N = 1;
}

function clearStorageButtonClick() {
    if (confirm('Really clear all app data?')) {
        let elm = cloner(get_menu().getElementById('#clear_storage'));
        elm.style.webkitAnimationPlayState = 'running';
        elm.style.animationPlayState = 'running';
        doClearStorage();
    }
}


function updateStats() {
    let entry = { "time": (new Date()).toJSON(), "N": N,
        "vStack": vis_stack, "vClicks": vis_clicks, "vDelays": vis_delays,
        "lStack": letter_stack, "lClicks": letter_clicks, "lDelays": letter_delays,
        "v": 1.0 };
    stats["games"].push(entry);
    localStorage.setItem("stats", JSON.stringify(stats));
}


window.addEventListener("load", function() {
    try { stats = JSON.parse(localStorage.getItem("stats")); } catch (err)  { }
    try { N = parseInt(localStorage.getItem("N")); }           catch (err)  { }
    try { cfg = JSON.parse(localStorage.getItem("config")); }  catch (err)  { }

    if (!stats) stats = { 'games': [] };
    if (!N)     N = 1;
    if (!cfg)   cfg = { 'reset_n': false };

    if (stats['games'].length > 0) {
        let latest_game = stats['games'][stats['games'].length-1];
        if (cfg['reset_n'] && !isToday(latest_game['time'])) {
            N = 1;
        }
    }

    window.history.pushState({'page':'home'}, '', '');
    goto_home();
});
