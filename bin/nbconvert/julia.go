package main

import (
	"path/filepath"
	"io"
	"os/exec"
	"log"
	"fmt"
	"os"
)

func JuliaExe() string {
	julia, err := exec.LookPath("julia")
	if err != nil {
		log.Fatalf("Could not find `julia`; perhaps you need to install it?")
	}
	return julia
}

type JuliaNotebook struct {
	path  string
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
	switch(name) {
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
	fmt.Printf("Running instantiation on notebook %q\n", nb.Path())

	cwd, err := os.Getwd()
	if err != nil {
		return err
	}

	cmd := exec.Command(JuliaExe(), "--project=.", "-E", "using Pkg; Pkg.instantiate()")
	cmd.Dir = filepath.Join(cwd, Directory(nb))

	stderr, err := cmd.StderrPipe()
	if err != nil {
		return err
	}

	if err := cmd.Start(); err != nil {
		return err
	}

	slurp, err := io.ReadAll(stderr)
	if err != nil {
		return err
	}

	if err := cmd.Wait(); err != nil {
		fmt.Fprintf(os.Stderr, "Notebook %q failed to instantiate\n%s\n", nb.Path(), slurp)
		return err
	}

	return nil
}

func (nb *JuliaNotebook) Render() error {
	if err := nb.Instantiate(); err != nil {
		return err
	}
	return nil
	// return Quarto(nb)
}
