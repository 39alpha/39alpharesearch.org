package main

import (
	"fmt"
	"log"
	"os"
	"os/exec"
	"path/filepath"
)

func JuliaExe() string {
	julia, err := exec.LookPath("julia")
	if err != nil {
		log.Fatalf("Could not find `julia`; perhaps you need to install it?")
	}
	return julia
}

type JuliaNotebook struct {
	path   string
	assets []*Asset
}

func (nb *JuliaNotebook) Path() string {
	return nb.path
}

func (nb *JuliaNotebook) Assets() []*Asset {
	return nb.assets
}

func (nb *JuliaNotebook) AddAsset(asset *Asset) []*Asset {
	nb.assets = append(nb.assets, asset)
	return nb.assets
}

func (nb *JuliaNotebook) IsIgnoredAsset(path string) bool {
	name := filepath.Base(path)
	switch name {
	case "Manifest.toml":
		return true
	case "Project.toml":
		return true
	default:
		return false
	}
}

func (nb *JuliaNotebook) Instantiate() error {
	if info, err := os.Stat(AssetPath(nb, "Project.toml")); err != nil || !info.Mode().IsRegular() {
		return nil
	}

	cmd := exec.Command(JuliaExe(), "--project=.", "-E", "using Pkg; Pkg.instantiate()")

	_, _, err := RunCommand(nb, cmd)
	if err != nil {
		return fmt.Errorf("failed to instantiate project %q: %v\n", nb.Path(), err)
	}

	return nil
}

func (nb *JuliaNotebook) Render() error {
	if err := nb.Instantiate(); err != nil {
		return err
	}
	return Quarto(nb)
}
