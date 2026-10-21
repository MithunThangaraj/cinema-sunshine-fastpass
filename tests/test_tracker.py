import contextlib
import importlib.util
import io
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

spec = importlib.util.spec_from_file_location('tracker', Path(__file__).resolve().parents[1] / 'tracker.py')
tracker = importlib.util.module_from_spec(spec)
spec.loader.exec_module(tracker)


class TrackerTest(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.addCleanup(patch.stopall)
        patch.object(tracker, 'ROOT', self.root).start()
        patch.object(tracker, 'DATA', self.root / 'data/watched.csv').start()

    def run_command(self, *args):
        with patch('sys.argv', ['tracker.py', *args]), contextlib.redirect_stdout(io.StringIO()), contextlib.redirect_stderr(io.StringIO()):
            tracker.main()

    def test_add_edit_delete_and_readable_export(self):
        self.run_command('add', '--movie', '映画 | Test', '--date', '2026-10-30', '--time', '19:00', '--seat', 'N-20', '--notes', 'Nice, clear view')
        row = tracker.read()[0]
        self.assertEqual(row['notes'], 'Nice, clear view')
        self.assertEqual(row['cinema'], 'Grand Cinema Sunshine Ikebukuro')
        self.assertIn('映画 &#124; Test', (self.root / 'WATCHED.md').read_text())
        self.run_command('edit', '1', '--seat', 'N-21')
        self.assertEqual(tracker.read()[0]['seat'], 'N-21')
        self.run_command('delete', '1')
        self.assertEqual(tracker.read(), [])
        self.assertIn('No movies added yet.', (self.root / 'WATCHED.md').read_text())

    def test_bad_dates_and_missing_ids_do_not_change_log(self):
        for args in [('add', '--movie', 'Test', '--date', '2026-02-30', '--seat', 'N-20'),
                     ('add', '--movie', 'Test', '--date', '2026-10-30', '--time', '25:00', '--seat', 'N-20'),
                     ('edit', '99', '--seat', 'N-20'), ('delete', '99')]:
            with self.assertRaises(SystemExit):
                self.run_command(*args)
        self.assertFalse(tracker.DATA.exists())

    def test_menu_adds_a_visit_without_command_flags(self):
        answers = ['1', 'Test movie', '2026-10-30', '19:00', '', '12', 'H-20', 'IMAX GT', 'Good seat', '2', '5']
        with patch('builtins.input', side_effect=answers), contextlib.redirect_stdout(io.StringIO()):
            tracker.interactive()
        self.assertEqual(tracker.read()[0]['seat'], 'H-20')


if __name__ == '__main__':
    unittest.main()
