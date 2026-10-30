"""Auditoría de rutas, bytes, dimensiones y decodificación de recursos finales."""
import hashlib
import json
from pathlib import Path
from PIL import Image, ImageOps, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]


def read(path):
    return json.loads(path.read_text(encoding='utf-8-sig'))


def main():
    resources = read(ROOT / 'data/recursos.json')['recursos']
    physical = {e['ruta']: e for e in resources}
    fingerprints = set()
    for relative, entry in physical.items():
        path = ROOT / relative
        assert path.is_relative_to(ROOT / 'assets/img'), relative
        assert path.stat().st_size == entry['bytes'], relative
        fingerprint = hashlib.sha256(path.read_bytes()).hexdigest()
        assert fingerprint == entry['sha256'], relative
        assert fingerprint not in fingerprints, f'Duplicado: {relative}'
        fingerprints.add(fingerprint)
        if entry['formato'] == 'WEBP':
            with Image.open(path) as image:
                assert image.format == 'WEBP' and (image.width, image.height) == (entry['ancho'], entry['alto'])
                image.verify()
            with Image.open(path) as image:
                image.load()
    for entry in resources:
        path = ROOT.parent / entry['original']['ruta']
        assert any(path.resolve().is_relative_to(ROOT.parent / folder) for folder in ['00_MATERIAL_ORIGINAL', 'referencias'])
        assert hashlib.sha256(path.read_bytes()).hexdigest() == entry['original']['sha256']
    def check(value):
        if isinstance(value, str) and value.startswith('assets/img/'):
            assert (ROOT / value).is_file(), value
        elif isinstance(value, list):
            for item in value: check(item)
        elif isinstance(value, dict):
            for item in value.values(): check(item)
    for path in (ROOT / 'data').glob('*.json'):
        check(read(path))
    actual = {p.relative_to(ROOT).as_posix() for p in (ROOT / 'assets/img').rglob('*') if p.is_file()}
    assert actual == set(physical), 'Archivos sin inventariar o ausentes'
    assert len(list((ROOT / 'pages').glob('*.html'))) == 7 and (ROOT / 'index.html').is_file()
    assert len(list((ROOT / 'assets/js/pages').glob('*.js'))) == 8
    games = read(ROOT / 'data/juegos.json')
    gallery = read(ROOT / 'data/galerias.json')
    assert {x['id'] for x in games} == {x['juego_id'] for x in gallery}
    assert all(len(x['capturas']) >= 3 for x in gallery)
    assert sum(bool(x['banner']) for x in gallery) == 8
    # Hoja de inspección visual de las portadas reales; solo documentación, fuera del sitio.
    sheet = Image.new('RGB', (1100, 1120), '#090d0d')
    drawing = ImageDraw.Draw(sheet)
    font = ImageFont.truetype('C:/Windows/Fonts/arial.ttf', 12)
    for i, game in enumerate(games):
        x, y = (i % 5) * 220, (i // 5) * 280
        with Image.open(ROOT / game['imagenes']['portada_vertical']) as image:
            thumb = ImageOps.contain(image.convert('RGB'), (165, 245), Image.Resampling.LANCZOS)
            sheet.paste(thumb, (x + (220 - thumb.width) // 2, y))
        drawing.text((x + 8, y + 250), game['nombre'][:29], font=font, fill='#d5ff51')
    sheet.save(ROOT / 'docs/registros/contacto-portadas.webp', quality=90)
    result = {'estado': 'CORRECTO', 'referencias_logicas': len(resources), 'archivos_unicos': len(physical),
              'rutas_y_huellas_correctas': True, 'duplicados_binarios': 0,
              'webp_decodificados': sum(e['formato'] == 'WEBP' for e in physical.values()),
              'originales_verificados': True, 'juegos_consistentes': len(games),
              'pantallas_desarrolladas': 8, 'entradas_de_pagina': 8}
    (ROOT / 'docs/registros/final/verificacion-recursos.json').write_text(
        json.dumps(result, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(json.dumps(result, ensure_ascii=False))


if __name__ == '__main__':
    main()
