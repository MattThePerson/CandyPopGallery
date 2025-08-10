package main

import (
	"log"
	"os"

	"gopkg.in/yaml.v3"
)

type Config struct {
	FilenameFormats []string
	MediaFolders    []string
}

// Get Config struct from .yaml file
func GetConfig(fn string) Config {

	// Read file
	data, err := os.ReadFile(fn)
	if err != nil {
		log.Fatal(err)
	}

	// Parse into Config
	c := Config{}

	if err := yaml.Unmarshal([]byte(data), &c); err != nil {
		log.Fatal(err)
	}

	return c
}
