package scan

import (
	"fmt"
	"io/fs"
	"path/filepath"
	"strings"

	"github.com/MattThePerson/CandyPopGallery/internal/models"
)

// SIMPLE
// step 1: get list of media (jpg, jpeg, png, webm, webp, mp4, gif)
// step 2: extract post_id (from source_id and source) and paths by post
// step 3: parse media info and get metadata
//

var (
	MediaSuffixes = []string{
		// Images
		".jpg", ".jpeg", ".png", ".gif", ".webp", ".avif",

		// Video
		".mp4", ".webm", ".ogg", // OGV video
	}
)

func ScanMediaDirs(dirs []string, filename_formats []string, rescan bool) error {

	// Step 0: Get existing path objects from db
	existing_posts := map[string]models.PostData{}

	// Step 1: get media files from mediadirs
	media_files, err := getFilesWithSuffixes(dirs, MediaSuffixes)
	if err != nil {
		return err
	}

	// Step 2: group media files into posts
	post_files, err := groupFilesIntoPosts(media_files)
	if err != nil {
		return err
	}

	// Step 3: get post objects
	found_posts := map[string]models.PostData{}
	new_post_files := map[string][]string{}
	if !rescan {
		new_post_files, found_posts = filterExistingPosts(post_files, existing_posts)
	} else {
		new_post_files = post_files
	}
	// post_objects := map[string]models.PostData{}
	new_post_objects, err := generatePostObjects(new_post_files, filename_formats)
	if err != nil {
		return err
	}

	// Step 4: update db
	fmt.Println(len(new_post_objects))
	fmt.Println(len(found_posts))

	return nil
}

// getMediaFiles returns all the media paths from a list of base folders.
func getFilesWithSuffixes(dirs []string, suffixes []string) ([]string, error) {

	media_paths := make([]string, 0, 10000)
	queue := []string{}
	queue = append(queue, dirs...)

	fmt.Println("  SCANNING DIRS ...")
	for len(queue) > 0 {

		var curdir = queue[0]
		queue = queue[1:]

		fmt.Printf("queue=%d  paths=%d  curdir=\"%s\"\n", len(queue)+1, len(media_paths), curdir)

		// walk items in curdir
		err := filepath.WalkDir(curdir, func(path string, d fs.DirEntry, err error) error {
			if err != nil {
				return err
			}
			if path == curdir {
				return nil
			}
			if d.IsDir() {
				queue = append(queue, path)
				return nil
			}
			if hasMatchingSuffix(path, suffixes) {
				media_paths = append(media_paths, path)
			}
			return nil
		})
		if err != nil {
			return media_paths, err
		}
		/* end while */
	}

	fmt.Printf("\nMEDIA PATHS SCANNED: %d\n", len(media_paths))
	return media_paths, nil
}

// hasMatchingSuffix returns true if file suffix in suffixes
func hasMatchingSuffix(path string, suffixes []string) bool {
	for _, suff := range suffixes {
		if strings.HasSuffix(path, suff) {
			return true
		}
	}
	return false
}

// groupFilesIntoPosts
func groupFilesIntoPosts(media_files []string) (map[string][]string, error) {

	post_files := map[string][]string{}

	for _, path := range media_files {
		fmt.Println(path)
		break
	}

	return post_files, nil
}

// filterExistingPosts
func filterExistingPosts(post_files map[string][]string, existing_posts map[string]models.PostData) (map[string][]string, map[string]models.PostData) {

	new_post_files := map[string][]string{}
	found_posts := map[string]models.PostData{}

	for post_id, files := range post_files {
		post_obj, ok := existing_posts[post_id]
		if !ok {
			new_post_files[post_id] = files
		} else {
			found_posts[post_id] = post_obj
		}
	}

	return new_post_files, found_posts
}

// generatePostObjects
func generatePostObjects(new_post_files map[string][]string, filename_formats []string) (map[string]models.PostData, error) {

	post_objects := map[string]models.PostData{}

	return post_objects, nil
}
