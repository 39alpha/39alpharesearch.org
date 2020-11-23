package main

import (
    "archive/zip"
    "fmt"
    "io"
    "io/ioutil"
    "log"
    "os"
    "os/exec"
    "path/filepath"
    "regexp"
    "text/template"
)

const (
    notebook_path = "notebooks"
    notebook_name = "notebook.ipynb"
    draft_notebook_name = "notebook_draft.ipynb"
    markdown_name = "index.md"
)

var content_root = filepath.Join("content", "notebooks")
var markdown_template = template.Must(template.New("Notebook").Parse(`---
title: {{ .Title }}
draft: {{ .Draft }}
---
{{ .Content }}`))

func PythonExe() string {
    python_exe, err := exec.LookPath("python3")
    if err != nil {
        python_exe, err = exec.LookPath("python")
        if err != nil {
            log.Fatalf("Could not find `python` or `python3` in your PATH; perhaps you need to install it?")
        }
    }
    return python_exe
}

func CopyFile(src, dst string) error {
    in, err := os.Open(src)
    if err != nil {
        return err
    }
    defer in.Close()

    out, err := os.Create(dst)
    if err != nil {
        return err
    }
    defer out.Close()

    _, err = io.Copy(out, in)
    if err != nil {
        return err
    }
    return out.Close()
}

func WriteZip(notebook, content_dir string) error {
    notebook_dir := filepath.Dir(notebook)

    zipfile := filepath.Join(content_dir, "notebook.zip")
    outFile, err := os.Create(zipfile)
    if err != nil {
        return err
    }
    defer outFile.Close()

    w := zip.NewWriter(outFile)

    if err := AddFiles(w, notebook_dir, ""); err != nil {
        return err
    }

    if err = w.Close(); err != nil {
        return err
    }

    return nil
}

func AddFiles(w *zip.Writer, basePath, baseInZip string) error {
    files, err := ioutil.ReadDir(basePath)
    if err != nil {
        return err
    }

    for _, file := range files {
        if !file.IsDir() {
            data, err := ioutil.ReadFile(filepath.Join(basePath, file.Name()))
            if err != nil {
                return err
            }

            f, err := w.Create(filepath.Join(baseInZip, file.Name()))
            if err != nil {
                return err
            }

            _, err = f.Write(data)
            if err != nil {
                return err
            }
        } else if file.IsDir() {
            newBase := filepath.Join(basePath, file.Name())
            AddFiles(w, newBase, filepath.Join(baseInZip, file.Name()))
        }
    }

    return nil
}

func FindNotebooks() (files []string, err error) {
    err = filepath.Walk(notebook_path, func(path string, info os.FileInfo, err error) error {
        if err != nil {
            return err
        }

        basename := filepath.Base(path)
        if info.Mode().IsRegular() && (basename == notebook_name || basename == draft_notebook_name) {
            files = append(files, path)
        }
        return nil
    })
    return files, err
}

type Notebook struct {
    Title string
    Draft bool
    Content string
    Assets []string
}

func ReadNotebook(path string) (*Notebook, error) {
    dir := filepath.Dir(path)

    title := filepath.Base(dir)
    draft := filepath.Base(path) == draft_notebook_name

    cmd := exec.Command(PythonExe(), "bin/jupyter-convert.py", path)

    content, err := cmd.Output()
    if err != nil {
        return nil, err
    }

    re := regexp.MustCompile(`^\s*#[^\n]+`)
    header := re.Find(content)
    if (header != nil ) {
        re = regexp.MustCompile(`#`)
        i := re.FindIndex(header)[0] + 1
        for header[i] == ' ' {
            i += 1
        }
        title = string(header[i:len(header)])
    }

    assets := []string{}
    err = filepath.Walk(dir, func(path string, info os.FileInfo, err error) error {
        if err != nil {
            return err
        }

        basename := filepath.Base(path)
        if info.Mode().IsRegular() && basename != notebook_name && basename != draft_notebook_name {
            assets = append(assets, path)
        }
        return nil
    })

    if err != nil {
        return nil, err
    }

    return &Notebook{ title, draft, string(content), assets }, nil
}

func (nb *Notebook) CopyAssets(dir string) error {
    for _, asset := range nb.Assets {
        dest_dir, err := ContentDir(asset)
        if err != nil {
            return err
        }
        dest := filepath.Join(dest_dir, filepath.Base(asset))
        fmt.Printf("%s → %s\n", asset, dest)
        if err = os.MkdirAll(dest_dir, os.ModeDir|os.ModePerm); err != nil {
            return fmt.Errorf("cannot create asset directory %q: %v", dest_dir, err)
        }

        CopyFile(asset, dest)
    }
    return nil
}

func ContentDir(path string) (string, error) {
    relpath, err := filepath.Rel(notebook_path, path)
    if err != nil {
        return "", err
    }
    relpath = filepath.Dir(relpath)
    return filepath.Join(content_root, relpath), nil
}

func main() {
    if err := os.RemoveAll(content_root); err != nil {
        log.Fatalf("error removing notebooks directory %q: %v\n", content_root, err)
    }

    notebooks, err := FindNotebooks()
    if err != nil {
        log.Fatalf("error finding notebooks; %v\n", err)
    }

    if err = os.MkdirAll(content_root, os.ModeDir|os.ModePerm); err != nil {
        log.Fatalf("error creating notebook content directory: %v\n", err)
    }

    if _, err := os.Create(filepath.Join(content_root, "_index.md")); err != nil {
        log.Fatalf("error creating the notebook listing page: %v\n", err)
    }

    for _, notebook := range notebooks {
        content_dir, err := ContentDir(notebook)
        if err != nil {
            log.Fatalf("error determining content directory for notebook %q: %v\n", notebook, err)
        }
        fmt.Printf("%s → %s\n", notebook, content_dir)
        nb, err := ReadNotebook(notebook)
        if err != nil {
            log.Fatalf("error reading notebook %q: %v\n", notebook, err)
        }

        if err = os.MkdirAll(content_dir, os.ModeDir|os.ModePerm); err != nil {
            log.Fatalf("error creating notebook directory: %v\n", err)
        }

        notebook_filename := filepath.Join(content_dir, markdown_name)
        if file, err := os.Create(notebook_filename); err != nil {
            log.Fatalf("error opening file %q: %v\n", notebook_filename, err)
        } else {
            if err = markdown_template.Execute(file, nb); err != nil {
                log.Fatalf("error executing template: %v\n", err)
            }
            if err = file.Close(); err != nil {
                log.Fatalf("error closing file %q: %v\n", notebook_filename, err)
            }
        }
        nb.CopyAssets(content_dir)

        if err = WriteZip(notebook, content_dir); err != nil {
            log.Fatalf("error writing notebook zip: %v\n", err)
        }
    }
}
