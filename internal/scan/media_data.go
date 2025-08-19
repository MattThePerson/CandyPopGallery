package scan

import (
	"path"
	"slices"
	"strconv"
	"strings"

	"github.com/MattThePerson/CandyPopGallery/internal/models"
)

// getMediaData
func getMediaData(files_rel []string, base_dir string, post_id string) ([]models.MediaData, error) {

	media := []models.MediaData{}
	slices.Sort(files_rel)

	for i, rel_path := range files_rel {
		abs_path := path.Join(base_dir, rel_path)

		// get file attributes
		file_attr, err := getFileAttributes(abs_path)
		if err != nil {
			return media, err
		}

		//
		media = append(media, models.MediaData{
			MediaID:      post_id + "-" + strconv.Itoa(i+1),
			ItemNum:      i + 1,
			CreationDate: file_attr.CreationDate,
			FilesizeMB:   file_attr.FilesizeMB,
			Suffix:       file_attr.Suffix,
			Type:         file_attr.Type,
			Path:         rel_path,
		})
	}

	return media, nil
}

// FileAttributes
type FileAttributes struct {
	CreationDate string
	FilesizeMB   float64
	Suffix       string
	Type         string
}

// getFileAttributes
func getFileAttributes(path string) (FileAttributes, error) {

	parts := strings.Split(path, ".")
	suffix := parts[len(parts)-1]

	// ...

	return FileAttributes{
		CreationDate: "",
		FilesizeMB:   -1,
		Suffix:       suffix,
		Type:         getTypeBySuffix(suffix),
	}, nil
}

// getTypeBySuffix
func getTypeBySuffix(suff string) string {
	typ := map[string]string{
		"mp4":  "video",
		"webm": "video",
		"png":  "image",
	}[suff]
	if typ != "" {
		return typ
	}
	return "unknown"
}
