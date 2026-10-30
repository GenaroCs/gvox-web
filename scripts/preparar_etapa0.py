"""Prepara únicamente carpetas y copias auxiliares; nunca escribe en los originales."""
import hashlib
import json
import shutil
from collections import Counter
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]
ORIGINAL = ROOT.parent / '00_MATERIAL_ORIGINAL'
RECORDS = ROOT / 'docs/registros'


def write_json(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def prepare():
    folders = [
        'pages', 'assets/css/base', 'assets/css/components', 'assets/css/pages',
        'assets/js/core', 'assets/js/components', 'assets/js/pages',
        'assets/js/services', 'assets/js/strategies/payment', 'data', 'docs/registros',
        'assets/img/branding', 'assets/img/portada', 'assets/img/login',
        'assets/img/videojuegos', 'assets/img/galerias', 'assets/img/comunidad',
        'herramientas/descargas',
    ]
    for folder in folders:
        (ROOT / folder).mkdir(parents=True, exist_ok=True)
    copies = {
        '02': ('02_PORTADA_AUTENTICACION/GVOX_02_PORTADA_AUTENTICACION',
               ['descargar_imagenes.mjs', 'manifest.json', 'fuentes.csv']),
        '03': ('03_CATALOGO', ['descargar_catalogo.mjs', 'juegos.json', 'fuentes_catalogo.csv']),
        '04': ('04_GALERIAS', ['descargar_galerias.mjs', 'galerias_plan.json', 'fuentes_y_destinos.csv']),
        '05': ('05_COMUNIDAD/GVOX_05_COMUNIDAD_PERFILES',
               ['descargar_comunidad.mjs', 'manifest_comunidad.json', 'fuentes_comunidad.csv']),
    }
    for package, (source, names) in copies.items():
        destination = ROOT / 'herramientas/descargas' / package
        destination.mkdir(parents=True, exist_ok=True)
        for name in names:
            target = destination / name
            if not target.exists():
                shutil.copy2(ORIGINAL / source / name, target)
    games = json.loads((ORIGINAL / '03_CATALOGO/juegos.json').read_text(encoding='utf-8'))
    galleries = json.loads((ORIGINAL / '04_GALERIAS/galerias_plan.json').read_text(encoding='utf-8'))
    assert {(g['id'], g['slug']) for g in games} == {(g['steam_appid'], g['slug']) for g in galleries}
    for game in games:
        for category in ('videojuegos', 'galerias'):
            (ROOT / 'assets/img' / category / game['slug']).mkdir(parents=True, exist_ok=True)
    inventory = []
    domains = set()

    def inspect(value):
        if isinstance(value, dict):
            for key, item in value.items():
                if key in ('archivo', 'destino') and isinstance(item, str):
                    assert not Path(item).is_absolute() and '..' not in Path(item).parts, item
                inspect(item)
        elif isinstance(value, list):
            for item in value:
                inspect(item)
        elif isinstance(value, str) and value.startswith('http'):
            parsed = urlparse(value)
            assert parsed.scheme == 'https', value
            assert parsed.hostname == 'store.steampowered.com' or parsed.hostname.endswith('.steamstatic.com'), value
            domains.add(parsed.hostname)

    for path in sorted(ORIGINAL.rglob('*')):
        if not path.is_file():
            continue
        inventory.append({'ruta': path.relative_to(ORIGINAL).as_posix(), 'bytes': path.stat().st_size,
                          'sha256': digest(path), 'extension': path.suffix.lower()})
        if path.suffix == '.json':
            inspect(json.loads(path.read_text(encoding='utf-8-sig')))
    write_json(RECORDS / 'inventario-originales.json', inventory)
    write_json(RECORDS / 'revision-descargadores.json', {
        'node_observado': 'v24.21.0', 'dependencias_instaladas': [],
        'dominios_declarados_revisados': sorted(domains),
        'scripts': [f'herramientas/descargas/{p}/{names[0]}' for p, (_, names) in copies.items()],
        'observaciones': [
            'Solo se ejecutan copias MJS con Node, nunca BAT ni scripts de demostración.',
            'Descargan imágenes desde CDN Steam; 04 y 05 consultan metadata pública Steam solo durante preparación.',
            'Destinos declarados relativos sin recorrido fuera de la carpeta de trabajo.',
            '02 y 03 validan firma JPEG; 04 y 05 validan MIME, firma y tamaño.',
            'La consolidación vuelve a decodificar las imágenes y conserva el formato real.',
            'La aplicación definitiva usará datos locales, sin llamadas a estos servicios.',
        ],
    })
    print(json.dumps({'archivos_originales': len(inventory), 'extensiones': dict(Counter(x['extension'] for x in inventory)),
                      'juegos': len(games), 'dominios': sorted(domains)}, ensure_ascii=False))


if __name__ == '__main__':
    if (ROOT / 'index.html').exists():
        raise SystemExit('El prototipo ya está implementado. No sobrescribir con la preparación inicial.')
    prepare()
