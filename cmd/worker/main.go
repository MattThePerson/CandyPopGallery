package main

import (
	"log"

	"github.com/MattThePerson/CandyPopGallery/internal"
	"github.com/MattThePerson/CandyPopGallery/internal/scan"
)

func main() {

	config := internal.GetConfig("config.yaml")

	// start := time.Now()
	err := scan.ScanMediaDirs(config.MediaFolders, config.FilenameFormats, false)
	if err != nil {
		log.Fatal(err)
	}
	// tt := time.Since(start)
	// if len(media_paths) == 0 {
	// 	fmt.Println("No media paths scanned")
	// } else {
	// 	fmt.Printf("Scanned %d media paths. Took %.2fs (%.2f ms/path)\n", len(media_paths), tt.Seconds(), float64(tt.Milliseconds())/float64(len(media_paths)))
	// }

}
