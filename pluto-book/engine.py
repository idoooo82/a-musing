"""Headless browser wrapper around film.html (one Chromium with SwiftShader WebGL)."""
import os, time, base64, numpy as np, cv2
from playwright.sync_api import sync_playwright
D = os.path.dirname(os.path.abspath(__file__))
ARGS = ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--disable-web-security', '--allow-file-access-from-files']

class Engine:
    def __enter__(self):
        self.pw = sync_playwright().start()
        self.b = self.pw.chromium.launch(executable_path='/opt/pw-browsers/chromium', args=ARGS)
        self.pg = self.b.new_page(viewport={'width': 1920, 'height': 1080})
        self.errors = []
        self.pg.on('console', lambda m: self.errors.append(m.text) if m.type == 'error' else None)
        self.pg.on('pageerror', lambda e: self.errors.append(str(e)))
        self.pg.goto('file://' + D + '/film.html' + ('?nobook' if os.environ.get('NOBOOK') else ''))
        for _ in range(600):
            st = self.pg.evaluate('[window.READY||false, window.ERR||null]')
            if st[0] or st[1]: break
            time.sleep(.1)
        if st[1] or self.errors: raise RuntimeError('film.html failed: ' + str(st[1]) + ' ' + ' | '.join(self.errors))
        if not st[0]: raise RuntimeError('film.html not ready')
        self.timeline = self.pg.evaluate('timeline()')
        return self

    def __exit__(self, *a):
        try: self.b.close()
        finally: self.pw.stop()

    def index(self, sid): return [s['id'] for s in self.timeline].index(sid)

    def _grab(self):
        buf = self.pg.screenshot(type='jpeg', quality=95)
        return cv2.imdecode(np.frombuffer(buf, np.uint8), cv2.IMREAD_COLOR)

    def page(self, k, n, amb=0.0):
        self.pg.evaluate(f'AMB_OFF={amb};renderPage({k},{n})')
        if self.errors: raise RuntimeError(' | '.join(self.errors))
        return self._grab()

    def blank(self):
        self.pg.evaluate('renderBlank()'); return self._grab()
