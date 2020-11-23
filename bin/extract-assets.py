import argparse
import nbconvert
import os.path


def notebook_dir(fname):
    return os.path.join("content", os.path.dirname(fname))


def extract_from_notebook(fname, outdir=None):
    if outdir is None:
        outdir = notebook_dir(fname)

    _, resources = nbconvert.MarkdownExporter().from_filename(fname)
    if "outputs" in resources:
        for resource, data in resources["outputs"].items():
            path = os.path.join(outdir, resource)
            print("{}:{} → {}".format(fname, resource, path))
            with open(path, "wb") as handle:
                handle.write(data)


if __name__ == '__main__':
    description = 'Extract output assets from a Jupyter notebook'
    parser = argparse.ArgumentParser(description=description)
    parser.add_argument('--notebook', metavar='N', type=str, nargs=1,
                        help='path to notebook to extract')
    parser.add_argument('--outdir', metavar='O', type=str, nargs='?',
                        help='path into which to output extracted assets')

    args = parser.parse_args()

    extract_from_notebook(args.notebook[0], args.outdir)
