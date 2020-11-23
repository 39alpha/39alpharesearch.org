import sys, os.path
from nbconvert import MarkdownExporter

if len(sys.argv) == 1:
    raise(RuntimeError('at least one juptyer notebook filename must be provided'))

for notebook in sys.argv[1:]:
    body, _ = MarkdownExporter().from_filename(notebook)
    print(body)
