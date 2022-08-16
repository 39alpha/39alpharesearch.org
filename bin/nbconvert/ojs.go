package main

type ObservableNotebook struct {
	path  string
	assets []*Asset
}

func (nb *ObservableNotebook) Path() string {
	return nb.path
}

func (nb *ObservableNotebook) Assets() []*Asset {
	return nb.assets
}

func (nb *ObservableNotebook) AddAsset(asset *Asset) []*Asset {
	nb.assets = append(nb.assets, asset)
	return nb.assets
}

func (nb *ObservableNotebook) Render() error {
	return Quarto(nb)
}