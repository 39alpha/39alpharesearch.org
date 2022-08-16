package main

import (
	"fmt"
	"log"
	"os"
	"path/filepath"
	"sync"
)

const (
	checkpoints      = ".ipynb_checkpoints"
	notebook_path    = "notebooks"
	notebook_name    = "notebook.ipynb"
	quarto_name      = "notebook.qmd"
	markdown_name    = "index.md"
	generated_assets = "notebook_files"
)

var content_root = filepath.Join("content", "notebooks")

func main() {
	if err := os.RemoveAll(content_root); err != nil {
		log.Fatalf("error removing notebooks directory %q: %v\n", content_root, err)
	}

	notebooks, err := FindNotebooks()
	if err != nil {
		log.Fatalf("error finding notebooks; %v\n", err)
	}

	if err = os.MkdirAll(content_root, os.ModeDir|os.ModePerm); err != nil {
		log.Fatalf("error creating notebook content directory: %v\n", err)
	}

	if _, err := os.Create(filepath.Join(content_root, "_index.md")); err != nil {
		log.Fatalf("error creating the notebook listing page: %v\n", err)
	}

	var wg sync.WaitGroup

	for _, notebook := range notebooks {
		wg.Add(1)
		go func(nb Notebook) {
			defer wg.Done()
			if err := Execute(nb); err != nil {
				fmt.Fprintf(os.Stderr, "%v\n", err)
			}
		}(notebook)
	}

	wg.Wait()
}
