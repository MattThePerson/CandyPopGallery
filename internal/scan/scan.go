package scan

import (
	"encoding/json"
	"fmt"
	"io/fs"
	"maps"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/MattThePerson/CandyPopGallery/internal"
	"github.com/MattThePerson/CandyPopGallery/internal/models"
	"github.com/MattThePerson/string_parser"
)

// SIMPLE
// STEP 1: get list of media (jpg, jpeg, png, webm, webp, mp4, gif)
// STEP 2: extract post_id (from source_id and source) and paths by post
// STEP 3: parse media info and get metadata
//

var (
	MediaSuffixes = []string{
		// Images
		".jpg", ".jpeg", ".png", ".gif", ".webp", ".avif",

		// Video
		".mp4", ".webm", ".ogg", // OGV video
	}
)

// ScanMediaDirs will
func ScanMediaDirs(base_dirs []string, filename_formats []string, rescan bool) error {

	// STEP 1: get media files from mediadirs
	fmt.Printf("[STEP 1] getting media files from %d base dirs\n", len(base_dirs))
	start := time.Now()
	media_files, err := getFilesWithSuffixes(base_dirs, MediaSuffixes)
	if err != nil {
		return err
	}
	fmt.Printf("\rDONE. Found %d media paths (took %.1fs)\n", len(media_files), time.Since(start).Seconds())

	// STEP 2: group media files into posts
	fmt.Printf("[STEP 2] Grouping files into posts\n")
	post_files, err := groupFilesIntoPostFileObjects(media_files, base_dirs)
	if err != nil {
		return err
	}

	// get posts from db
	post_from_db := map[string]models.PostData{} // TODO: read from db

	// STEP 3: get post objects
	existing_posts := map[string]models.PostData{}
	new_post_files := post_files
	if !rescan {
		new_post_files, existing_posts = filterExistingPosts(post_files, post_from_db)
	}

	// generate post objects for novel posts
	fmt.Printf("[STEP 3] generating post objects\n")
	start = time.Now()
	new_post_objects, err := generatePostObjects(new_post_files, filename_formats)
	if err != nil {
		return err
	}
	if len(new_post_objects) == 0 {
		fmt.Println("No new post objects generated")
		return nil
	}
	tt := time.Since(start)
	fmt.Printf("DONE. Generated %d post objects (took %.2f s, %.3f ms/item)\n", len(new_post_objects), tt.Seconds(), float64(tt.Microseconds())/1000/float64(len(new_post_objects)))

	// TEMP: print post object
	for _, obj := range new_post_objects {
		js, _ := json.MarshalIndent(obj, "", "    ")
		fmt.Printf("OBJ: %s\n", string(js))
		break
	}

	// STEP 4: update db
	// ...
	fmt.Printf("new_post_objects: %d\n", len(new_post_objects))
	fmt.Printf("existing_posts: %d\n", len(existing_posts))

	return nil
}

// getMediaFiles returns all the media paths from a list of base folders.
func getFilesWithSuffixes(dirs []string, suffixes []string) ([]string, error) {

	media_paths := []string{}

	for idx, base_dir := range dirs {
		fmt.Printf("BASE DIR (%d/%d) \"%s\"\n", idx+1, len(dirs), base_dir)

		// handle_path function
		handlePath_func := func(path string, d fs.DirEntry, err error) error {
			fmt.Printf("\r(media_found: %d) looking in: \"%-160s\"", len(media_paths), limitString(filepath.Dir(path), 160))
			if err != nil {
				return err
			}
			if !d.IsDir() && hasMatchingSuffix(path, suffixes) {
				// rel_path := strings.ReplaceAll(path, base_dir, "")
				media_paths = append(media_paths, path)
			}
			return nil
		}

		// walk items in curdir
		err := filepath.WalkDir(base_dir, handlePath_func)
		if err != nil {
			return media_paths, err
		}
		fmt.Printf("\r%-160s", "")
	}

	return media_paths, nil
}

type PostFiles struct {
	BaseDir   string
	Dirname   string
	FirstFile string
	FilesRel  []string
	FilesAbs  []string
}

// groupFilesIntoPosts
func groupFilesIntoPostFileObjects(media_files []string, base_dirs []string) (map[string]PostFiles, error) {

	post_files_objects := map[string]PostFiles{}

	// group paths by post
	post_paths, err := groupPathsByPost(media_files)
	if err != nil {
		return post_files_objects, err
	}

	// generate post files objects
	post_files_objects = generatePostFileObjects(post_paths, base_dirs)

	return post_files_objects, nil
}

// groupPathsByPost groups each path with the same post id
func groupPathsByPost(media_files []string) (map[string][]string, error) {

	post_paths := map[string][]string{}

	id_formats := []string{
		"{stuff} [{sid}].{ext}",
		"{stuff} [{sid}] #{tags}.{ext}",
		"{stuff} {{sid}}.{ext}",
	}
	id_parser := string_parser.NewStringParserFromList(id_formats)

	for _, path := range media_files {

		// extract sid from path
		d, err := id_parser.Parse(path)
		if err != nil {
			return post_paths, err
		}
		val := d["sid"]
		if val == nil { // TODO: Think about better handling for legit non sid situations
			return post_paths, fmt.Errorf("parse issue: sid not in parsed data")
		}
		sid := val.(string)

		// get pid (post id)
		src := strings.ToLower(filepath.Base(filepath.Dir(filepath.Dir(path))))
		pid := src + "-" + sid

		// add path to map
		arr := post_paths[pid]
		if arr == nil {
			arr = []string{}
		}
		post_paths[pid] = append(arr, path)
	}
	return post_paths, nil
}

// getPostFileStructs
func generatePostFileObjects(post_files map[string][]string, base_dirs []string) map[string]PostFiles {

	// get base dirs func
	getBaseDir := func(file string, base_dirs []string) string {
		for _, dir := range base_dirs {
			if strings.Contains(file, dir) {
				return dir
			}
		}
		return ""
	}

	// getFilesRel
	getFilesRel := func(files []string, base_dir string) []string {
		for i, file := range files {
			file = strings.ReplaceAll(file, base_dir, "")
			file = strings.ReplaceAll(file, "\\", "/")
			files[i] = file[1:]
		}
		return files
	}

	// get post file structs
	post_file_structs := map[string]PostFiles{}
	for pid, files := range post_files {
		base_dir := getBaseDir(files[0], base_dirs)
		post_file_structs[pid] = PostFiles{
			BaseDir:   base_dir,
			Dirname:   filepath.Dir(files[0]),
			FirstFile: files[0],
			FilesRel:  getFilesRel(files, base_dir),
			FilesAbs:  files,
		}
	}
	return post_file_structs
}

// filterExistingPosts
func filterExistingPosts(post_files map[string]PostFiles, db_posts map[string]models.PostData) (map[string]PostFiles, map[string]models.PostData) {

	new_post_files := map[string]PostFiles{}
	existing_posts := map[string]models.PostData{}

	for pid, post_files_obj := range post_files {
		post_obj, ok := db_posts[pid]
		if !ok {
			new_post_files[pid] = post_files_obj
		} else {
			existing_posts[pid] = post_obj
		}
	}

	return new_post_files, existing_posts
}

// generatePostObjects
func generatePostObjects(post_files map[string]PostFiles, base_filename_formats []string) (map[string]models.PostData, error) {

	post_objects := map[string]models.PostData{}

	parsers_map := getParsersMap(post_files, base_filename_formats)

	// for each list of files
	i := 0
	for pid, post_file_obj := range post_files {
		i++
		fmt.Printf("\rgenerating post data (%d/%d) (%.1f%%): [%s]  %-120s",
			i, len(post_files), (float64(i) / float64(len(post_files)) * 100), pid, limitString(filepath.Base(post_file_obj.FirstFile), 120))

		// parse data from first filename
		parser := parsers_map[post_file_obj.Dirname]
		dt, err := parser.Parse(post_file_obj.FirstFile)
		if err != nil {
			return post_objects, err
		}

		// get ids
		// TODO: Handle source_id == nil situation
		val := dt["source_id"]
		sid := val.(string)

		// get metadata from json files
		meta_dt, err := getJsonMetadata(sid, post_file_obj.Dirname)
		if err != nil {
			return post_objects, err
		}
		maps.Copy(meta_dt, dt) // HUOM: meta_dt will override dt fields

		// get media data from filenames
		media, err := getMediaData(post_file_obj.FilesRel, post_file_obj.BaseDir, pid)
		if err != nil {
			return post_objects, err
		}

		// create post data object
		pd, err := createPostDataObject(pid, dt, media)
		if err != nil {
			return post_objects, err
		}

		post_objects[pid] = pd
	}
	fmt.Printf("\r%-200s", "")
	return post_objects, nil
}

// createPostDataObject
func createPostDataObject(pid string, dt map[string]any, media []models.MediaData) (models.PostData, error) {

	pd := models.PostData{}

	// marshal data
	dt_bytes, err := json.Marshal(dt)
	if err != nil {
		return pd, err
	}

	// unmarshal to PostData
	err = json.Unmarshal(dt_bytes, &pd)
	if err != nil {
		return pd, err
	}

	// manual adding
	pd.PostID = pid
	pd.Media = media
	pd.MediaCount = len(media)
	pd.URL = "minimal/constructed/url/sid"

	return pd, nil
}

// getParsersMap will find filename formats in all dirs and get custom parsers
func getParsersMap(post_files map[string]PostFiles, base_filename_formats []string) map[string]*string_parser.StringParser {
	mp := map[string]*string_parser.StringParser{}

	// get dirnames
	dirnames := internal.NewSet()
	for _, obj := range post_files {
		dirnames.Add(obj.Dirname)
	}

	// find filename formats
	for _, dirname := range dirnames.List() {
		ff_paths := []string{
			dirname + "/filename_formats.txt",
			dirname + "/.metadata/filename_formats.txt",
		}
		custom_ff_used := false
		for _, pth := range ff_paths {
			if _, err := os.Stat(pth); err != nil {
				list, err := readTxtFileAsList(pth)
				if err == nil {
					mp[dirname] = string_parser.NewStringParserFromList(list)
					custom_ff_used = true
				}
			}
		}

		//
		if !custom_ff_used {
			mp[dirname] = string_parser.NewStringParserFromList(base_filename_formats)
		}
	}

	return mp
}
