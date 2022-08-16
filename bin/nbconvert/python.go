package main

type PythonNotebook struct {
	path  string
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

func (nb *PythonNotebook) Render() error {
	return Quarto(nb)
}

func (nb *PythonNotebook) IsIgnoredAsset(path string) bool {
	return false
}
