import sys, os.path
from nbconvert import MarkdownExporter

if len(sys.argv) == 1:
    raise(RuntimeError('at least one juptyer notebook filename must be provided'))

for notebook in sys.argv[1:]:
    #  directory, filename = os.path.split(notebook)
    #  basename, ext = os.path.splitext(filename)
    #
    #  outdir = os.path.join(directory, basename)
    #  outfile = os.path.join(outdir, basename + '.md')
    #
    #  os.makedirs(outdir)

    body, _ = MarkdownExporter().from_filename(notebook)

    print(body)

    #  with open(outfile, 'w') as handle:
    #      handle.write(body)
    #
    #  for filename, data in resources['outputs'].items():
    #      resourcefile = os.path.join(outdir, filename)
    #      with open(resourcefile, 'wb') as handle:
    #          handle.write(data)
