"""Pluto lab: draw Pluto on black with given options. usage: python3 lab.py out.jpg 'JSON opts list'"""
import sys, json, cv2
from engine import Engine
out, cfg = sys.argv[1], json.loads(sys.argv[2])
with Engine() as E:
    js = """(cfg)=>{ const g=P; g.setTransform(1,0,0,1,0,0); g.fillStyle='#05060c'; g.fillRect(0,0,1920,1080);
      const n=cfg.length, w=1920/n; cfg.forEach((o,i)=>{ const r=o.r||Math.min(w*.42,430); drawPluto(g, w*(i+.5), 540, r, o); }); }"""
    E.pg.evaluate(js, cfg)
    cv2.imwrite(out, E._grab(), [cv2.IMWRITE_JPEG_QUALITY, 92])
