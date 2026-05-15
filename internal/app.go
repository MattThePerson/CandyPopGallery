package internal

import (
    "os"
    "path/filepath"
    "database/sql"
    "bufio"
    "fmt"
    "log"
    "strings"
    "gopkg.in/yaml.v3"

    _ "modernc.org/sqlite"
)

type Config struct {
    MediaDirs       []string `yaml:"media_dirs"       json:"media_dirs"`
    FilenameFormats []string `yaml:"filename_formats" json:"filename_formats"`
}

func (c Config) Validate() error {
    if len(c.MediaDirs) == 0 {
        return fmt.Errorf("media dirs cannot be empty")
    }
    if len(c.FilenameFormats) == 0 {
        return fmt.Errorf("filename formats cannot be empty")
    }
    return nil
}

type App struct {
    AppDataDir      string
    PreviewMediaDir string
    ServerPort      int
    DB              *sql.DB
    Config          *Config
}

func defaultDataDir() string {
    base, _ := os.UserConfigDir() // ~/.config on Linux, %AppData% on Windows
    return filepath.Join(base, "CandyPopGallery")
}

func LoadApp(port int) (App, func()) {
	app := App{}
	app.AppDataDir = defaultDataDir()
	app.PreviewMediaDir = filepath.Join(app.AppDataDir, "preview_media")
	app.ServerPort = port

	// create AppDataDir
	if _, err := os.Stat(app.AppDataDir); os.IsNotExist(err) {
		fmt.Printf("creating AppDataDir: \"%s\"\n", app.AppDataDir)
		err := os.MkdirAll(app.AppDataDir, 0755)
		if err != nil {
			panic(err)
		}
	}

	// open db
	db, err := sql.Open("sqlite", filepath.Join(app.AppDataDir, "app.db"))
	if err != nil {
		log.Fatal("unable to open database: ", err)
	}
	app.DB = db

	// read config.yaml
	config, err := ReadConfigFromYaml(app.AppDataDir)
	if err != nil {
		log.Fatal("failed to read config: ", err)
	}
	app.Config = config

	return app, func() { db.Close() }
}

// ReadConfig reads the contents of `$AppDataDir/config.yaml` into a Config struct
func ReadConfigFromYaml(app_data_dir string) (*Config, error) {

    // check file exists
    fn := filepath.Join(app_data_dir, "config.yaml")
    data, err := os.ReadFile(fn)
    if err != nil {
        return nil, nil
    }

    // unmarshal
    c := Config{}
    if err := yaml.Unmarshal([]byte(data), &c); err != nil {
        return nil, err
    }
    if err := c.Validate(); err != nil {
        return nil, err
    }

    return &c, nil
}

func WriteConfigToYaml(c Config, app_data_dir string) error {

    data, err := yaml.Marshal(&c)
    if err != nil {
        panic(err)
    }

    fn := filepath.Join(app_data_dir, "config.yaml")
    if err := os.WriteFile(fn, data, 0755); err != nil {
        panic(err)
    }

    return nil
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
		MediaDirs:    []string{folder},
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

func GetDefaultConfig() Config {
    return Config{
        FilenameFormats: []string{
            "{source}/{community}/[{date_uploaded}] {title} [{source_id:S}].{ext}",
        },
        MediaDirs: []string{},
    }
}
