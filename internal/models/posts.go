package models

// PostData
type PostData struct {
	// general
	PostID      string `json:"post_id"`             // source + source_id
	SourceID    string `json:"source_id"`           // unique per source
	SecSourceID string `json:"secondary_source_id"` // unique per source
	URL         string `json:"url"`                 // minimal constructed url

	Title      string `json:"title"`
	UploadDate string `json:"date_uploaded"`

	// metadata
	Source    string `json:"source"`
	Community string `json:"community"` // uploader|subreddit|page

	Tags         []string `json:"tags"`
	ProperTags   []string `json:"improper_tags"`
	ImproperTags []string `json:"proper_tags"`

	// interaction metadata
	Likes    int      `json:"likes"`
	Views    int      `json:"views"`
	Comments []string `json:"comments"`

	// media
	MediaCount int         `json:"media_count"`
	Media      []MediaData `json:"media_data"`
}

// MediaData
type MediaData struct {
	// general
	MediaID      string `json:"media_id"` // PostID + ItemNum
	ItemNum      int    `json:"item_num"`
	CreationDate string `json:"creation_date"` // file ctime

	// media attributes
	FilesizeMB float64 `json:"filesize_mb"`
	Suffix     string  `json:"suffix"`
	Type       string  `json:"type"` // image/video

	Path string `json:"path"` // relative path
}
