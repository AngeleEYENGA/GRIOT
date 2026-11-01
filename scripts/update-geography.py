"""Refresh the reduced CC BY 4.0 GeoNames catalogue; review before publishing."""
from datetime import date
from pathlib import Path
import hashlib
import io
import json
import urllib.request
import zipfile

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / 'griot-frontend/public/data'
SOURCE = ROOT / 'griot-frontend/src/data'
BASE = 'https://download.geonames.org/export/dump/'


def main():
    hashes = {}

    def get(name):
        with urllib.request.urlopen(BASE + name, timeout=60) as response:
            data = response.read()
        hashes[name] = hashlib.sha256(data).hexdigest()
        return data

    countries = []
    for line in get('countryInfo.txt').decode().splitlines():
        if not line or line.startswith('#'):
            continue
        fields = line.split('\t')
        countries.append({'code': fields[0], 'name': fields[4]})
    regions = {}
    for line in get('admin1CodesASCII.txt').decode().splitlines():
        fields = line.split('\t')
        regions[fields[0]] = fields[1]
    cities = []
    with zipfile.ZipFile(io.BytesIO(get('cities15000.zip'))) as archive:
        for line in archive.read('cities15000.txt').decode().splitlines():
            f = line.split('\t')
            cities.append([int(f[0]), f[1], f[8], round(float(f[4]), 5), round(float(f[5]), 5), regions.get(f[8] + '.' + f[10], ''), int(f[14] or 0), f[2] if f[2] != f[1] else ''])
    cities.sort(key=lambda city: city[6], reverse=True)
    if len(cities) < 20000 or len(countries) < 200:
        raise ValueError('Unexpectedly small catalogue; existing files have not been replaced.')
    PUBLIC.mkdir(parents=True, exist_ok=True)
    SOURCE.mkdir(parents=True, exist_ok=True)
    (SOURCE / 'countries.json').write_text(json.dumps(countries, ensure_ascii=False, separators=(',', ':')), encoding='utf8')
    (PUBLIC / 'cities.json').write_text(json.dumps(cities, ensure_ascii=False, separators=(',', ':')), encoding='utf8')
    metadata = {
        'source': 'GeoNames', 'retrieved': date.today().isoformat(),
        'license': 'CC BY 4.0', 'attribution': 'https://www.geonames.org/',
        'columns': ['id', 'name', 'countryCode', 'latitude', 'longitude', 'region', 'population', 'asciiName'],
        'cities': len(cities), 'countries': len(countries), 'source_sha256': hashes,
    }
    (PUBLIC / 'geonames-source.json').write_text(json.dumps(metadata, ensure_ascii=False, indent=2), encoding='utf8')
    print(f'Updated {len(countries)} countries/territories and {len(cities)} cities. Review the diff before publishing.')


if __name__ == '__main__':
    main()
