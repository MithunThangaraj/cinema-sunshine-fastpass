#!/usr/bin/env python3
import argparse
import csv
from datetime import date, time
from pathlib import Path

ROOT = Path(__file__).resolve().parent
DATA = ROOT / 'data' / 'watched.csv'
FIELDS = ['id', 'movie', 'date', 'time', 'cinema', 'screen', 'seat', 'format', 'notes']


def read():
    if not DATA.exists():
        return []
    with DATA.open(newline='', encoding='utf-8') as f:
        return list(csv.DictReader(f))


def save(rows):
    DATA.parent.mkdir(exist_ok=True)
    temp = DATA.with_suffix('.tmp')
    with temp.open('w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=FIELDS)
        writer.writeheader()
        writer.writerows(rows)
    temp.replace(DATA)
    export(rows)


def clean(value):
    import html
    return html.escape(value).replace('|', '&#124;').replace('\n', ' ').replace('\r', ' ')


def export(rows):
    lines = ['# Movies watched', '', '| Movie | Date | Time | Cinema | Screen | Seat | Format | Notes |',
             '| --- | --- | --- | --- | --- | --- | --- | --- |']
    for row in sorted(rows, key=lambda r: (r['date'], r['time']), reverse=True):
        lines.append('| ' + ' | '.join(clean(row[k]) for k in FIELDS[1:]) + ' |')
    if not rows:
        lines += ['', 'No movies added yet.']
    (ROOT / 'WATCHED.md').write_text('\n'.join(lines) + '\n', encoding='utf-8')


def main():
    parser = argparse.ArgumentParser(description='My movie log')
    commands = parser.add_subparsers(dest='command', required=True)
    for command in ['add', 'edit']:
        sub = commands.add_parser(command)
        if command == 'edit':
            sub.add_argument('id')
        sub.add_argument('--movie', required=command == 'add')
        sub.add_argument('--date', required=command == 'add', help='YYYY-MM-DD')
        sub.add_argument('--time', help='HH:MM')
        sub.add_argument('--cinema', default='Grand Cinema Sunshine Ikebukuro' if command == 'add' else None)
        sub.add_argument('--screen')
        sub.add_argument('--seat', required=command == 'add')
        sub.add_argument('--format')
        sub.add_argument('--notes')
    commands.add_parser('list')
    commands.add_parser('export')
    commands.add_parser('delete').add_argument('id')
    args = parser.parse_args()
    rows = read()
    if args.command in ['add', 'edit']:
        if args.date:
            try:
                if date.fromisoformat(args.date).isoformat() != args.date:
                    raise ValueError()
            except ValueError:
                parser.error('Date must be YYYY-MM-DD.')
        if args.time:
            try:
                if time.fromisoformat(args.time).strftime('%H:%M') != args.time:
                    raise ValueError()
            except ValueError:
                parser.error('Time must be HH:MM.')
        for key in ['movie', 'seat']:
            value = getattr(args, key)
            if value is not None and not value.strip():
                parser.error(key + ' cannot be blank.')
        if args.command == 'add':
            row = {k: getattr(args, k, '') or '' for k in FIELDS}
            row['id'] = str(max((int(r['id']) for r in rows), default=0) + 1)
            rows.append(row)
        else:
            row = next((r for r in rows if r['id'] == args.id), None)
            if row is None:
                parser.error('No movie with that ID.')
            for key in FIELDS[1:]:
                if getattr(args, key) is not None:
                    row[key] = getattr(args, key)
        save(rows)
        print('Saved movie ' + row['id'])
    elif args.command == 'delete':
        updated = [r for r in rows if r['id'] != args.id]
        if len(updated) == len(rows):
            parser.error('No movie with that ID.')
        save(updated)
        print('Deleted movie ' + args.id)
    elif args.command == 'export':
        export(rows)
        print('Updated WATCHED.md')
    else:
        for row in sorted(rows, key=lambda r: (r['date'], r['time']), reverse=True):
            print(f"{row['id']}: {row['movie']}  {row['date']} {row['time']}  {row['cinema']}  Screen {row['screen']}  Seat {row['seat']}")
        if not rows:
            print('No movies added yet.')


if __name__ == '__main__':
    main()
