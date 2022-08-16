package main

import (
	"path/filepath"
	"encoding/json"
	"io/ioutil"
)

type KernelSpec struct {
	Language Language `json:"language"`
}

type MetaData struct {
	KernelSpec KernelSpec `json:"kernelspec"`
}

type Ipynb struct {
	MetaData MetaData `json:"metadata"`
}

func IsIpynb(path string) bool {
	return filepath.Ext(path) == ".ipynb"
}

func InferIpynbLanguage(path string) (Language, error) {
	var ipynb Ipynb
	content, err := ioutil.ReadFile(path)
	if err != nil {
		return UnknownLang, err
	}

	if err = json.Unmarshal(content, &ipynb); err != nil {
		return UnknownLang, err
	}

	return ipynb.MetaData.KernelSpec.Language, nil
}
