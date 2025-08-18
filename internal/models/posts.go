package models

// PostData
type PostData struct {
	// general
	PostID   string // source + source_id
	SourceID string // unique per source
	URL      string // minimal constructed url

	Title      string
	UploadDate string

	// metadata
	Source    string
	Community string // uploader|subreddit|page

	Tags         []string
	ProperTags   []string
	ImproperTags []string

	// interaction metadata
	Likes    int
	Views    int
	Comments []string

	// media
	MediaCount int
	Media      []MediaData
}

// MediaData
type MediaData struct {
	// general
	MediaID      string // PostID + ItemNum
	ItemNum      int
	CreationDate string

	// media attributes
	FilesizeMB float64
	Type       string // image/video
	Suffix     string

	Path string `json:"path"` // relative path
}
