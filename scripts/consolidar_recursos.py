"""Consolida los recursos de Etapa 0. Requiere Pillow del runtime ya disponible.
No implementa funcionalidades de Gvox ni modifica las fuentes originales.
"""
import hashlib
import json
import shutil
import xml.etree.ElementTree as ET
from collections import Counter
from datetime import datetime, timezone, timedelta
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
ORIGINAL = ROOT.parent / '00_MATERIAL_ORIGINAL'
WORK = ROOT / 'herramientas/descargas'
RECORDS = ROOT / 'docs/registros'


def read(path):
    return json.loads(path.read_text(encoding='utf-8-sig'))


def write(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def validate(path):
    if path.suffix.lower() == '.svg':
        root = ET.fromstring(path.read_bytes())
        assert root.tag.endswith('svg'), path
        assert not any(el.tag.endswith('script') for el in root.iter()), path
        return {'formato': 'SVG', 'extension': '.svg', 'validacion': 'XML SVG sin scripts'}
    with Image.open(path) as image:
        fmt, width, height = image.format, image.width, image.height
        image.verify()
    with Image.open(path) as image:
        image.load()
    extension = {'JPEG': '.jpg', 'PNG': '.png', 'WEBP': '.webp', 'AVIF': '.avif', 'ICO': '.ico'}[fmt]
    return {'formato': fmt, 'extension': extension, 'ancho': width, 'alto': height,
            'validacion': 'Pillow: verify y decodificación completa'}


def main():
    manifest_path = ROOT / 'data/recursos.json'
    if manifest_path.exists():
        raise SystemExit('La consolidación ya existe. Revisar el inventario antes de repetirla.')
    games = read(ORIGINAL / '03_CATALOGO/juegos.json')
    by_id = {g['id']: g for g in games}
    by_name = {g['nombre']: g for g in games}
    records, physical, failures = [], {}, []

    def add(package, asset_id, source, target, *, game_id=None, use='', url=None, download=None):
        try:
            checked = validate(source)
        except Exception as error:
            failures.append({'paquete': package, 'id': asset_id, 'origen': str(source), 'error': str(error)})
            return None
        fingerprint = sha(source)
        destination = ROOT / Path(target).with_suffix(checked['extension'])
        if fingerprint in physical:
            destination = physical[fingerprint]
        else:
            assert not destination.exists(), destination
            destination.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(source, destination)
            assert sha(destination) == fingerprint
            physical[fingerprint] = destination
        relative = destination.relative_to(ROOT).as_posix()
        entry = {'id': asset_id, 'paquete': package, 'juego_id': by_id[game_id]['slug'] if game_id else None,
                 'steam_appid': game_id, 'uso': use, 'ruta': relative, 'sha256': fingerprint,
                 'bytes': destination.stat().st_size, 'fuente_url': url,
                 'origen_preparacion': source.relative_to(ROOT.parent).as_posix(), **checked}
        records.append(entry)
        # Retira solo binarios temporales ya copiados y verificados dentro de herramientas.
        # Conserva scripts, JSON, CSV y registros. Nunca retira material original.
        if download is not None:
            assert source.is_relative_to(WORK)
            source.unlink()
        return relative

    brand = ORIGINAL / '01_IDENTIDAD/GVOX_01_IDENTIDAD'
    for group in ('logos', 'fondos', 'etiquetas'):
        for path in sorted((brand / group).iterdir()):
            add('01', f'branding-{path.name}', path, f'assets/img/branding/{group}/{path.name}', use=group)

    summaries = {}
    log02 = read(WORK / '02/estado-descarga.json')
    plan02 = read(WORK / '02/manifest.json')['recursos']
    log03 = read(WORK / '03/estado_descarga.json')
    log04 = read(WORK / '04/estado_descarga.json')
    plan04 = read(WORK / '04/galerias_plan.json')
    log05 = read(WORK / '05/estado_descarga.json')
    plan05 = read(WORK / '05/manifest_comunidad.json')
    # Priorizar las portadas del catálogo para compartirlas con el acceso y las promociones.
    catalog_paths = {}
    for entry in log03:
        game = by_name[entry['juego']]
        if entry['estado'] == 'OK':
            path = add('03', f"{game['slug']}:{entry['tipo']}", WORK / '03' / entry['archivo'],
                       f"assets/img/videojuegos/{game['slug']}/{Path(entry['archivo']).name}",
                       game_id=game['id'], use=entry['tipo'], url=entry['url'], download=True)
            catalog_paths[(game['slug'], entry['tipo'])] = path
    for entry in log02:
        if entry['estado'] != 'OK':
            continue
        item = next(x for x in plan02 if x['id'] == entry['id'])
        slug = by_id[item['steam_appid']]['slug']
        area = 'login' if '/login/' in item['archivo'] else 'portada'
        path = add('02', item['id'], WORK / '02' / entry['archivo'],
                   f"assets/img/{area}/{slug}/{Path(entry['archivo']).name}",
                   game_id=item['steam_appid'], use=item['uso'], url=entry['origen'], download=True)
    for entry in log04:
        if entry['estado'] != 'OK':
            continue
        game = by_name[entry['juego']]
        add('04', f"{game['slug']}:{entry['tipo']}:{entry.get('numero', 0)}",
            WORK / '04' / entry['archivo'],
            f"assets/img/galerias/{game['slug']}/{Path(entry['archivo']).name}",
            game_id=game['id'], use=entry['tipo'], url=entry['url'], download=True)
    for entry in log05:
        if entry['status'] not in ('OK', 'EXISTENTE'):
            continue
        item = next(x for x in plan05 if x['id'] == entry['id'])
        slug = by_id[item['steam_appid']]['slug']
        add('05', item['id'], WORK / '05' / entry['path'],
            f"assets/img/comunidad/{item['grupo']}/{slug}--{Path(entry['path']).name}",
            game_id=item['steam_appid'], use=item['grupo'], url=entry.get('fuente'), download=True)

    for package, log, expected in [('02', log02, len(plan02)), ('03', log03, len(games) * 3),
                                   ('04', log04, sum(g['cantidad_capturas_previstas'] + bool(g['destacado']) for g in plan04)),
                                   ('05', log05, len(plan05))]:
        errors = [x for x in log if x.get('estado', x.get('status')) not in ('OK', 'EXISTENTE')]
        summaries[package] = {'previstos': expected, 'disponibles': sum(r['paquete'] == package for r in records),
                              'incidencias_descargador': errors}
        write(RECORDS / f'descarga-{package}-resultado.json', log)
    write(manifest_path, {'rutas_relativas_a': 'gvox-web/', 'recursos': records,
                         'nota': 'Varias referencias pueden apuntar a un mismo archivo; deduplicación SHA-256.'})
    for game in games:
        game['steam_appid'] = game['id']
        game['id'] = game['slug']
        game['imagenes'] = {kind: catalog_paths.get((game['slug'], kind)) for kind in game['imagenes']}
        game['datos_de_demostracion'] = True
    write(ROOT / 'data/juegos.json', games)
    gallery_data = []
    for game in games:
        selected = [x for x in records if x['paquete'] == '04' and x['juego_id'] == game['id']]
        gallery_data.append({'juego_id': game['id'], 'steam_appid': game['steam_appid'],
                             'capturas': [x['ruta'] for x in selected if x['uso'] == 'captura'],
                             'banner': next((x['ruta'] for x in selected if x['uso'] == 'banner'), None)})
    write(ROOT / 'data/galerias.json', gallery_data)
    write(ROOT / 'data/comunidad-recursos.json', [x for x in records if x['paquete'] == '05'])
    original_images = []
    for path in sorted(ORIGINAL.rglob('*')):
        if path.suffix.lower() in ('.jpg', '.jpeg', '.png', '.webp', '.avif', '.ico', '.svg'):
            original_images.append({'ruta': path.relative_to(ORIGINAL).as_posix(), **validate(path),
                                    'solo_referencia': path.parts[len(ORIGINAL.parts)] != '01_IDENTIDAD'})
    write(RECORDS / 'validacion-imagenes-originales.json', original_images)
    first_attempt = read(RECORDS / 'descarga-04-primer-intento.json')
    report = {
        'fecha_lima': datetime.now(timezone(timedelta(hours=-5))).isoformat(),
        'paquetes': summaries, 'recursos_referenciados': len(records),
        'archivos_unicos': len(physical), 'referencias_sin_duplicar_archivo': len(records) - len(physical),
        'formatos_archivos_unicos': dict(Counter(validate(p)['formato'] for p in physical.values())),
        'fallos_validacion': failures,
        'faltantes': [dict(paquete=k, cantidad=v['previstos'] - v['disponibles'])
                      for k, v in summaries.items() if v['previstos'] != v['disponibles']],
        'incidencias_primer_intento_04': [x for x in first_attempt if x['estado'] != 'OK'],
    }
    write(RECORDS / 'resultado-etapa0.json', report)
    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
