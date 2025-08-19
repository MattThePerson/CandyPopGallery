package scan

import (
	"fmt"
	"strings"
)

// hasMatchingSuffix returns true if file suffix in suffixes
func hasMatchingSuffix(path string, suffixes []string) bool {
	for _, suff := range suffixes {
		if strings.HasSuffix(path, suff) {
			return true
		}
	}
	return false
}

// sliceContains
func sliceContains[T comparable](arr []T, item T) bool {
	for _, arr_item := range arr {
		if arr_item == item {
			return true
		}
	}
	return false
}

// limitString
func limitString(str string, lim int) string {
	if len(str) > lim {
		return str[:lim]
	}
	return str
}

// readTxtFileAsList(
func readTxtFileAsList(pth string) ([]string, error) {
	return []string{}, fmt.Errorf("not implemented")
}
