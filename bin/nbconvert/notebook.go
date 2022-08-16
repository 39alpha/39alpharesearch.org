package main

import (
	"archive/zip"
	"fmt"
	"io"
	"os"
	"os/exec"
	"path/filepath"
)

type Language string

const (
	PythonLang     Language = "python"
	JuliaLang               = "julia"
	RLang                   = "r"
	ObservableLang          = "observable"
	UnknownLang             = "unknown"
)

func isNotebook(path string, file os.FileInfo) bool {
	basename := filepath.Base(path)
	return file.Mode().IsRegular() && (basename == notebook_name || basename == quarto_name)
}

type Asset struct {
	path string
	info os.FileInfo
}

type Notebook interface {
	Path() string
	Assets() []*Asset
	AddAsset(*Asset) []*Asset
	IsIgnoredAsset(path string) bool
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
			var nb Notebook

			lang, err := InferLanguage(path)
			if err != nil {
				return err
			}

			switch (lang) {
				case PythonLang:
					nb = &PythonNotebook{path, []*Asset{}}
				case JuliaLang:
					nb = &JuliaNotebook{path, []*Asset{}}
				case RLang:
					nb = &RNotebook{path, []*Asset{}}
				case ObservableLang:
					nb = &ObservableNotebook{path, []*Asset{}}
				default:
					return fmt.Errorf("unable to infer language for notebook %q", path)
			}

			if err = FindAssets(nb); err != nil {
				return err
			}
			notebooks = append(notebooks, nb)
		}
		return nil
	})
	return
}

func InferLanguage(path string) (Language, error) {
	if (IsQuarto(path)) {
		return InferQuartoLanguage(path)
	}
	return InferIpynbLanguage(path)
}

func FindAssets(nb Notebook) error {
	dir := Directory(nb)
	files, err := os.ReadDir(dir)
	if err != nil {
		return err
	}
	for _, file := range files {
		path := AssetPath(nb, file.Name())
		if nb.IsIgnoredAsset(path) {
			continue
		}

		info, err := file.Info()
		if err != nil {
			return err
		}

		if isNotebook(path, info) || file.Name() == checkpoints {
			continue
		}
		nb.AddAsset(&Asset{path, info})
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

	if IsQuarto(nb.Path()) {
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

func RunCommand(nb Notebook, cmd *exec.Cmd) ([]byte, []byte, error) {
	cwd, err := os.Getwd()
	if err != nil {
		return nil, nil, err
	}

	cmd.Dir = filepath.Join(cwd, Directory(nb))

	stdout, err := cmd.StdoutPipe()
	if err != nil {
		return nil, nil, err
	}

	stderr, err := cmd.StderrPipe()
	if err != nil {
		return nil, nil, err
	}

	if err := cmd.Start(); err != nil {
		return nil, nil, err
	}

	o, err := io.ReadAll(stdout)
	if err != nil {
		return nil, nil, err
	}

	e, err := io.ReadAll(stderr)
	if err != nil {
		return nil, nil, err
	}

	if err := cmd.Wait(); err != nil {
		return o, e, err
	}

	return o, e,  nil
}