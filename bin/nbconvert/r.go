package main

type RNotebook struct {
	path   string
	assets []*Asset
}

func (nb *RNotebook) Path() string {
	return nb.path
}

func (nb *RNotebook) Assets() []*Asset {
	return nb.assets
}

func (nb *RNotebook) AddAsset(asset *Asset) []*Asset {
	nb.assets = append(nb.assets, asset)
	return nb.assets
}

func (nb *RNotebook) Render() error {
	return Quarto(nb)
}

func (nb *RNotebook) IsIgnoredAsset(path string) bool {
	return false
}
