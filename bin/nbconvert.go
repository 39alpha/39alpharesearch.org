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
	"sync"
)

const (
	checkpoints      = ".ipynb_checkpoints"
	notebook_path    = "notebooks"
	notebook_name    = "notebook.ipynb"
	quarto_name      = "notebook.qmd"
	markdown_name    = "index.md"
	generated_assets = "notebook_files"
)

var content_root = filepath.Join("content", "notebooks")

func QuartoExe() string {
	quarto, err := exec.LookPath("quarto")
	if err != nil {
		log.Fatalf("Could not find `quarto`; perhaps you need to install it?")
	}
	return quarto
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

// I don't really like making a call out to cp for this, but I don't
// want to spend time writing a go version right now.
func CopyDirectory(src, dst string) error {
	cmd := exec.Command("cp", "--recursive", src, dst)
	return cmd.Run()
}

func (nb *Notebook) WriteZip() error {
	notebook_dir := nb.Directory()
	content_dir, err := nb.ContentDir()
	if err != nil {
		return nil
	}

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
		} else if file.IsDir() && file.Name() != checkpoints {
			newBase := filepath.Join(basePath, file.Name())
			AddFiles(w, newBase, filepath.Join(baseInZip, file.Name()))
		}
	}

	return nil
}

func isNotebook(path string, file os.FileInfo) bool {
	basename := filepath.Base(path)
	return file.Mode().IsRegular() && (basename == notebook_name || basename == quarto_name)
}

type Asset struct {
	path string
	info os.FileInfo
}

type Notebook struct {
	path   string
	assets []*Asset
}

func FindNotebooks() (notebooks []*Notebook, err error) {
	err = filepath.WalkDir(notebook_path, func(path string, entry os.DirEntry, err error) error {
		if err != nil {
			return err
		}

		if entry.IsDir() {
			return nil
		}

		info, err := entry.Info()
		if err != nil {
			return err
		}

		if isNotebook(path, info) {
			nb := &Notebook{path, []*Asset{}}
			if err = nb.FindAssets(); err != nil {
				return err
			}
			notebooks = append(notebooks, nb)
		}
		return nil
	})
	return
}

func (nb *Notebook) FindAssets() error {
	dir := nb.Directory()
	files, err := os.ReadDir(dir)
	if err != nil {
		return err
	}
	for _, file := range files {
		path := nb.AssetPath(file.Name())
		info, err := file.Info()
		if err != nil {
			return err
		}
		if isNotebook(path, info) || file.Name() == checkpoints {
			continue
		}
		nb.assets = append(nb.assets, &Asset{path, info})
	}
	return nil
}

func (nb *Notebook) ContentDir() (string, error) {
	return ContentDir(nb.path)
}

func (nb *Notebook) Render() error {
	cwd, err := os.Getwd()
	if err != nil {
		return err
	}
	cmd := exec.Command(QuartoExe(), "render", nb.BaseName(), "--to=hugo", "--output", markdown_name)
	cmd.Dir = filepath.Join(cwd, nb.Directory())
	return cmd.Run()
}

func (nb *Notebook) CopyAssets() error {
	dest_dir, err := nb.ContentDir()
	if err != nil {
		return err
	}
	for _, asset := range nb.assets {
		dest := filepath.Join(dest_dir, filepath.Base(asset.path))
		if err = os.MkdirAll(dest_dir, os.ModeDir|os.ModePerm); err != nil {
			return fmt.Errorf("cannot create asset directory %q: %v", dest_dir, err)
		}

		if asset.info.IsDir() {
			CopyDirectory(asset.path, dest)
		} else {
			CopyFile(asset.path, dest)
		}
	}
	return nil
}

func (nb *Notebook) Directory() string {
	return filepath.Dir(nb.path)
}

func (nb *Notebook) GeneratedAssets() []*Asset {
	assets := []*Asset{}

	dir := nb.Directory()
	paths := []string{
		filepath.Join(dir, markdown_name),
		filepath.Join(dir, generated_assets),
	}

	for _, path := range paths {
		if info, err := os.Stat(path); err == nil {
			assets = append(assets, &Asset{path, info})
		}
	}

	return assets
}

func (nb *Notebook) MoveGeneratedAssets() error {
	dest_dir, err := nb.ContentDir()
	if err != nil {
		return err
	}
	for _, asset := range nb.GeneratedAssets() {
		dest := filepath.Join(dest_dir, filepath.Base(asset.path))
		if err := os.Rename(asset.path, dest); err != nil {
			return err
		}
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

func (nb *Notebook) Cleanup() error {
	for _, asset := range nb.GeneratedAssets() {
		if err := os.RemoveAll(asset.path); err != nil {
			return err
		}
	}

	if nb.IsQuarto() {
		return os.RemoveAll(nb.AssetPath(notebook_name))
	}

	return nil
}

func (nb *Notebook) BaseName() string {
	return filepath.Base(nb.path)
}

func (nb *Notebook) AssetPath(path string) string {
	return filepath.Join(nb.Directory(), path)
}

func (nb *Notebook) IsQuarto() bool {
	return nb.BaseName() == quarto_name
}

func (nb *Notebook) Execute() error {
	content_dir, err := nb.ContentDir()
	if err != nil {
		return fmt.Errorf("error determining content directory for notebook %q: %v\n", nb.path, err)
	}

	if err = os.MkdirAll(content_dir, os.ModeDir|os.ModePerm); err != nil {
		return fmt.Errorf("error creating notebook directory: %v\n", err)
	}

	fmt.Printf("%s → %s\n", nb.path, content_dir)

	err = nb.CopyAssets()
	if err != nil {
		return fmt.Errorf("error copying assets to content directory for notebook %q: %v\n", nb.path, err)
	}

	err = nb.Render()
	if err != nil {
		return fmt.Errorf("error converting notebook %q: %v\n", nb.path, err)
	}
	defer nb.Cleanup()

	err = nb.MoveGeneratedAssets()
	if err != nil {
		return fmt.Errorf("error copying generated assets to content directory for notebook %q: %v\n", nb.path, err)
	}

	if err = nb.WriteZip(); err != nil {
		return fmt.Errorf("error writing notebook zip: %v\n", err)
	}

	return nil
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

	var wg sync.WaitGroup

	for _, notebook := range notebooks {
		wg.Add(1)
		go func(nb *Notebook) {
			defer wg.Done()
			if err := nb.Execute(); err != nil {
				fmt.Fprintf(os.Stderr, "%v\n", err)
			}
		}(notebook)
	}

	wg.Wait()
}
