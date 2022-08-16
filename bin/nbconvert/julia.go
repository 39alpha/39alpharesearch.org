package main

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

func (nb *JuliaNotebook) Render() error {
	return Quarto(nb)
}