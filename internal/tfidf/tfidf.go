package tfidf

import (
	"slices"
)

// GetSimilarVids
func GetSimilarPost(target_id string, id_token_map map[string][]string, token_id_map map[string][]string) []string {

	target_tokens := id_token_map[target_id]
	item_scores := map[string]float64{}

	//
	for _, token := range target_tokens {
		token_vids := token_id_map[token]
		n := float64(len(token_vids))
		for _, vid_id := range token_vids {
			item_scores[vid_id] += 1.0 / n
		}
	}

	//
	item_ids := make([]string, 0, len(item_scores))
	i := 0
	for vid_id := range item_scores {
		item_ids[i] = vid_id
		i++
	}

	//
	slices.SortFunc(item_ids, func(a, b string) int {
		return int(item_scores[b] - item_scores[a])
	})

	return item_ids
}
