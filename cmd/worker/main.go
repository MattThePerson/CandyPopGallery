package main

import (
	"encoding/json"
	"fmt"
	"log"

	"github.com/MattThePerson/CandyPopGallery/internal"
	"github.com/MattThePerson/CandyPopGallery/internal/scan"

	"github.com/MattThePerson/string_parser"
)

func main() {

	var err error

	config := internal.GetConfig("config.yaml")

	//
	// start := time.Now()
	err = scan.ScanMediaDirs(config.MediaFolders, config.FilenameFormats, false)
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

// testParser
func testParser(parser *string_parser.StringParser) {

	// TEST: parsing
	data, err := parser.Parse("reddit/pics/[2024-06-16] Trump being a Bafoon (item-1234) [secid69] [sid123].png")
	if err != nil {
		fmt.Println(err)
	}

	// TEST: print data
	f, _ := json.MarshalIndent(data, "", "    ")
	fmt.Printf("DATA: %s\n", string(f))

}
