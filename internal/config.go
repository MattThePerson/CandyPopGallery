package internal

import (
	"bufio"
	"fmt"
	"log"
	"os"
	"strings"

	"gopkg.in/yaml.v3"
)

type Config struct {
	FilenameFormats []string `yaml:"filename_formats"`
	MediaFolders    []string `yaml:"media_folders"`
}

// Get Config struct from .yaml file
func GetConfig(fn string) Config {

	// Read file
	data, err := os.ReadFile(fn)
	if err != nil {
	    return generateConfig(fn)
	}

	// Parse into Config
	c := Config{}

	if err := yaml.Unmarshal([]byte(data), &c); err != nil {
		log.Fatal(err)
	}

	return c
}

func generateConfig(fn string) Config {

    // read media folder from user
    fmt.Print("Enter media folder path: ")
	reader := bufio.NewReader(os.Stdin)
	folder, err := reader.ReadString('\n')
	if err != nil {
		log.Fatal(err)
	}
	folder = strings.TrimSpace(folder)

	// create config obj
	c := Config{
		FilenameFormats: []string{"{source}/{community}/[{date_uploaded}] {title} [{source_id:S}].{ext}"},
		MediaFolders:    []string{folder},
	}

	// marshal and save
	data, err := yaml.Marshal(c)
	if err != nil {
		log.Fatal(err)
	}
	if err := os.WriteFile(fn, data, 0644); err != nil {
		log.Fatal(err)
	}

	fmt.Printf("Config saved to %s\n", fn)
	return c
}
