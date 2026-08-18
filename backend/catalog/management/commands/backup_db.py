from datetime import datetime
from pathlib import Path
import os
import shutil
import subprocess

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError
from django.db import connection


class Command(BaseCommand):
    help = 'Write a timestamped database backup (SQLite copy or pg_dump).'

    def add_arguments(self, parser):
        parser.add_argument(
            '--output-dir',
            default=str(settings.BASE_DIR / 'backups'),
            help='Directory for backup files.',
        )

    def handle(self, *args, **options):
        out_dir = Path(options['output_dir'])
        out_dir.mkdir(parents=True, exist_ok=True)
        stamp = datetime.now().strftime('%Y%m%d-%H%M%S')
        vendor = connection.vendor

        if vendor == 'sqlite':
            source = Path(settings.DATABASES['default']['NAME'])
            if not source.exists():
                raise CommandError(f'SQLite database not found: {source}')
            dest = out_dir / f'kaka-{stamp}.sqlite3'
            shutil.copy2(source, dest)
            self.stdout.write(self.style.SUCCESS(f'Wrote {dest}'))
            return

        if vendor == 'postgresql':
            dest = out_dir / f'kaka-{stamp}.sql'
            env = os.environ.copy()
            cfg = settings.DATABASES['default']
            host = cfg.get('HOST') or 'localhost'
            port = str(cfg.get('PORT') or '5432')
            name = cfg.get('NAME')
            user = cfg.get('USER') or ''
            password = cfg.get('PASSWORD') or ''
            if password:
                env['PGPASSWORD'] = password
            cmd = ['pg_dump', '-h', host, '-p', port]
            if user:
                cmd += ['-U', user]
            cmd += ['-d', str(name), '-f', str(dest)]
            try:
                subprocess.run(cmd, check=True, env=env)
            except FileNotFoundError as exc:
                raise CommandError('pg_dump is not on PATH. Install PostgreSQL client tools.') from exc
            except subprocess.CalledProcessError as exc:
                raise CommandError(f'pg_dump failed with exit {exc.returncode}.') from exc
            self.stdout.write(self.style.SUCCESS(f'Wrote {dest}'))
            return

        raise CommandError(f'No backup handler for {vendor}.')
