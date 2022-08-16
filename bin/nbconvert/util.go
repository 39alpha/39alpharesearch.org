package main

import (
	"archive/zip"
	"os"
	"io"
	"os/exec"
	"io/ioutil"
	"path/filepath"
)

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

func CopyDirectory(src, dst string) error {
	cmd := exec.Command("cp", "--recursive", src, dst)
	return cmd.Run()
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