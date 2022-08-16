package main

import (
	"path/filepath"
	"log"
	"os/exec"
	"regexp"
	"io/ioutil"
	"bytes"
	"fmt"
)

func IsQuarto(path string) bool {
	return filepath.Ext(path) == ".qmd"
}

func QuartoExe() string {
	quarto, err := exec.LookPath("quarto")
	if err != nil {
		log.Fatalf("Could not find `quarto`; perhaps you need to install it?")
	}
	return quarto
}

func Quarto(nb Notebook) error {
	cmd := exec.Command(QuartoExe(), "render", BaseName(nb), "--to=hugo", "--output", markdown_name)

	_, _, err := RunCommand(nb, cmd)

	return err
}

func InferQuartoLanguage(path string) (Language, error) {
	content, err := ioutil.ReadFile(path)
	if err != nil {
		return UnknownLang, err
	}

	lang, err := InferQuartoLanguageFromHeader(content)
	if err != nil {
		return lang, err
	}

	return InferQuartoLanguageFromBody(content)
	if err != nil {
		return lang, err
	}

	return ObservableLang, nil
}

func InferQuartoLanguageFromHeader(content []byte) (Language, error) {
	kernelpattern := regexp.MustCompile("jupyter: (.*)")
	match := kernelpattern.FindSubmatch(content)
	if match != nil {
		return Language(bytes.TrimSpace(match[1])), nil
	}
	return UnknownLang, nil
}

func InferQuartoLanguageFromBody(content []byte) (Language, error) {
	langs := map[Language]bool{}
	langsWithEnv := 0

	kernelpattern := regexp.MustCompile("```{(.*)}")
	matches := kernelpattern.FindAllSubmatch(content, -1)
	if matches != nil {
		for _, match := range matches {
			lang := LangFromQuarto(match[1])
			if _, ok := langs[lang]; !ok && lang != ObservableLang && lang != UnknownLang {
				langsWithEnv += 1
			}
			langs[lang] = true
		}
	}

	if langsWithEnv > 1 {
		return UnknownLang, fmt.Errorf("mixed languages in notebook")
	}

	if _, ok := langs[PythonLang]; ok {
		return PythonLang, nil
	} else if _, ok := langs[JuliaLang]; ok {
		return JuliaLang, nil
	} else if _, ok := langs[RLang]; ok {
		return RLang, nil
	} else if _, ok := langs[ObservableLang]; ok {
		return ObservableLang, nil
	}

	return UnknownLang, nil
}

func LangFromQuarto(blang []byte) Language {
	lang := string(bytes.ToLower(bytes.TrimSpace(blang)))
	switch(lang) {
		case "python":
			return PythonLang
		case "julia":
			return JuliaLang
		case "r":
			return RLang
		case "ojs":
			return ObservableLang
		default:
			return UnknownLang
	}
}