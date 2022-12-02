package main

import (
	"fmt"
	"log"
	"os"
	"os/exec"
)

func PipenvExe() string {
	pipenv, err := exec.LookPath("pipenv")
	if err != nil {
		log.Fatalf("Could not find `pipenv`; perhaps you need to install it?")
	}
	return pipenv
}

type PythonNotebook struct {
	path   string
	assets []*Asset
}

func (nb *PythonNotebook) Path() string {
	return nb.path
}

func (nb *PythonNotebook) Assets() []*Asset {
	return nb.assets
}

func (nb *PythonNotebook) AddAsset(asset *Asset) []*Asset {
	nb.assets = append(nb.assets, asset)
	return nb.assets
}

func (nb *PythonNotebook) Instantiate() (bool, error) {
	var cmd *exec.Cmd = nil

	if info, err := os.Stat(AssetPath(nb, "Pipfile")); err == nil && info.Mode().IsRegular() {
		cmd = exec.Command(PipenvExe(), "install")
	} else if info, err := os.Stat(AssetPath(nb, "requirements.txt")); err == nil && info.Mode().IsRegular()  {
		cmd = exec.Command(PipenvExe(), "install", "-r", "requirements.txt")
	}

	if cmd != nil {
		_, _, err := RunCommand(nb, cmd)
		if err != nil {
			return false, fmt.Errorf("failed to instantiate project %q: %v\n", nb.Path(), err)
		}
		return true, nil
	}

	return false, nil
}

func (nb *PythonNotebook) Pipenv() error {
	cmd := exec.Command(PipenvExe(), "--bare", "run", QuartoExe(), "render", BaseName(nb), "--to=hugo", "--output", markdown_name)

	_, _, err := RunCommand(nb, cmd)

	return err
}

func (nb *PythonNotebook) Render() error {
	if isPipenv, err := nb.Instantiate(); err != nil {
		return err
	} else if isPipenv {
		return nb.Pipenv()
	} else {
		return Quarto(nb)
	}
}

func (nb *PythonNotebook) IsIgnoredAsset(path string) bool {
	return false
}
