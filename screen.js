(function () {
    'use strict';

    let _enabled = false;
    try { _enabled = localStorage.getItem('simplify_chords_enabled') === '1'; } catch (_) {}

    // Simplification options — each toggle targets a distinct class of chord modifier.
    var _DEFAULT_OPTS = { extensions: true, sus: true, dimAug: false };
    var _opts = Object.assign({}, _DEFAULT_OPTS);
    try {
        var _stored = localStorage.getItem('simplify_chords_opts');
        if (_stored) _opts = Object.assign({}, _DEFAULT_OPTS, JSON.parse(_stored));
    } catch (_) {}

    function _saveOpts() {
        try { localStorage.setItem('simplify_chords_opts', JSON.stringify(_opts)); } catch (_) {}
    }

    // Saved originals per song: array of { name, displayName } parallel to chordTemplates
    let _origTemplates = null;

    // Simplify a chord name according to the active _opts flags.
    //
    // extensions — strips numeric suffixes and "add"/"maj" prefixes:
    //   Am7 → Am,  Cadd9 → C,  Gmaj7 → G,  F#m7 → F#m
    // sus       — strips suspended qualifiers:
    //   Dsus4 → D,  Asus2 → A
    // dimAug    — strips diminished/augmented qualifiers:
    //   Adim → A,  Gaug → G
    function _simplify(name) {
        if (!name || !name.trim()) return name;
        var result = name;

        if (_opts.extensions) {
            result = result.replace(/add\d+/gi, '');    // add9, add11 → ''
            result = result.replace(/maj(?=\d)/gi, ''); // maj7 → 7, stripped next
            // Strip numeric suffixes from the extension region (after root+quality)
            var rootM = result.match(/^([A-G][#b]?)(m(?!aj))?/);
            if (rootM) {
                var root = rootM[0];
                var ext  = result.slice(root.length).replace(/\d+/g, '');
                result = root + ext;
            }
        }

        if (_opts.sus) {
            result = result.replace(/sus\d*/gi, '');
        }

        if (_opts.dimAug) {
            result = result.replace(/dim|aug/gi, '');
        }

        result = result.trim();
        return result || name;
    }

    // Apply simplified names to all chord templates in the current song.
    function _applyEasy() {
        const hw = window.highway;
        if (!hw) return;
        const templates = hw.getChordTemplates();
        if (!templates || !templates.length) return;

        // Snapshot originals once per song so restore works correctly
        if (!_origTemplates) {
            _origTemplates = templates.map(function (t) {
                return { name: t.name, displayName: t.displayName };
            });
        }

        for (var i = 0; i < templates.length; i++) {
            var t = templates[i];
            var origName = (_origTemplates[i] && _origTemplates[i].name) || t.name || '';
            var simplified = _simplify(origName);
            if (simplified !== origName) {
                t.name = simplified;
                t.displayName = simplified;
            }
        }
    }

    // Restore original template names.
    function _restore() {
        if (!_origTemplates) return;
        var hw = window.highway;
        if (!hw) return;
        var templates = hw.getChordTemplates();
        for (var i = 0; i < _origTemplates.length; i++) {
            if (templates[i]) {
                templates[i].name = _origTemplates[i].name;
                templates[i].displayName = _origTemplates[i].displayName;
            }
        }
        _origTemplates = null;
    }

    function _toggle() {
        _enabled = !_enabled;
        try { localStorage.setItem('simplify_chords_enabled', _enabled ? '1' : '0'); } catch (_) {}
        _updateBtn();
        if (_enabled) {
            _applyEasy();
        } else {
            _restore();
        }
    }

    function _updateBtn() {
        var btn = document.getElementById('simplify-chords-btn');
        if (!btn) return;
        btn.textContent = _enabled ? 'Simplify \u2713' : 'Simplify \u2717';
        btn.className = _enabled
            ? 'px-3 py-1.5 bg-purple-900/40 hover:bg-purple-900/60 rounded-lg text-xs text-purple-300 transition'
            : 'px-3 py-1.5 bg-dark-600 hover:bg-dark-500 rounded-lg text-xs text-gray-500 transition';
        btn.title = _enabled
            ? 'Simplify ON \u2014 chord names simplified (Am7\u2192Am, Cadd9\u2192C\u2026). Click to restore.'
            : 'Simplify \u2014 show beginner-friendly chord names (Am7\u2192Am, Cadd9\u2192C\u2026)';
    }

    function _injectBtn() {
        if (document.getElementById('simplify-chords-btn')) return;
        var controls = document.getElementById('player-controls');
        if (!controls) return;
        var btn = document.createElement('button');
        btn.id = 'simplify-chords-btn';
        btn.type = 'button';
        btn.textContent = 'Simplify';
        btn.onclick = _toggle;
        var lyricsBtn = document.getElementById('btn-lyrics');
        if (lyricsBtn) {
            lyricsBtn.parentNode.insertBefore(btn, lyricsBtn.nextSibling);
        } else {
            controls.appendChild(btn);
        }
        _updateBtn();
    }

    // On each new song (or arrangement switch), reset the snapshot and re-apply.
    function _onSongReady() {
        _origTemplates = null;
        if (_enabled) _applyEasy();
    }

    if (window.slopsmith && typeof window.slopsmith.on === 'function') {
        window.slopsmith.on('song:ready', _onSongReady);
    }

    // Public API for the settings page
    window._simplifyChords = {
        getOpts: function () { return Object.assign({}, _opts); },
        setOpt: function (key, val) {
            _opts[key] = !!val;
            _saveOpts();
            if (_enabled) { _restore(); _origTemplates = null; _applyEasy(); }
        }
    };

    _injectBtn();
})();
