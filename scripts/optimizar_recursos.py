"""Deriva WebP por uso sin alterar los originales. Usa Pillow ya disponible."""
import hashlib
import json
import shutil
from collections import Counter
from io import BytesIO
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
ORIGINAL = ROOT.parent / '00_MATERIAL_ORIGINAL'
RECORDS = ROOT / 'docs/registros'
PACKAGE_ROOTS = {
    '02': ORIGINAL / '02_PORTADA_AUTENTICACION/GVOX_02_PORTADA_AUTENTICACION',
    '03': ORIGINAL / '03_CATALOGO', '04': ORIGINAL / '04_GALERIAS',
    '05': ORIGINAL / '05_COMUNIDAD/GVOX_05_COMUNIDAD_PERFILES',
}
PROFILES = {
    'branding': (800, 400), 'portada': (600, 900), 'cabecera': (920, 430),
    'tarjeta': (800, 460), 'hero': (1600, 900), 'login': (900, 1200),
    'galeria': (1600, 1000), 'banner': (1600, 900), 'avatar': (256, 256),
    'publicacion': (1200, 800), 'actividad': (320, 180),
}


def read(path):
    return json.loads(path.read_text(encoding='utf-8-sig'))


def write(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')


def digest(value):
    return hashlib.sha256(value).hexdigest()


def profile(entry):
    use = entry['uso'].lower()
    if entry['paquete'] == '01': return 'branding'
    if entry['paquete'] == '02':
        return 'login' if use.startswith('login') else 'tarjeta' if 'tarjeta' in use else 'hero'
    if entry['paquete'] == '03':
        return {'portada_vertical': 'portada', 'cabecera': 'cabecera', 'tarjeta_horizontal': 'tarjeta'}[use]
    if entry['paquete'] == '04': return 'galeria' if use == 'captura' else 'banner'
    return {'avatares': 'avatar', 'banners': 'banner', 'publicaciones': 'publicacion', 'actividad': 'actividad'}[use]


def destination(entry, kind):
    game = entry['juego_id']
    if kind == 'branding':
        return Path(entry['ruta']).with_suffix('.webp')
    if entry['paquete'] == '03':
        return Path(f"assets/img/videojuegos/{game}/{entry['uso']}.webp")
    if entry['paquete'] == '04':
        name = 'banner' if kind == 'banner' else f"captura_{int(entry['id'].rsplit(':', 1)[1]):02d}"
        return Path(f'assets/img/galerias/{game}/{name}.webp')
    if entry['paquete'] == '02':
        area = 'login' if kind == 'login' else 'portada'
        return Path(f"assets/img/{area}/{game}/{entry['id']}.webp")
    return Path(f"assets/img/comunidad/{entry['uso']}/{game}--{entry['id']}.webp")


def main():
    archive_path = RECORDS / 'originales-descargados.json'
    if archive_path.exists():
        raise SystemExit('Las versiones optimizadas ya existen. No sobrescribir el inventario.')
    source_manifest = read(ROOT / 'data/recursos.json')
    entries = source_manifest['recursos']
    write(RECORDS / 'recursos-antes-optimizacion.json', source_manifest)
    unique_sources = {entry['sha256']: ROOT / entry['ruta'] for entry in entries}
    original_bytes = sum(p.stat().st_size for p in unique_sources.values())
    archives, source_paths = [], {}
    # Añadido autorizado por el usuario: conservar los binarios descargados sin compresión.
    for entry in entries:
        fingerprint = entry['sha256']
        if fingerprint in source_paths:
            continue
        if entry['paquete'] == '01':
            saved = ROOT.parent / entry['origen_preparacion']
        else:
            relative = Path(entry['origen_preparacion']).parts
            marker = relative.index(entry['paquete'])
            saved = PACKAGE_ROOTS[entry['paquete']].joinpath(*relative[marker + 1:])
            saved = saved.with_suffix(entry['extension'])
            assert not saved.exists(), saved
            saved.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(unique_sources[fingerprint], saved)
            assert digest(saved.read_bytes()) == fingerprint
            archives.append({'ruta': saved.relative_to(ORIGINAL).as_posix(), 'sha256': fingerprint,
                             'bytes': saved.stat().st_size, 'fuente_url': entry['fuente_url']})
        source_paths[fingerprint] = saved
    # Guardar trazabilidad antes de retirar las copias de trabajo sin optimizar.
    write(archive_path, archives)
    outputs, variants, replacements = {}, {}, {}
    for entry in entries:
        original_hash = entry['sha256']
        entry['original'] = {'ruta': source_paths[original_hash].relative_to(ROOT.parent).as_posix(),
                             'sha256': original_hash, 'bytes': entry['bytes']}
        old_path = entry['ruta']
        kind = profile(entry)
        if entry['formato'] in ('SVG', 'ICO'):
            entry.update({'perfil': 'vector-o-favicon', 'loading': 'eager', 'decoding': 'async',
                          'fetchpriority': 'auto'})
            outputs[entry['sha256']] = ROOT / entry['ruta']
            continue
        key = (original_hash, kind)
        if key not in variants:
            with Image.open(source_paths[original_hash]) as image:
                image = ImageOps.exif_transpose(image)
                image.thumbnail(PROFILES[kind], Image.Resampling.LANCZOS)
                image = image.convert('RGBA' if 'A' in image.getbands() else 'RGB')
                stream = BytesIO()
                image.save(stream, 'WEBP', quality=88, method=6, lossless=(kind == 'branding'))
                payload = stream.getvalue()
                fingerprint = digest(payload)
                target = outputs.get(fingerprint, ROOT / destination(entry, kind))
                if fingerprint not in outputs:
                    assert not target.exists(), target
                    target.parent.mkdir(parents=True, exist_ok=True)
                    target.write_bytes(payload)
                    with Image.open(target) as check:
                        check.verify()
                    with Image.open(target) as check:
                        check.load()
                    outputs[fingerprint] = target
                variants[key] = {'ruta': target.relative_to(ROOT).as_posix(), 'bytes': len(payload),
                                 'sha256': fingerprint, 'ancho': image.width, 'alto': image.height}
        entry.update(variants[key])
        entry.update({'formato': 'WEBP', 'extension': '.webp', 'perfil': kind,
                      'validacion': 'Pillow: WebP verificado y decodificado', 'decoding': 'async',
                      'loading': 'eager' if entry['id'] == 'hero-principal-metaphor' else 'lazy',
                      'fetchpriority': 'high' if entry['id'] == 'hero-principal-metaphor' else 'auto'})
        replacements.setdefault(old_path, entry['ruta'])
    write(ROOT / 'data/recursos.json', {'rutas_relativas_a': 'gvox-web/', 'recursos': entries,
          'nota': 'WebP por uso; SVG vectorial y favicon ICO conservados. Rutas deduplicadas por SHA-256.'})
    # Actualizar los datos locales para que ninguna ficha apunte a un JPG retirado.
    def rewrite(value):
        if isinstance(value, str): return replacements.get(value, value)
        if isinstance(value, list): return [rewrite(x) for x in value]
        if isinstance(value, dict): return {k: rewrite(v) for k, v in value.items()}
        return value
    for name in ('juegos.json', 'galerias.json'):
        path = ROOT / 'data' / name
        write(path, rewrite(read(path)))
    write(ROOT / 'data/comunidad-recursos.json', [e for e in entries if e['paquete'] == '05'])
    for path in unique_sources.values():
        if path.suffix.lower() not in ('.svg', '.ico'):
            assert path.is_relative_to(ROOT / 'assets/img')
            path.unlink()
    initial = [e for e in entries if e['id'] == 'hero-principal-metaphor']
    initial += [next(e for e in entries if e['paquete'] == '03' and e['juego_id'] == game and e['uso'] == 'tarjeta_horizontal')
                for game in ('metaphor-refantazio', 'persona-3-reload', 'persona-5-royal', 'elden-ring', 'hades-ii')]
    initial += [e for e in entries if e['paquete'] == '02' and e['id'].startswith('promo-')][:3]
    initial += [next(e for e in entries if e['id'] == name)
                for name in ('branding-gvox-horizontal-oscuro.svg', 'branding-favicon.ico')]
    budget = {e['ruta']: e['bytes'] for e in initial}
    write(ROOT / 'data/portada-presupuesto.json', {
        'estado': 'Plan de recursos; la pantalla todavía no está implementada',
        'limite_total_aproximado_bytes': 3000000, 'reserva_html_css_js_bytes': 600000,
        'imagenes_incluidas': budget, 'total_imagenes_bytes': sum(budget.values()),
        'estimacion_con_reserva_bytes': sum(budget.values()) + 600000,
        'cumple_presupuesto_estimado': sum(budget.values()) + 600000 <= 3000000,
        'nota': 'Incluye conservadoramente tarjetas que podrán cargarse con lazy loading. Medir red y caché vacía en Etapa 1.',
    })
    optimized_bytes = sum(p.stat().st_size for p in outputs.values())
    report = {'originales_utilizados_unicos': len(unique_sources), 'originales_utilizados_bytes': original_bytes,
              'archivos_optimizados_unicos': len(outputs), 'optimizados_bytes': optimized_bytes,
              'ahorro_bytes': original_bytes - optimized_bytes,
              'ahorro_porcentaje': round((1 - optimized_bytes / original_bytes) * 100, 2),
              'formatos_finales': dict(Counter(p.suffix for p in outputs.values())),
              'nuevos_originales_archivados': len(archives), 'perfiles_maximos': PROFILES,
              'calidad_webp': 88, 'branding_raster_lossless': True, 'sin_ampliacion': True,
              'imagenes_originales_no_usadas': 'Capturas de maquetas, vista previa y arte conceptual; no cuentan en el ahorro.',
              'portada_imagenes_bytes': sum(budget.values()),
              'portada_con_reserva_bytes': sum(budget.values()) + 600000}
    write(RECORDS / 'optimizacion.json', report)
    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
