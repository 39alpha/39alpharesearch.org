package main

import (
	"archive/zip"
	"path/filepath"
	"os"
	"os/exec"
	"io"
	"fmt"
	"log"
)

func QuartoExe() string {
	quarto, err := exec.LookPath("quarto")
	if err != nil {
		log.Fatalf("Could not find `quarto`; perhaps you need to install it?")
	}
	return quarto
}

func isNotebook(path string, file os.FileInfo) bool {
	basename := filepath.Base(path)
	return file.Mode().IsRegular() && (basename == notebook_name || basename == quarto_name)
}

type Asset struct {
	path string
	info os.FileInfo
}

type Notebook interface {
	Path()   string
	Assets() []*Asset
	AddAsset(*Asset) []*Asset
	Render() error
}

func BaseName(nb Notebook) string {
	return filepath.Base(nb.Path())
}

func Directory(nb Notebook) string {
	return filepath.Dir(nb.Path())
}

func AssetPath(nb Notebook, path string) string {
	return filepath.Join(Directory(nb), path)
}

func IsQuarto(nb Notebook) bool {
	return BaseName(nb) == quarto_name
}

func Quarto(nb Notebook) error {
	cwd, err := os.Getwd()
	if err != nil {
		return err
	}
	cmd := exec.Command(QuartoExe(), "render", BaseName(nb), "--to=hugo", "--output", markdown_name)
	cmd.Dir = filepath.Join(cwd, Directory(nb))

	stderr, err := cmd.StderrPipe()
	if err != nil {
		return err
	}

	if err := cmd.Start(); err != nil {
		return err
	}

	slurp, _ := io.ReadAll(stderr)

	if err := cmd.Wait(); err != nil {
		fmt.Fprintf(os.Stderr, "Notebook %q failed to build\n%s\n", nb.Path(), slurp)
		return err
	}

	return nil
}

func FindNotebooks() (notebooks []Notebook, err error) {
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
			nb := &ObservableNotebook{path, []*Asset{}}
			if err = FindAssets(nb); err != nil {
				return err
			}
			notebooks = append(notebooks, nb)
		}
		return nil
	})
	return
}

func FindAssets(nb Notebook) error {
	dir := Directory(nb)
	files, err := os.ReadDir(dir)
	if err != nil {
		return err
	}
	for _, file := range files {
		path := AssetPath(nb, file.Name())
		info, err := file.Info()
		if err != nil {
			return err
		}
		if isNotebook(path, info) || file.Name() == checkpoints {
			continue
		}
		nb.AddAsset(&Asset{ path, info })
	}
	return nil
}

func ContentDir(nb Notebook) (string, error) {
	relpath, err := filepath.Rel(notebook_path, nb.Path())
	if err != nil {
		return "", err
	}
	relpath = filepath.Dir(relpath)
	return filepath.Join(content_root, relpath), nil

}

func CopyAssets(nb Notebook) error {
	dest_dir, err := ContentDir(nb)
	if err != nil {
		return err
	}
	for _, asset := range nb.Assets() {
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

func GeneratedAssets(nb Notebook) []*Asset {
	assets := []*Asset{}

	dir := Directory(nb)
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

func MoveGeneratedAssets(nb Notebook) error {
	dest_dir, err := ContentDir(nb)
	if err != nil {
		return err
	}
	for _, asset := range GeneratedAssets(nb) {
		dest := filepath.Join(dest_dir, filepath.Base(asset.path))
		if err := os.Rename(asset.path, dest); err != nil {
			return err
		}
	}
	return nil
}

func Cleanup(nb Notebook) error {
	for _, asset := range GeneratedAssets(nb) {
		if err := os.RemoveAll(asset.path); err != nil {
			return err
		}
	}

	if IsQuarto(nb) {
		return os.RemoveAll(AssetPath(nb, notebook_name))
	}

	return nil
}

func WriteZip(nb Notebook) error {
	notebook_dir := Directory(nb)
	content_dir, err := ContentDir(nb)
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

func Execute(nb Notebook) error {
	content_dir, err := ContentDir(nb)
	if err != nil {
		return fmt.Errorf("error determining content directory for notebook %q: %v\n", nb.Path(), err)
	}

	if err = os.MkdirAll(content_dir, os.ModeDir|os.ModePerm); err != nil {
		return fmt.Errorf("error creating notebook directory: %v\n", err)
	}

	fmt.Printf("Executing notebook %q\n", nb.Path())

	if err = Cleanup(nb); err != nil {
		return fmt.Errorf("error cleaning up generated assets for notebook %q: %v\n", nb.Path(), err)
	}

	if err = CopyAssets(nb); err != nil {
		return fmt.Errorf("error copying assets to content directory for notebook %q: %v\n", nb.Path(), err)
	}

	if err = nb.Render(); err != nil {
		return fmt.Errorf("error converting notebook %q: %v\n", nb.Path(), err)
	}
	defer Cleanup(nb)

	if err = MoveGeneratedAssets(nb); err != nil {
		return fmt.Errorf("error copying generated assets to content directory for notebook %q: %v\n", nb.Path(), err)
	}

	if err = WriteZip(nb); err != nil {
		return fmt.Errorf("error writing notebook zip for notebook %q: %v\n", nb.Path(), err)
	}

	return nil
}
